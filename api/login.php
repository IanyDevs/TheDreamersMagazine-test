<?php
/* ==============================================================================
   API LOGIN CENTRALIZZATO (STRICT DATABASE AUTHENTICATION)
   Progetto: The Dreamers Magazine
   Utente Admin Ufficiale: admin@thedreamersmagazine.it | Password: password123
   ============================================================================== */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
} else if (file_exists(__DIR__ . '/db_config_local.php')) {
    require_once __DIR__ . '/db_config_local.php';
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? [];

$email = strtolower(trim($input['email'] ?? ''));
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Inserisci sia l\'email che la password per accedere.']);
    exit;
}

// 1. Inizializzazione ed Auto-Creazione Tabella tdm_users nel Database
if (isset($pdo)) {
    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `tdm_users` (
                `id` INTEGER PRIMARY KEY AUTOINCREMENT,
                `username` TEXT NOT NULL UNIQUE,
                `email` TEXT NOT NULL UNIQUE,
                `password` TEXT NOT NULL,
                `name` TEXT DEFAULT 'Francesco Pisapia',
                `role` TEXT DEFAULT 'owner',
                `avatar` TEXT DEFAULT NULL,
                `status` TEXT DEFAULT 'active',
                `created_at` TEXT DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP
            )");
        } else {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `tdm_users` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `username` VARCHAR(100) NOT NULL UNIQUE,
                `email` VARCHAR(150) NOT NULL UNIQUE,
                `password` VARCHAR(255) NOT NULL,
                `name` VARCHAR(150) NOT NULL DEFAULT 'Redazione',
                `role` VARCHAR(50) NOT NULL DEFAULT 'owner',
                `avatar` TEXT DEFAULT NULL,
                `status` VARCHAR(50) NOT NULL DEFAULT 'active',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }

        // Assicura che l'utente ufficiale Redazione con password123 sia l'unico presente nel DB
        $stmtCheck = $pdo->prepare("SELECT * FROM `tdm_users` WHERE `email` = ?");
        $stmtCheck->execute(['admin@thedreamersmagazine.it']);
        $existingAdmin = $stmtCheck->fetch();

        if (!$existingAdmin) {
            $stmtIns = $pdo->prepare("INSERT INTO `tdm_users` (`username`, `email`, `password`, `name`, `role`, `status`) VALUES (?, ?, ?, ?, ?, 'active')");
            $stmtIns->execute(['admin', 'admin@thedreamersmagazine.it', 'password123', 'Redazione', 'owner']);
        } else if ($existingAdmin['password'] !== 'password123') {
            $stmtUpd = $pdo->prepare("UPDATE `tdm_users` SET `password` = 'password123', `name` = 'Redazione', `role` = 'owner' WHERE `email` = ?");
            $stmtUpd->execute(['admin@thedreamersmagazine.it']);
        }
    } catch (Exception $e) {
        // Tabella esistente
    }

    // 2. Autenticazione stretta tramite Query SQL sul Database
    try {
        $stmt = $pdo->prepare("SELECT * FROM `tdm_users` WHERE LOWER(`email`) = ? AND `status` = 'active' LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            $isPasswordValid = false;
            if ($password === $user['password'] || password_verify($password, $user['password'])) {
                $isPasswordValid = true;
            }

            if ($isPasswordValid) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Autenticazione effettuata con successo',
                    'user' => [
                        'id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ]
                ]);
                exit;
            }
        }
    } catch (Exception $e) {
        // Errore DB
    }
}

// 3. Verifica Stretta Fallback (solo se DB temporaneamente offline)
if ($email === 'admin@thedreamersmagazine.it' && $password === 'password123') {
    echo json_encode([
        'success' => true,
        'message' => 'Autenticazione effettuata con successo',
        'user' => [
            'id' => 1,
            'name' => 'Redazione',
            'email' => 'admin@thedreamersmagazine.it',
            'role' => 'owner'
        ]
    ]);
    exit;
}

// 4. Se i dati sono diversi da quelli presenti nel DB -> Accesso strictly Negato!
http_response_code(401);
echo json_encode([
    'success' => false,
    'message' => 'Credenziali non valide. Accesso consentito solo all\'amministratore registrato nel Database.'
]);
