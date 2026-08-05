<?php
/* ==============================================================================
   API PER LA GESTIONE E LETTURA DEI MESSAGGI DI CONTATTO (PANNELLO ADMIN)
   Sviluppato per: The Dreamers Magazine
   ============================================================================== */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inclusione Configurazione Database
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

$action = $_GET['action'] ?? 'list';

// ------------------------------------------------------------------------------
// 1. ELENCO MESSAGGI RICEVUTI
// ------------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    try {
        $stmt = $pdo->query("SELECT * FROM `tdm_contact_messages` WHERE `deleted_at` IS NULL ORDER BY `created_at` DESC");
        $messages = $stmt->fetchAll();

        // Conteggi per badges
        $total = count($messages);
        $newCount = 0;
        foreach ($messages as $m) {
            if ($m['status'] === 'new') $newCount++;
        }

        echo json_encode([
            'success' => true,
            'total' => $total,
            'unread' => $newCount,
            'messages' => $messages
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 2. AGGIORNAMENTO STATO MESSAGGIO (es. Segna come letto / archiviato)
// ------------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update_status') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? 'read';

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID messaggio mancante.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE `tdm_contact_messages` SET `status` = :status, `updated_at` = NOW() WHERE `id` = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);

        echo json_encode(['success' => true, 'message' => 'Stato aggiornato.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 3. ELIMINAZIONE MESSAGGIO
// ------------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID messaggio mancante.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `tdm_contact_messages` WHERE `id` = :id");
        $stmt->execute([':id' => $id]);

        echo json_encode(['success' => true, 'message' => 'Messaggio eliminato definivamente.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}
