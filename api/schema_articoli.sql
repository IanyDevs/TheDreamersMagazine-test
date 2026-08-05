-- ==============================================================================
-- SCHEMA E QUERY PER IL DATABASE DEGLI ARTICOLI
-- Progetto: The Dreamers Magazine
-- Compatibilità: MySQL / MariaDB (XAMPP locale e MySQL Ufficiale)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREAZIONE DATABASE (se non esiste)
-- ------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `sito_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sito_db`;

-- ------------------------------------------------------------------------------
-- 2. CREAZIONE TABELLA ARTICOLI (DDL MySQL / MariaDB)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tdm_articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Informazioni Principali
  `title` VARCHAR(255) NOT NULL COMMENT 'Titolo dell\'articolo',
  `subtitle` VARCHAR(255) DEFAULT '' COMMENT 'Sottotitolo opzionale',
  `slug` VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL Slug unico per SEO',
  `category` VARCHAR(100) NOT NULL DEFAULT 'News' COMMENT 'Categoria principale',
  `subCategory` VARCHAR(100) DEFAULT '' COMMENT 'Sottocategoria opzionale',
  `tags` TEXT DEFAULT NULL COMMENT 'Tag separati da virgola o JSON',
  `author` VARCHAR(150) NOT NULL DEFAULT 'Redazione' COMMENT 'Autore dell\'articolo',
  `readTime` VARCHAR(50) DEFAULT '3 min' COMMENT 'Tempo stimato di lettura',
  `excerpt` TEXT DEFAULT NULL COMMENT 'Estratto breve per le anteprime',
  `content` LONGTEXT NOT NULL COMMENT 'Contenuto HTML / Markdown dell\'articolo',
  
  -- Immagine di Copertina e Visual Layout
  `image` LONGTEXT DEFAULT NULL COMMENT 'URL o Base64 WebP dell\'immagine di copertina',
  `imageFit` VARCHAR(50) DEFAULT 'cover' COMMENT 'Proprietà CSS object-fit (cover, contain, fill)',
  `imageRatio` VARCHAR(50) DEFAULT '16/9' COMMENT 'Aspect ratio dell\'immagine (16/9, 4/3, 1/1)',
  `imagePos` VARCHAR(50) DEFAULT 'center' COMMENT 'Posizionamento fisso copertina (top, center, bottom)',
  `imageAlt` VARCHAR(255) DEFAULT '' COMMENT 'Testo alternativo ALT per accessibilità e SEO',
  `imageCaption` TEXT DEFAULT NULL COMMENT 'Didascalia visibile sotto la copertina',
  
  -- Personalizzazione Grafica
  `fontFamily` VARCHAR(100) DEFAULT 'Inter' COMMENT 'Font utilizzato per l\'articolo',
  `titleColor` VARCHAR(50) DEFAULT '#ffffff' COMMENT 'Colore hex del titolo',
  `textColor` VARCHAR(50) DEFAULT '#e2e8f0' COMMENT 'Colore hex del testo del corpo',
  
  -- Flags Redazionali & Evidenze
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = In Evidenza Generale, 0 = Normale',
  `isHomeFeatured` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = In Evidenza nella Home, 0 = Normale',
  `series` VARCHAR(150) DEFAULT '' COMMENT 'Nome della serie o rubrica di appartenenza',
  
  -- Suite SEO Completa
  `seoTitle` VARCHAR(255) DEFAULT '' COMMENT 'Meta Titolo personalizzato per i motori di ricerca',
  `metaDescription` TEXT DEFAULT NULL COMMENT 'Meta Description per motori di ricerca',
  `canonicalUrl` VARCHAR(255) DEFAULT '' COMMENT 'URL Canonico unico',
  `robots` VARCHAR(50) DEFAULT 'index, follow' COMMENT 'Direttiva Robots (index, follow / noindex, nofollow)',
  `ogTitle` VARCHAR(255) DEFAULT '' COMMENT 'Open Graph Title per Facebook / LinkedIn',
  `ogDescription` TEXT DEFAULT NULL COMMENT 'Open Graph Description per social network',
  `ogImage` LONGTEXT DEFAULT NULL COMMENT 'Immagine specifica per condivisione social',
  `keywords` TEXT DEFAULT NULL COMMENT 'Parole chiave separate da virgola',
  
  -- Workflow e Programmazione Pubblicazione
  `status` ENUM('draft', 'review', 'published', 'archived') NOT NULL DEFAULT 'published' COMMENT 'Stato del post',
  `scheduledAt` DATETIME DEFAULT NULL COMMENT 'Data e ora programmata per la pubblicazione',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data di creazione',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data di ultima modifica'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabella articoli blog The Dreamers Magazine';

-- ------------------------------------------------------------------------------
-- 3. INDICI DI PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX `idx_articles_status` ON `tdm_articles` (`status`, `createdAt`);
CREATE INDEX `idx_articles_category` ON `tdm_articles` (`category`);
CREATE INDEX `idx_articles_slug` ON `tdm_articles` (`slug`);
