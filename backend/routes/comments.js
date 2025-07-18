const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Kommentare zu einer Meldung abrufen
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM comments WHERE report_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kommentare:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Kommentare' });
  }
});

// Kommentar erstellen
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(['moderator', 'admin']),
  [body('text').notEmpty().withMessage('Text ist erforderlich').trim(), body('law_reference').optional().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validierungsfehler', errors: errors.array() });
    }

    try {
      const { text, law_reference } = req.body;
      const [result] = await db.query(
        'INSERT INTO comments (report_id, user_id, law_reference, text) VALUES (?, ?, ?, ?)',
        [req.params.id, req.user.id, law_reference || null, text]
      );
      res.status(201).json({ id: result.insertId, report_id: parseInt(req.params.id), user_id: req.user.id, law_reference: law_reference || null, text });
    } catch (error) {
      console.error('Fehler beim Erstellen des Kommentars:', error);
      res.status(500).json({ message: 'Serverfehler beim Erstellen des Kommentars' });
    }
  }
);

module.exports = router;
