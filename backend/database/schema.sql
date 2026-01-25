-- =============================================================================
-- BVMW Bürokratieabbau-Plattform - Datenbank-Schema
-- =============================================================================
-- Dieses Schema erstellt alle benötigten Tabellen und fügt die initialen
-- Kategorien ein.
--
-- HINWEIS: Der erste Administrator wird über den Setup-Wizard im Browser
-- erstellt, nicht über dieses Schema.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS buerokratieabbau
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE buerokratieabbau;

-- -----------------------------------------------------------------------------
-- Kategorien-Tabelle
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Benutzer-Tabelle
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  company VARCHAR(100),
  role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- -----------------------------------------------------------------------------
-- Meldungen-Tabelle
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id INT,
  time_spent INT,
  costs DECIMAL(10, 2),
  affected_employees INT,
  reporter_name VARCHAR(100),
  reporter_company VARCHAR(100),
  reporter_email VARCHAR(255),
  wz_category_key VARCHAR(10),
  is_anonymous BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- -----------------------------------------------------------------------------
-- Feedback-Tabelle (für ML-Training)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  original_category_id INT,
  corrected_category_id INT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id),
  FOREIGN KEY (original_category_id) REFERENCES categories(id),
  FOREIGN KEY (corrected_category_id) REFERENCES categories(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- -----------------------------------------------------------------------------
-- Kommentare zu Meldungen
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  user_id INT NOT NULL,
  law_reference VARCHAR(255),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- -----------------------------------------------------------------------------
-- Abstimmungen (Votes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vote (report_id, session_id)
);

-- -----------------------------------------------------------------------------
-- Initiale Kategorien einfügen (nur wenn noch nicht vorhanden)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO categories (name, description) VALUES
  ('Steuer', 'Steuerliche Vorschriften und Meldepflichten'),
  ('Dokumentationspflicht', 'Pflichten zur Dokumentation und Aufbewahrung'),
  ('Rechnungswesen', 'Buchführung, Bilanzierung und Jahresabschlüsse'),
  ('Statistiken', 'Statistische Meldepflichten und Erhebungen'),
  ('Sozialversicherungen', 'Meldeverfahren und Beitragsnachweise'),
  ('Datenschutz', 'DSGVO und andere Datenschutzanforderungen'),
  ('Arbeitsschutz', 'Arbeitsschutzvorschriften und Gefährdungsbeurteilungen'),
  ('Branchenspezifisches', 'Branchenspezifische Vorschriften und Auflagen');

-- =============================================================================
-- HINWEIS: Nach der Datenbankeinrichtung starten Sie die Anwendung.
-- Der Setup-Wizard im Browser führt Sie durch die Erstellung des ersten
-- Administrator-Accounts.
-- =============================================================================
