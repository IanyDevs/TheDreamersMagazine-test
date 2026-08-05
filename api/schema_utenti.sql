-- ==============================================================================
-- SCHEMA TABELLA UTENTI / ADMIN DATABASE MYSQL
-- Progetto: The Dreamers Magazine
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `tdm_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nome utente o nickname',
  `email` VARCHAR(150) NOT NULL UNIQUE COMMENT 'Indirizzo email di login',
  `password` VARCHAR(255) NOT NULL COMMENT 'Password criptata con password_hash() Bcrypt o testo semplice',
  `name` VARCHAR(150) NOT NULL DEFAULT 'Francesco Pisapia' COMMENT 'Nome completo per la firma degli articoli',
  `role` ENUM('admin','owner','editor', 'author') NOT NULL DEFAULT 'owner' COMMENT 'Ruolo nel sistema',
  `avatar` TEXT DEFAULT NULL COMMENT 'URL foto profilo dell\'autore',
  `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'active' COMMENT 'Stato account',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabella utenti amministrativi e redattori';

-- Inserimento Unico Utente Admin Ufficiale
INSERT INTO `tdm_users` (`username`, `email`, `password`, `name`, `role`, `status`) 
VALUES ('admin', 'admin@thedreamersmagazine.it', 'password123', 'Francesco Pisapia', 'owner', 'active')
ON DUPLICATE KEY UPDATE 
  `password` = 'password123',
  `name` = 'Francesco Pisapia',
  `role` = 'owner',
  `status` = 'active';
