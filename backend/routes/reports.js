const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');
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

const PUBLIC_REPORT_FIELDS = `
      r.id,
      r.title,
      r.description,
      r.category_id,
      c.name as category_name,
      r.time_spent,
      r.costs,
      r.affected_employees,
      r.wz_category_key,
      r.is_anonymous,
      r.status,
      r.created_at,
      r.updated_at
`;

const PUBLIC_REPORT_SELECT = `
      ${PUBLIC_REPORT_FIELDS},
      COALESCE(v.vote_count, 0) as vote_count
`;

const HAS_COMMENTS_SELECT = `
      EXISTS (SELECT 1 FROM comments WHERE report_id = r.id) AS has_comments
`;

// Alle Meldungen abrufen (mit Bewertungsanzahl)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ${PUBLIC_REPORT_SELECT},
        ${HAS_COMMENTS_SELECT}
      FROM reports r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count
        FROM votes
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE r.status = 'approved'
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Meldungen:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Meldungen' });
  }
});

// Alle Meldungen für Moderatoren abrufen (ohne Statusfilter)
router.get('/pending', verifyToken, requireRole('moderator'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ${PUBLIC_REPORT_SELECT},
        ${HAS_COMMENTS_SELECT}
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
    console.error('Fehler beim Abrufen der Meldungen für Moderatoren:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Meldungen' });
  }
});

// Status einer Meldung umschalten
router.patch('/:id/status', verifyToken, requireRole('moderator'), async (req, res) => {
  const reportId = req.params.id;

  try {
    const [existing] = await db.query('SELECT status FROM reports WHERE id = ?', [reportId]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Meldung nicht gefunden' });
    }

    const currentStatus = existing[0].status;
    let newStatus;

    if (currentStatus === 'approved') {
      newStatus = 'pending';
    } else if (currentStatus === 'pending') {
      newStatus = 'approved';
    } else {
      newStatus = 'pending';
    }

    await db.query('UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, reportId]);

    const [updatedReport] = await db.query(`
      SELECT
        ${PUBLIC_REPORT_SELECT},
        ${HAS_COMMENTS_SELECT}
      FROM reports r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count
        FROM votes
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE r.id = ?
    `, [reportId]);

    if (updatedReport.length === 0) {
      return res.status(404).json({ message: 'Meldung nicht gefunden' });
    }

    res.json(updatedReport[0]);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Meldungsstatus:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Meldungsstatus' });
  }
});

// Vertrauliche Meldungsdetails (nur Moderationsteams)
router.get('/:id/confidential', verifyToken, requireRole('moderator'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.*,
        c.name as category_name,
        COALESCE(v.vote_count, 0) as vote_count,
        ${HAS_COMMENTS_SELECT}
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
    console.error('Fehler beim Abrufen vertraulicher Meldungsdetails:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen vertraulicher Meldungsdetails' });
  }
});

// Eine Meldung nach ID abrufen (mit Bewertungsanzahl)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ${PUBLIC_REPORT_SELECT},
        ${HAS_COMMENTS_SELECT}
      FROM reports r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count
        FROM votes
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE r.id = ? AND r.status = 'approved'
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
    const finalReporterName = is_anonymous ? null : (reporter_name ?? null);
    const finalReporterCompany = is_anonymous ? null : (reporter_company ?? null);
    const finalReporterEmail = is_anonymous ? null : (reporter_email ?? null);

    // Meldung in die Datenbank einfügen
    const [result] = await db.query(
      `INSERT INTO reports
       (title, description, category_id, time_spent, costs, affected_employees,
        reporter_name, reporter_company, reporter_email, wz_category_key, is_anonymous, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category_id,
        time_spent ?? null,
        costs ?? null,
        affected_employees ?? null,
        finalReporterName,
        finalReporterCompany,
        finalReporterEmail,
        wz_category_key ?? null,
        is_anonymous ?? false,
        'pending'
      ]
    );

    if (isDev) {
      console.log('Meldung erfolgreich erstellt mit ID:', result.insertId);
    }

    // Neue Meldung mit Kategoriename abrufen
    const [newReport] = await db.query(`
      SELECT
        ${PUBLIC_REPORT_SELECT},
        ${HAS_COMMENTS_SELECT}
      FROM reports r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count
        FROM votes
        GROUP BY report_id
      ) v ON r.id = v.report_id
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
      SELECT
        ${PUBLIC_REPORT_SELECT},
        ${HAS_COMMENTS_SELECT}
      FROM reports r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count
        FROM votes
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE r.category_id = ? AND r.status = 'approved'
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
      SELECT
        ${PUBLIC_REPORT_SELECT},
        ${HAS_COMMENTS_SELECT}
      FROM reports r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) as vote_count
        FROM votes
        GROUP BY report_id
      ) v ON r.id = v.report_id
      WHERE (r.title LIKE ? OR r.description LIKE ?) AND r.status = 'approved'
      ORDER BY r.created_at DESC
    `, [searchQuery, searchQuery]);
    
    res.json(rows);
  } catch (error) {
    console.error('Fehler bei der Suche nach Meldungen:', error);
    res.status(500).json({ message: 'Serverfehler bei der Suche nach Meldungen' });
  }
});

module.exports = router;

