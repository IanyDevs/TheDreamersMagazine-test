<?php
/* ==============================================================================
   API PHP PER LA GESTIONE DEGLI ARTICOLI (XAMPP MYSQL & DB UFFICIALE)
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
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function check_admin_auth() {
    if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Richiesta non autorizzata. Accesso negato.']);
        exit;
    }
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

$action = $_GET['action'] ?? 'list';

// ------------------------------------------------------------------------------
// 1. GET LISTA ARTICOLI (UNIFICATA: DATABASE CUSTOM + WORDPRESS REST API)
// ------------------------------------------------------------------------------
if ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $articles = [];

        // Fetch articoli da tabella custom MySQL se connessione PDO attiva
        if (isset($pdo)) {
            try {
                $isAdmin = !empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
                if ($isAdmin) {
                    $stmt = $pdo->query("SELECT * FROM tdm_articles ORDER BY id DESC");
                } else {
                    $stmt = $pdo->prepare("SELECT * FROM tdm_articles WHERE (status = 'published' OR status IS NULL OR status = '') AND (scheduledAt IS NULL OR scheduledAt <= ?) ORDER BY id DESC");
                    $stmt->execute([date('Y-m-d H:i:s')]);
                }
                $dbArticles = $stmt->fetchAll();
                if (is_array($dbArticles)) {
                    $articles = $dbArticles;
                }
            } catch (Exception $dbEx) {
                // Tabella tdm_articles non ancora creata o vuota
            }
        }

        // Helper robusto per fetch HTTP/HTTPS remoti (cURL + stream context)
        function fetch_remote_url($url) {
            if (function_exists('curl_init')) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 6);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_setopt($ch, CURLOPT_USERAGENT, 'TheDreamersMagazine-HybridEngine/1.0');
                $output = curl_exec($ch);
                curl_close($ch);
                if ($output) return $output;
            }
            $ctx = stream_context_create([
                'http' => [
                    'timeout' => 6,
                    'header'  => "User-Agent: TheDreamersMagazine-HybridEngine/1.0\r\n"
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ]
            ]);
            return @file_get_contents($url, false, $ctx);
        }

        /* 
        // Disattivato l'import automatico dal vecchio sito WordPress in background
        // Gli articoli vecchi si possono importare dal pulsante "Importa da WordPress" nel Pannello Admin
        $wp_json = fetch_remote_url('https://www.thedreamersmagazine.it/wp-json/wp/v2/posts?_embed&per_page=50');
        if ($wp_json) {
            $wp_posts = json_decode($wp_json, true);
            if (is_array($wp_posts)) {
                foreach ($wp_posts as $wp) {
                    $featured_img = '';
                    if (!empty($wp['_embedded']['wp:featuredmedia'][0]['source_url'])) {
                        $featured_img = $wp['_embedded']['wp:featuredmedia'][0]['source_url'];
                    }

                    $author_name = 'Redazione';
                    if (!empty($wp['_embedded']['author'][0]['name'])) {
                        $author_name = $wp['_embedded']['author'][0]['name'];
                    }

                    $cat_name = 'News';
                    if (!empty($wp['_embedded']['wp:term'][0][0]['name'])) {
                        $cat_name = $wp['_embedded']['wp:term'][0][0]['name'];
                    }

                    $articles[] = [
                        'id' => 'wp-' . $wp['id'],
                        'title' => html_entity_decode($wp['title']['rendered'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                        'subtitle' => '',
                        'slug' => $wp['slug'] ?? '',
                        'category' => $cat_name,
                        'subCategory' => '',
                        'tags' => [],
                        'author' => $author_name,
                        'readTime' => '3 min',
                        'excerpt' => trim(strip_tags(html_entity_decode($wp['excerpt']['rendered'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'))),
                        'content' => $wp['content']['rendered'] ?? '',
                        'image' => $featured_img,
                        'imageFit' => 'cover',
                        'imageRatio' => '16/9',
                        'imagePos' => 'center',
                        'imageAlt' => html_entity_decode($wp['title']['rendered'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                        'imageCaption' => '',
                        'fontFamily' => 'Inter',
                        'titleColor' => '#ffffff',
                        'textColor' => '#e2e8f0',
                        'isFeatured' => false,
                        'isHomeFeatured' => false,
                        'series' => '',
                        'status' => 'published',
                        'createdAt' => $wp['date'] ?? date('Y-m-d H:i:s'),
                        'source' => 'wordpress'
                    ];
                }
            }
        }
        */

        // Conversione e formattazione tipi di dati per JavaScript
        foreach ($articles as &$art) {
            $art['id'] = (string)$art['id'];
            $art['isFeatured'] = !empty($art['isFeatured']);
            $art['isHomeFeatured'] = !empty($art['isHomeFeatured']);
            if (isset($art['tags']) && is_string($art['tags'])) {
                $art['tags'] = $art['tags'] ? json_decode($art['tags'], true) ?? explode(',', $art['tags']) : [];
            }
        }

        echo json_encode([
            'success' => true,
            'articles' => $articles
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 2. SALVA / AGGIORNA ARTICOLO (POST)
// ------------------------------------------------------------------------------
if (($action === 'create' || $action === 'update') && $_SERVER['REQUEST_METHOD'] === 'POST') {
    check_admin_auth();
    $input = file_get_json_input();
    
    if (!$input || empty($input['title'])) {
        echo json_encode(['success' => false, 'message' => 'Titolo articolo obbligatorio']);
        exit;
    }

    $title = trim($input['title']);
    $subtitle = trim($input['subtitle'] ?? '');
    $slug = trim($input['slug'] ?? slugify($title));
    $category = trim($input['category'] ?? 'News');
    $subCategory = trim($input['subCategory'] ?? '');
    $tags = is_array($input['tags'] ?? null) ? json_encode($input['tags']) : ($input['tags'] ?? '');
    $author = trim($input['author'] ?? 'Redazione');
    $readTime = trim($input['readTime'] ?? '3 min');
    $excerpt = trim($input['excerpt'] ?? '');
    $content = $input['content'] ?? '';

    $image = $input['image'] ?? '';
    $imageFit = $input['imageFit'] ?? 'cover';
    $imageRatio = $input['imageRatio'] ?? '16/9';
    $imagePos = $input['imagePos'] ?? 'center';
    $imageAlt = $input['imageAlt'] ?? '';
    $imageCaption = $input['imageCaption'] ?? '';

    $fontFamily = $input['fontFamily'] ?? 'Inter';
    $titleColor = $input['titleColor'] ?? '#ffffff';
    $textColor = $input['textColor'] ?? '#e2e8f0';

    $isFeatured = !empty($input['isFeatured']) ? 1 : 0;
    $isHomeFeatured = !empty($input['isHomeFeatured']) ? 1 : 0;
    $series = $input['series'] ?? '';

    $seoTitle = $input['seoTitle'] ?? '';
    $metaDescription = $input['metaDescription'] ?? '';
    $canonicalUrl = $input['canonicalUrl'] ?? '';
    $robots = $input['robots'] ?? 'index, follow';
    $ogTitle = $input['ogTitle'] ?? '';
    $ogDescription = $input['ogDescription'] ?? '';
    $ogImage = $input['ogImage'] ?? $image;
    $keywords = $input['keywords'] ?? '';

    $status = $input['status'] ?? 'published';
    $scheduledAt = !empty($input['scheduledAt']) ? $input['scheduledAt'] : null;

    try {
        if ($action === 'update' && !empty($input['id'])) {
            $id = (int)$input['id'];
            $sql = "UPDATE tdm_articles SET 
                title=?, subtitle=?, slug=?, category=?, subCategory=?, tags=?, author=?, readTime=?, excerpt=?, content=?,
                image=?, imageFit=?, imageRatio=?, imagePos=?, imageAlt=?, imageCaption=?,
                fontFamily=?, titleColor=?, textColor=?, isFeatured=?, isHomeFeatured=?, series=?,
                seoTitle=?, metaDescription=?, canonicalUrl=?, robots=?, ogTitle=?, ogDescription=?, ogImage=?, keywords=?,
                status=?, scheduledAt=?
                WHERE id=?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $title, $subtitle, $slug, $category, $subCategory, $tags, $author, $readTime, $excerpt, $content,
                $image, $imageFit, $imageRatio, $imagePos, $imageAlt, $imageCaption,
                $fontFamily, $titleColor, $textColor, $isFeatured, $isHomeFeatured, $series,
                $seoTitle, $metaDescription, $canonicalUrl, $robots, $ogTitle, $ogDescription, $ogImage, $keywords,
                $status, $scheduledAt, $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Articolo aggiornato con successo', 'id' => (string)$id]);
        } else {
            $sql = "INSERT INTO tdm_articles (
                title, subtitle, slug, category, subCategory, tags, author, readTime, excerpt, content,
                image, imageFit, imageRatio, imagePos, imageAlt, imageCaption,
                fontFamily, titleColor, textColor, isFeatured, isHomeFeatured, series,
                seoTitle, metaDescription, canonicalUrl, robots, ogTitle, ogDescription, ogImage, keywords,
                status, scheduledAt
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?
            )";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $title, $subtitle, $slug, $category, $subCategory, $tags, $author, $readTime, $excerpt, $content,
                $image, $imageFit, $imageRatio, $imagePos, $imageAlt, $imageCaption,
                $fontFamily, $titleColor, $textColor, $isFeatured, $isHomeFeatured, $series,
                $seoTitle, $metaDescription, $canonicalUrl, $robots, $ogTitle, $ogDescription, $ogImage, $keywords,
                $status, $scheduledAt
            ]);

            $newId = $pdo->lastInsertId();
            echo json_encode(['success' => true, 'message' => 'Articolo inserito con successo', 'id' => (string)$newId]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Errore salvataggio MySQL: ' . $e->getMessage()]);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 3. ELIMINA ARTICOLO
// ------------------------------------------------------------------------------
if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    check_admin_auth();
    $input = file_get_json_input();
    $id = (int)($input['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID articolo non valido']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM tdm_articles WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Articolo eliminato']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// ------------------------------------------------------------------------------
// 4. SVUOTA TUTTI GLI ARTICOLI (CLEAR)
// ------------------------------------------------------------------------------
if ($action === 'clear' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    check_admin_auth();
    try {
        if (isset($pdo)) {
            $pdo->exec("DELETE FROM tdm_articles");
        }
        echo json_encode(['success' => true, 'message' => 'Tutti gli articoli sono stati rimossi']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Funzioni Helper
function file_get_json_input() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? $_POST;
}

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    return strtolower($text ?: 'n-a');
}
