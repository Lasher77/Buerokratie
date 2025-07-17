-- Erweiterung des Datenbankschemas für Bewertungen
-- Diese Datei zu dem bestehenden Schema hinzufügen

-- Bewertungen-Tabelle für "Das betrifft mich auch"
CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vote (report_id, session_id)
);

-- Index für bessere Performance
CREATE INDEX idx_votes_report_id ON votes(report_id);
CREATE INDEX idx_votes_session_id ON votes(session_id);

