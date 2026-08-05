<?php
/* ==============================================================================
   API PER L'INVIIO DEL FORM DI CONTATTO AL DATABASE MYSQL
   Sviluppato per: The Dreamers Magazine
   ============================================================================== */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Metodo di richiesta non valido. Usare POST.'
    ]);
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

// ------------------------------------------------------------------------------
// LETTURA E VALIDAZIONE DATI RICEVUTI
// ------------------------------------------------------------------------------
$raw_input = file_get_contents('php://input');
$input = json_decode($raw_input, true);

if (!$input) {
    $input = $_POST; // Fallback per normale form-data
}

$name    = isset($input['name']) ? trim($input['name']) : '';
$email   = isset($input['email']) ? trim($input['email']) : '';
$subject = isset($input['subject']) && !empty(trim($input['subject'])) ? trim($input['subject']) : 'Generale';
$message = isset($input['message']) ? trim($input['message']) : '';
$phone   = isset($input['phone']) ? trim($input['phone']) : null;

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'I campi Nome, Email e Messaggio sono obbligatori.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'L\'indirizzo email fornito non è valido.'
    ]);
    exit;
}

// Metadati utente per sicurezza
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

// ------------------------------------------------------------------------------
// INSERIMENTO NEL DATABASE MYSQL
// ------------------------------------------------------------------------------
try {
    $sql = "INSERT INTO `tdm_contact_messages` 
            (`name`, `email`, `phone`, `subject`, `message`, `ip_address`, `user_agent`, `status`, `created_at`) 
            VALUES (:name, :email, :phone, :subject, :message, :ip, :ua, 'new', NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':phone'   => $phone,
        ':subject' => $subject,
        ':message' => $message,
        ':ip'      => $ip_address,
        ':ua'      => $user_agent,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Messaggio inviato con successo alla redazione!'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Errore durante il salvataggio nel Database: ' . $e->getMessage()
    ]);
}
