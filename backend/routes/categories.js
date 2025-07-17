const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Alle Kategorien abrufen
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorien:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Kategorien' });
  }
});

// Eine Kategorie nach ID abrufen
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kategorie nicht gefunden' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorie:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Kategorie' });
  }
});

module.exports = router;

