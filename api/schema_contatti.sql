-- ==============================================================================
-- SCHEMA E QUERY PER IL DATABASE DELLA SEZIONE CONTATTI
-- Progetto: The Dreamers Magazine
-- Compatibilità: MySQL / MariaDB (versione 8.0+) & PostgreSQL
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREAZIONE TABELLA CONTATTI (DDL MySQL / MariaDB)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tdm_contact_messages` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Dati utente inviati dal Form
  `name` VARCHAR(150) NOT NULL COMMENT 'Nome completo del mittente',
  `email` VARCHAR(255) NOT NULL COMMENT 'Indirizzo e-mail del mittente',
  `phone` VARCHAR(30) DEFAULT NULL COMMENT 'Numero di telefono opzionale',
  `subject` VARCHAR(255) DEFAULT 'Generale' COMMENT 'Oggetto della richiesta',
  `message` TEXT NOT NULL COMMENT 'Contenuto del messaggio',
  
  -- Metadati di sicurezza e tracciamento
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'Indirizzo IP (IPv4 o IPv6) del mittente',
  `user_agent` TEXT DEFAULT NULL COMMENT 'Browser / Device del mittente',
  
  -- Gestione stato e workflow Admin
  `status` ENUM('new', 'read', 'in_progress', 'replied', 'archived', 'spam') NOT NULL DEFAULT 'new' COMMENT 'Stato del messaggio',
  `is_starred` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = Importante/Fissato, 0 = Normale',
  `admin_notes` TEXT DEFAULT NULL COMMENT 'Note interne della redazione',
  `reply_content` TEXT DEFAULT NULL COMMENT 'Testo della risposta inviata al mittente',
  `replied_at` DATETIME DEFAULT NULL COMMENT 'Data e ora in cui è stata inviata la risposta',
  `replied_by` VARCHAR(100) DEFAULT NULL COMMENT 'Utente admin che ha risposto',
  
  -- Timestamp e tracciamento temporale
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data di ricezione del messaggio',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data di ultima modifica',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft Delete: NULL se attivo, timestamp se rimosso'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabella messaggi form di contatto';

-- ------------------------------------------------------------------------------
-- 2. INDICI DI PERFORMANCE E RICERCA
-- ------------------------------------------------------------------------------
-- Indice per filtrare rapidamente per stato (es. messaggi non letti 'new')
CREATE INDEX `idx_contacts_status` ON `tdm_contact_messages` (`status`, `created_at`);

-- Indice per ricerca per email utente
CREATE INDEX `idx_contacts_email` ON `tdm_contact_messages` (`email`);

-- Indice temporale per report, ordinamenti e pulizie periodiche
CREATE INDEX `idx_contacts_created_at` ON `tdm_contact_messages` (`created_at`);

-- Indice per Soft Delete
CREATE INDEX `idx_contacts_deleted_at` ON `tdm_contact_messages` (`deleted_at`);

-- Indice Full-Text per ricerche veloci nel pannello admin (su oggetto e messaggio)
CREATE FULLTEXT INDEX `ft_contacts_search` ON `tdm_contact_messages` (`subject`, `message`, `name`, `email`);


-- ==============================================================================
-- DOCUMENTAZIONE QUERY BACKEND (DA USARE NEL CODICE PHP / NODE / API)
-- ==============================================================================
-- Le query sottostanti sono esempi con placeholder (?) per l'applicazione backend.
-- Non sono pensate per l'esecuzione diretta su phpMyAdmin.

-- 3.1 INSERIMENTO NUOVO MESSAGGIO DAL FORM DI CONTATTO (Prepared Statement)
-- Parametri: :name, :email, :subject, :message, :ip_address, :user_agent
-- INSERT INTO `tdm_contact_messages` (`name`, `email`, `subject`, `message`, `ip_address`, `user_agent`) VALUES (?, ?, ?, ?, ?, ?);

-- 4.1 ELENCO MESSAGGI CON PAGINAZIONE E FILTRO STATO
-- SELECT `id`, `name`, `email`, `subject`, LEFT(`message`, 100) AS `excerpt`, `status`, `is_starred`, `created_at` FROM `tdm_contact_messages` WHERE `deleted_at` IS NULL AND (`status` = ? OR ? IS NULL) ORDER BY `is_starred` DESC, `created_at` DESC LIMIT ? OFFSET ?;

-- 4.2 DETTAGLIO DI UN SINGOLO MESSAGGIO PER ID
-- SELECT * FROM `tdm_contact_messages` WHERE `id` = ? AND `deleted_at` IS NULL;

-- 4.3 RICERCA TESTUALE AVANZATA (Full-Text Search)
-- SELECT `id`, `name`, `email`, `subject`, `status`, `created_at`, MATCH(`subject`, `message`, `name`, `email`) AGAINST(? IN BOOLEAN MODE) AS `relevance` FROM `tdm_contact_messages` WHERE `deleted_at` IS NULL AND MATCH(`subject`, `message`, `name`, `email`) AGAINST(? IN BOOLEAN MODE) ORDER BY `relevance` DESC, `created_at` DESC LIMIT 20;

-- 4.4 AGGIORNAMENTO STATO MESSAGGIO
-- UPDATE `tdm_contact_messages` SET `status` = ?, `updated_at` = CURRENT_TIMESTAMP WHERE `id` = ?;

-- 4.5 REGISTRAZIONE RISPOSTA INVIATA ALL'UTENTE
-- UPDATE `tdm_contact_messages` SET `status` = 'replied', `reply_content` = ?, `replied_by` = ?, `replied_at` = CURRENT_TIMESTAMP WHERE `id` = ?;

-- 4.6 AGGIUNTA NOTE INTERNE PER LA REDAZIONE
-- UPDATE `tdm_contact_messages` SET `admin_notes` = ? WHERE `id` = ?;

-- 4.7 TOGGLE IMPORTANTE / STELLA (STARRED)
-- UPDATE `tdm_contact_messages` SET `is_starred` = IF(`is_starred` = 1, 0, 1) WHERE `id` = ?;

-- 4.8 SOFT DELETE (Spostamento nel Cestino)
-- UPDATE `tdm_contact_messages` SET `deleted_at` = CURRENT_TIMESTAMP WHERE `id` = ?;

-- 4.9 RIPRISTINO DAL CESTINO
-- UPDATE `tdm_contact_messages` SET `deleted_at` = NULL WHERE `id` = ?;

-- 5.1 CONTEGGIO MESSAGGI PER STATO (Nuovi, In Lavorazione, Risposti, Spam)
-- SELECT COUNT(*) AS `total_messages`, SUM(CASE WHEN `status` = 'new' THEN 1 ELSE 0 END) AS `new_unread_count`, SUM(CASE WHEN `status` = 'in_progress' THEN 1 ELSE 0 END) AS `in_progress_count`, SUM(CASE WHEN `status` = 'replied' THEN 1 ELSE 0 END) AS `replied_count`, SUM(CASE WHEN `status` = 'spam' THEN 1 ELSE 0 END) AS `spam_count` FROM `tdm_contact_messages` WHERE `deleted_at` IS NULL;

-- 5.2 MESSAGGI RICEVUTI OGGI E NELL'ULTIMA SETTIMANA
-- SELECT SUM(CASE WHEN DATE(`created_at`) = CURDATE() THEN 1 ELSE 0 END) AS `today_count`, SUM(CASE WHEN `created_at` >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS `last_7_days_count` FROM `tdm_contact_messages` WHERE `deleted_at` IS NULL;

-- 6.1 ELIMINAZIONE DEFINITIVA DELLO SPAM PIÙ VECCHIO DI 30 GIORNI
-- DELETE FROM `tdm_contact_messages` WHERE `status` = 'spam' AND `created_at` < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 6.2 ELIMINAZIONE DEFINITIVA DEI MESSAGGI NEL CESTINO PIÙ VECCHI DI 90 GIORNI (GDPR Data Retention)
-- DELETE FROM `tdm_contact_messages` WHERE `deleted_at` IS NOT NULL AND `deleted_at` < DATE_SUB(NOW(), INTERVAL 90 DAY);
