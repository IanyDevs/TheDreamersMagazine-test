<?php
/* ==============================================================================
   API PER LA GESTIONE DEI FILE MULTIMEDIALI (MEDIA LIBRARY)
   Sviluppato per: The Dreamers Magazine
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
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verifica che sia loggato l'amministratore
if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Richiesta non autorizzata. Accesso negato.']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];

// ------------------------------------------------------------------------------
// 1. GET - ELENCO FILE CARICATI
// ------------------------------------------------------------------------------
if ($method === 'GET') {
    try {
        $files = [];
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (file_exists($uploadDir)) {
            $dirFiles = scandir($uploadDir);
            foreach ($dirFiles as $file) {
                if ($file === '.' || $file === '..') continue;
                
                $filePath = $uploadDir . $file;
                if (is_file($filePath)) {
                    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                    if (in_array($ext, $allowedExtensions)) {
                        $files[] = [
                            'name' => $file,
                            'url' => 'uploads/' . $file,
                            'size' => filesize($filePath),
                            'date' => filemtime($filePath)
                        ];
                    }
                }
            }
        }
        
        // Ordina per data decrescente (ultimi caricati per primi)
        usort($files, function($a, $b) {
            return $b['date'] - $a['date'];
        });
        
        echo json_encode(['success' => true, 'files' => $files]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 2. POST - CARICAMENTO DI UN FILE
// ------------------------------------------------------------------------------
if ($method === 'POST') {
    // Gestione cancellazione tramite POST (alternativa a DELETE)
    $action = $_GET['action'] ?? '';
    if ($action === 'delete') {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true) ?? [];
        $filename = basename($input['filename'] ?? '');
        
        if (empty($filename)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nome file non specificato']);
            exit;
        }
        
        $filePath = $uploadDir . $filename;
        if (file_exists($filePath)) {
            unlink($filePath);
            echo json_encode(['success' => true, 'message' => 'File eliminato con successo.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'File non trovato.']);
        }
        exit;
    }

    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nessun file inviato.']);
        exit;
    }

    $file = $_FILES['file'];
    $error = $file['error'];
    
    if ($error !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Errore nel caricamento del file: ' . $error]);
        exit;
    }

    // Verifica dimensioni (Max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File troppo grande. Massimo consentito: 5MB.']);
        exit;
    }

    // Verifica estensione
    $originalName = basename($file['name']);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($ext, $allowedExtensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Formato file non supportato. Estensioni permesse: ' . implode(', ', $allowedExtensions)]);
        exit;
    }

    // Pulisci e genera nome file unico
    $cleanName = preg_replace("/[^a-zA-Z0-9_\.-]/", "_", pathinfo($originalName, PATHINFO_FILENAME));
    $newFilename = $cleanName . '_' . time() . '.' . $ext;
    $targetPath = $uploadDir . $newFilename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode([
            'success' => true,
            'message' => 'File caricato con successo!',
            'file' => [
                'name' => $newFilename,
                'url' => 'uploads/' . $newFilename,
                'size' => filesize($targetPath)
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Impossibile salvare il file sul server.']);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 3. DELETE - CANCELLAZIONE FILE
// ------------------------------------------------------------------------------
if ($method === 'DELETE') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];
    $filename = basename($input['filename'] ?? '');
    
    if (empty($filename)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nome file non specificato']);
        exit;
    }
    
    $filePath = $uploadDir . $filename;
    if (file_exists($filePath)) {
        unlink($filePath);
        echo json_encode(['success' => true, 'message' => 'File eliminato con successo.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'File non trovato.']);
    }
    exit;
}
