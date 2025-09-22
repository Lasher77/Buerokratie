const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST;
const resolvedHost = !host || host === 'localhost' ? '127.0.0.1' : host;

const pool = mysql.createPool({
  host: resolvedHost,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Sicherstellen, dass die Tabelle 'votes' vorhanden ist
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      const [rows] = await pool.query("SHOW TABLES LIKE 'votes'");
      if (rows.length === 0) {
        console.error("Die Tabelle 'votes' wurde nicht gefunden. Bitte 'database_votes_extension.sql' ausführen.");
        process.exit(1);
      }
    } catch (err) {
      console.error("Fehler bei der Prüfung der Tabelle 'votes':", err);
      process.exit(1);
    }
  })();
}

module.exports = pool;

