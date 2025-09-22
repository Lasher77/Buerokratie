const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const wzCategories = require('../data/wzCategories');

const wzCategoryKeys = wzCategories.map((category) => category.key);

const isDev = process.env.NODE_ENV === 'development';

// Angepasste Validierungsregeln für Meldungen
const reportValidationRules = [
  body('title').notEmpty().withMessage('Titel ist erforderlich').trim().escape(),
  body('description')
    .notEmpty().withMessage('Beschreibung ist erforderlich')
    .trim()
    .escape(),
  body('category_id').notEmpty().withMessage('Kategorie ist erforderlich').isInt().withMessage('Ungültige Kategorie-ID'),
  body('time_spent').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Zeitaufwand muss eine positive Zahl sein'),
  body('costs').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Kosten müssen eine positive Zahl sein'),
  body('affected_employees').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Anzahl betroffener Mitarbeiter muss eine positive Zahl sein'),
  body('reporter_name').optional({ nullable: true }).trim().escape(),
  body('reporter_company').optional({ nullable: true }).trim().escape(),
  body('reporter_email').optional({ nullable: true }).isEmail().withMessage('Ungültige E-Mail-Adresse').normalizeEmail(),
  body('is_anonymous').optional({ nullable: true }).isBoolean().withMessage('Anonymität muss ein Boolean-Wert sein'),
  body('wz_category_key')
    .notEmpty()
    .withMessage('WZ-Oberkategorie ist erforderlich')
    .bail()
    .trim()
    .toUpperCase()
    .isIn(wzCategoryKeys)
    .withMessage('Ungültige WZ-Oberkategorie')
];

// Alle Meldungen abrufen (mit Bewertungsanzahl)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, c.name as category_name,
             COALESCE(v.vote_count, 0) as vote_count,
             EXISTS (SELECT 1 FROM comments WHERE report_id = r.id) AS has_comments
      FROM reports r 
      LEFT JOIN categories c ON r.category_id = c.id 
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count 
        FROM votes 
        GROUP BY report_id
      ) v ON r.id = v.report_id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Meldungen:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Meldungen' });
  }
});

// Eine Meldung nach ID abrufen (mit Bewertungsanzahl)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, c.name as category_name,
             COALESCE(v.vote_count, 0) as vote_count
      FROM reports r 
      LEFT JOIN categories c ON r.category_id = c.id 
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count 
        FROM votes 
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Meldung nicht gefunden' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen der Meldung:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Meldung' });
  }
});

// Neue Meldung erstellen
router.post('/', reportValidationRules, async (req, res) => {
  // Validierungsfehler prüfen
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (isDev) {
      console.log('Validierungsfehler:', errors.array());
    }
    return res.status(400).json({
      message: 'Validierungsfehler',
      errors: errors.array()
    });
  }

  try {
    const {
      title,
      description,
      category_id,
      time_spent,
      costs,
      affected_employees,
      reporter_name,
      reporter_company,
      reporter_email,
      wz_category_key,
      is_anonymous
    } = req.body;

    if (isDev) {
      console.log('Empfangene Daten:', req.body);
    }

    // Prüfen, ob die Kategorie existiert
    const [categoryCheck] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categoryCheck.length === 0) {
      return res.status(400).json({ message: 'Ungültige Kategorie' });
    }

    // Bei anonymen Meldungen Kontaktdaten auf null setzen
    const finalReporterName = is_anonymous ? null : (reporter_name || null);
    const finalReporterCompany = is_anonymous ? null : (reporter_company || null);
    const finalReporterEmail = is_anonymous ? null : (reporter_email || null);

    // Meldung in die Datenbank einfügen
    const [result] = await db.query(
      `INSERT INTO reports
       (title, description, category_id, time_spent, costs, affected_employees,
        reporter_name, reporter_company, reporter_email, wz_category_key, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category_id,
        time_spent || null,
        costs || null,
        affected_employees || null,
        finalReporterName,
        finalReporterCompany,
        finalReporterEmail,
        wz_category_key || null,
        is_anonymous || false
      ]
    );

    if (isDev) {
      console.log('Meldung erfolgreich erstellt mit ID:', result.insertId);
    }

    // Neue Meldung mit Kategoriename abrufen
    const [newReport] = await db.query(`
      SELECT r.*, c.name as category_name, 0 as vote_count
      FROM reports r 
      LEFT JOIN categories c ON r.category_id = c.id 
      WHERE r.id = ?
    `, [result.insertId]);

    res.status(201).json(newReport[0]);
  } catch (error) {
    console.error('Fehler beim Erstellen der Meldung:', error);
    res.status(500).json({ message: 'Serverfehler beim Erstellen der Meldung' });
  }
});

// Meldungen nach Kategorie filtern (mit Bewertungsanzahl)
router.get('/category/:categoryId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, c.name as category_name,
             COALESCE(v.vote_count, 0) as vote_count
      FROM reports r 
      LEFT JOIN categories c ON r.category_id = c.id 
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count 
        FROM votes 
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE r.category_id = ? 
      ORDER BY r.created_at DESC
    `, [req.params.categoryId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Filtern der Meldungen nach Kategorie:', error);
    res.status(500).json({ message: 'Serverfehler beim Filtern der Meldungen' });
  }
});

// Meldungen suchen (mit Bewertungsanzahl)
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;
    
    const [rows] = await db.query(`
      SELECT r.*, c.name as category_name,
             COALESCE(v.vote_count, 0) as vote_count
      FROM reports r 
      LEFT JOIN categories c ON r.category_id = c.id 
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count 
        FROM votes 
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE r.title LIKE ? OR r.description LIKE ? 
      ORDER BY r.created_at DESC
    `, [searchQuery, searchQuery]);
    
    res.json(rows);
  } catch (error) {
    console.error('Fehler bei der Suche nach Meldungen:', error);
    res.status(500).json({ message: 'Serverfehler bei der Suche nach Meldungen' });
  }
});

module.exports = router;

