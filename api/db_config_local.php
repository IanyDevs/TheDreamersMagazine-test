<?php
/* ==============================================================================
   CONFIGURAZIONE DATABASE MYSQL - XAMPP LOCALE (TESTING)
   Progetto: The Dreamers Magazine
   ============================================================================== */

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'sito_db';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Errore di connessione al Database Local XAMPP: ' . $e->getMessage()
    ]);
    exit;
}
