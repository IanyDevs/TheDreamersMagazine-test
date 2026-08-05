<?php
/* ==============================================================================
   CONFIGURAZIONE CENTRALIZZATA DATABASE (ARUBA MYSQL HOSTING & FALLBACK LOCALE)
   Progetto: The Dreamers Magazine
   ============================================================================== */

$db_host = 'khqqn0rrme.zonekh.mydb-aruba.it';
$db_user = 'Swp1929303';
$db_pass = 'Magazine2025!!';
$db_name = 'Swp1929303-prod';

$pdo = null;

// 1. Tentativo Connessione a DB Aruba Ufficiale
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 3
    ]);
} catch (PDOException $e) {
    // 2. Fallback per test in locale se l'IP remoto viene bloccato da Aruba (MySQL Locale XAMPP)
    try {
        $pdo = new PDO("mysql:host=localhost;dbname=Swp1929303-prod;charset=utf8mb4", "root", "", [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 2
        ]);
    } catch (PDOException $e2) {
        // 3. Fallback SQLite in Locale (File interno al progetto per garantire il funzionamento senza MySQL attivo)
        try {
            $dbPath = __DIR__ . '/tdm_database.sqlite';
            $pdo = new PDO("sqlite:" . $dbPath);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e3) {
            $pdo = null;
        }
    }
}

// Auto-creazione ed aggiornamento schema tabella tdm_articles
if ($pdo) {
    try {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `tdm_articles` (
                `id` INTEGER PRIMARY KEY AUTOINCREMENT,
                `title` TEXT NOT NULL,
                `subtitle` TEXT DEFAULT '',
                `slug` TEXT NOT NULL,
                `category` TEXT DEFAULT 'News',
                `subCategory` TEXT DEFAULT '',
                `tags` TEXT DEFAULT '',
                `author` TEXT DEFAULT 'Redazione',
                `readTime` TEXT DEFAULT '3 min',
                `excerpt` TEXT DEFAULT '',
                `content` TEXT NOT NULL,
                `image` TEXT DEFAULT '',
                `imageFit` TEXT DEFAULT 'cover',
                `imageRatio` TEXT DEFAULT '16/9',
                `imagePos` TEXT DEFAULT 'center',
                `imageAlt` TEXT DEFAULT '',
                `imageCaption` TEXT DEFAULT '',
                `fontFamily` TEXT DEFAULT 'Inter',
                `titleColor` TEXT DEFAULT '#ffffff',
                `textColor` TEXT DEFAULT '#e2e8f0',
                `isFeatured` INTEGER DEFAULT 0,
                `isHomeFeatured` INTEGER DEFAULT 0,
                `series` TEXT DEFAULT '',
                `seoTitle` TEXT DEFAULT '',
                `metaDescription` TEXT DEFAULT '',
                `canonicalUrl` TEXT DEFAULT '',
                `robots` TEXT DEFAULT 'index, follow',
                `ogTitle` TEXT DEFAULT '',
                `ogDescription` TEXT DEFAULT '',
                `ogImage` TEXT DEFAULT '',
                `keywords` TEXT DEFAULT '',
                `status` TEXT DEFAULT 'published',
                `scheduledAt` TEXT DEFAULT NULL,
                `createdAt` TEXT DEFAULT CURRENT_TIMESTAMP,
                `updatedAt` TEXT DEFAULT CURRENT_TIMESTAMP
            )");
        } else {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `tdm_articles` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `subtitle` VARCHAR(255) DEFAULT '',
                `slug` VARCHAR(255) NOT NULL,
                `category` VARCHAR(100) DEFAULT 'News',
                `subCategory` VARCHAR(100) DEFAULT '',
                `tags` TEXT DEFAULT NULL,
                `author` VARCHAR(150) DEFAULT 'Redazione',
                `readTime` VARCHAR(50) DEFAULT '3 min',
                `excerpt` TEXT DEFAULT NULL,
                `content` LONGTEXT NOT NULL,
                `image` LONGTEXT DEFAULT NULL,
                `imageFit` VARCHAR(50) DEFAULT 'cover',
                `imageRatio` VARCHAR(50) DEFAULT '16/9',
                `imagePos` VARCHAR(50) DEFAULT 'center',
                `imageAlt` VARCHAR(255) DEFAULT '',
                `imageCaption` TEXT DEFAULT NULL,
                `fontFamily` VARCHAR(100) DEFAULT 'Inter',
                `titleColor` VARCHAR(50) DEFAULT '#ffffff',
                `textColor` VARCHAR(50) DEFAULT '#e2e8f0',
                `isFeatured` TINYINT(1) DEFAULT 0,
                `isHomeFeatured` TINYINT(1) DEFAULT 0,
                `series` VARCHAR(150) DEFAULT '',
                `seoTitle` VARCHAR(255) DEFAULT '',
                `metaDescription` TEXT DEFAULT NULL,
                `canonicalUrl` VARCHAR(255) DEFAULT '',
                `robots` VARCHAR(50) DEFAULT 'index, follow',
                `ogTitle` VARCHAR(255) DEFAULT '',
                `ogDescription` TEXT DEFAULT NULL,
                `ogImage` LONGTEXT DEFAULT NULL,
                `keywords` TEXT DEFAULT NULL,
                `status` VARCHAR(50) DEFAULT 'published',
                `scheduledAt` DATETIME DEFAULT NULL,
                `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }
    } catch (Exception $ex) {
        // Ignora se già esistente
    }
}
