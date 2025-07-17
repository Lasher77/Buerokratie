const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');

// Session-ID generieren (einfache Implementierung)
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Bewertung hinzufügen ("Das betrifft mich auch")
router.post('/:reportId/vote', async (req, res) => {
  try {
    const reportId = req.params.reportId;
    let sessionId = req.headers['x-session-id'] || req.body.sessionId;
    
    // Session-ID generieren falls nicht vorhanden
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Prüfen, ob die Meldung existiert
    const [reportCheck] = await db.query('SELECT id FROM reports WHERE id = ?', [reportId]);
    if (reportCheck.length === 0) {
      return res.status(404).json({ message: 'Meldung nicht gefunden' });
    }

    // Prüfen, ob bereits bewertet wurde
    const [existingVote] = await db.query(
      'SELECT id FROM votes WHERE report_id = ? AND session_id = ?',
      [reportId, sessionId]
    );

    if (existingVote.length > 0) {
      return res.status(400).json({ 
        message: 'Sie haben diese Meldung bereits bewertet',
        sessionId: sessionId
      });
    }

    // Bewertung hinzufügen
    await db.query(
      'INSERT INTO votes (report_id, session_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [reportId, sessionId, ipAddress, userAgent]
    );

    // Aktuelle Anzahl der Bewertungen abrufen
    const [voteCount] = await db.query(
      'SELECT COUNT(*) as count FROM votes WHERE report_id = ?',
      [reportId]
    );

    res.json({
      message: 'Bewertung erfolgreich hinzugefügt',
      sessionId: sessionId,
      voteCount: voteCount[0].count,
      hasVoted: true
    });

  } catch (error) {
    console.error('Fehler beim Hinzufügen der Bewertung:', error);
    
    // Duplikat-Fehler abfangen
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Sie haben diese Meldung bereits bewertet' });
    }
    
    res.status(500).json({ message: 'Serverfehler beim Hinzufügen der Bewertung' });
  }
});

// Bewertung entfernen
router.delete('/:reportId/vote', async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session-ID erforderlich' });
    }

    // Bewertung entfernen
    const [result] = await db.query(
      'DELETE FROM votes WHERE report_id = ? AND session_id = ?',
      [reportId, sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bewertung nicht gefunden' });
    }

    // Aktuelle Anzahl der Bewertungen abrufen
    const [voteCount] = await db.query(
      'SELECT COUNT(*) as count FROM votes WHERE report_id = ?',
      [reportId]
    );

    res.json({
      message: 'Bewertung erfolgreich entfernt',
      voteCount: voteCount[0].count,
      hasVoted: false
    });

  } catch (error) {
    console.error('Fehler beim Entfernen der Bewertung:', error);
    res.status(500).json({ message: 'Serverfehler beim Entfernen der Bewertung' });
  }
});

// Bewertungsstatus für eine Meldung abrufen
router.get('/:reportId/vote-status', async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    // Gesamtanzahl der Bewertungen
    const [voteCount] = await db.query(
      'SELECT COUNT(*) as count FROM votes WHERE report_id = ?',
      [reportId]
    );

    let hasVoted = false;
    
    // Prüfen, ob diese Session bereits bewertet hat
    if (sessionId) {
      const [userVote] = await db.query(
        'SELECT id FROM votes WHERE report_id = ? AND session_id = ?',
        [reportId, sessionId]
      );
      hasVoted = userVote.length > 0;
    }

    res.json({
      reportId: parseInt(reportId),
      voteCount: voteCount[0].count,
      hasVoted: hasVoted,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Fehler beim Abrufen des Bewertungsstatus:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Bewertungsstatus' });
  }
});

module.exports = router;

