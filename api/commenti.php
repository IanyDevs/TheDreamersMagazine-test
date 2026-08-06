<?php
/* ==============================================================================
   API PHP PER LA GESTIONE DEI COMMENTI MODERATI
   Progetto: The Dreamers Magazine
   ============================================================================== */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Controllo timeout inattività sessione (2 ore = 7200 secondi)
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 7200)) {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    } else {
        $_SESSION['last_activity'] = time();
    }
}

header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurazione DB
$isLocal = false;
$serverName = $_SERVER['SERVER_NAME'] ?? '';
$httpHost = $_SERVER['HTTP_HOST'] ?? '';
$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';

if ($serverName === 'localhost' || $serverName === '127.0.0.1' || $remoteAddr === '127.0.0.1' || $remoteAddr === '::1' || strpos($httpHost, 'localhost') !== false || strpos($httpHost, '127.0.0.1') !== false) {
    $isLocal = true;
}

if ($isLocal && file_exists(__DIR__ . '/db_config_local.php')) {
    require_once __DIR__ . '/db_config_local.php';
} else if (file_exists(__DIR__ . '/db_config.php')) {
    require_once __DIR__ . '/db_config.php';
}

$action = $_GET['action'] ?? 'list_public';

// ------------------------------------------------------------------------------
// Inizializzazione Tabella Commenti
// ------------------------------------------------------------------------------
if (isset($pdo)) {
    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `tdm_comments` (
                `id` INTEGER PRIMARY KEY AUTOINCREMENT,
                `article_id` TEXT NOT NULL,
                `author_name` TEXT NOT NULL,
                `author_email` TEXT NOT NULL,
                `content` TEXT NOT NULL,
                `status` TEXT DEFAULT 'pending',
                `created_at` TEXT DEFAULT CURRENT_TIMESTAMP
            )");
        } else {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `tdm_comments` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `article_id` VARCHAR(100) NOT NULL,
                `author_name` VARCHAR(150) NOT NULL,
                `author_email` VARCHAR(150) NOT NULL,
                `content` TEXT NOT NULL,
                `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }
        
        // Migrazione automatica: se la tabella esisteva già ma senza la colonna author_email
        try {
            if ($driver === 'sqlite') {
                $pdo->exec("ALTER TABLE `tdm_comments` ADD COLUMN `author_email` TEXT DEFAULT ''");
            } else {
                $pdo->exec("ALTER TABLE `tdm_comments` ADD COLUMN `author_email` VARCHAR(150) NOT NULL DEFAULT ''");
            }
        } catch (Exception $migrEx) {
            // Colonna già esistente o errore ignorabile
        }
    } catch (Exception $e) {
        // Tabella già presente
    }
} else {
    // Se non c'è DB, usiamo LocalStorage simulato lato client (quindi fallback vuoto da API)
    echo json_encode(['success' => false, 'message' => 'Nessuna connessione al database configurata.']);
    exit;
}

// ------------------------------------------------------------------------------
// HELPER PER CONTROLLARE L'ACCESSO ADMIN
// ------------------------------------------------------------------------------
function check_admin() {
    if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Accesso negato.']);
        exit;
    }
}

// ------------------------------------------------------------------------------
// 1. ADD - AGGIUNGI COMMENTO (PUBBLICO)
// ------------------------------------------------------------------------------
if ($action === 'add' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];
    
    $article_id = trim($input['article_id'] ?? '');
    $author_name = trim($input['author_name'] ?? '');
    $author_email = trim($input['author_email'] ?? '');
    $content = trim($input['content'] ?? '');
    
    if (empty($article_id) || empty($author_name) || empty($content)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Campi obbligatori mancanti.']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO `tdm_comments` (`article_id`, `author_name`, `author_email`, `content`, `status`) VALUES (?, ?, ?, ?, 'pending')");
        $stmt->execute([$article_id, $author_name, $author_email, $content]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Commento inviato con successo! Sarà visibile dopo l\'approvazione dei moderatori.'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Errore nel salvare il commento: ' . $e->getMessage()]);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 2. LIST_PUBLIC - ELENCO COMMENTI APPROVATI PER UN ARTICOLO
// ------------------------------------------------------------------------------
if ($action === 'list_public' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $article_id = $_GET['article_id'] ?? '';
    if (empty($article_id)) {
        echo json_encode(['success' => true, 'comments' => []]);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT `author_name`, `content`, `created_at` FROM `tdm_comments` WHERE `article_id` = ? AND `status` = 'approved' ORDER BY `id` ASC");
        $stmt->execute([$article_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'comments' => $comments]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'comments' => []]);
    }
    exit;
}

// ==============================================================================
// AZIONI PROTETTE (SOLO ADMIN)
// ==============================================================================

// 3. LIST_ADMIN - TUTTI I COMMENTI
if ($action === 'list_admin' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    check_admin();
    try {
        $stmt = $pdo->query("SELECT * FROM `tdm_comments` ORDER BY `id` DESC");
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'comments' => $comments]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// 4. APPROVE - APPROVA COMMENTO
if ($action === 'approve' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    check_admin();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];
    $id = intval($input['id'] ?? 0);
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID commento non valido.']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE `tdm_comments` SET `status` = 'approved' WHERE `id` = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Commento approvato con successo.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// 5. DELETE - CANCELLA COMMENTO
if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    check_admin();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];
    $id = intval($input['id'] ?? 0);
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID commento non valido.']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM `tdm_comments` WHERE `id` = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Commento eliminato con successo.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}
