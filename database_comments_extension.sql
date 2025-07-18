-- Beispiel-Migration zur Erweiterung um die Tabelle fuer Kommentare
-- Fuehren Sie dieses Skript aus, wenn Sie das Basisschema ohne die Tabelle
-- `comments` installiert haben.

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  user_id INT NOT NULL,
  law_reference VARCHAR(255),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Optional: zusaetzliche Indizes fuer schnellere Abfragen
CREATE INDEX idx_comments_report_id ON comments(report_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
