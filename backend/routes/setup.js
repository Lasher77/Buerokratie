const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const tokenOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' };

/**
 * GET /api/setup/status
 * Prüft ob die Anwendung initialisiert werden muss
 */
router.get('/status', async (req, res) => {
  try {
    // Prüfen ob Admins existieren
    const [admins] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['admin']
    );

    const needsSetup = admins[0].count === 0;

    res.json({
      needsSetup,
      message: needsSetup
        ? 'Kein Administrator vorhanden. Bitte erstellen Sie einen Admin-Account.'
        : 'System ist initialisiert.'
    });
  } catch (error) {
    console.error('Fehler beim Prüfen des Setup-Status:', error);

    // Wenn die Tabelle nicht existiert, brauchen wir Setup
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({
        needsSetup: true,
        message: 'Datenbank nicht initialisiert. Bitte führen Sie die Datenbankmigrationen aus.'
      });
    }

    res.status(500).json({ message: 'Serverfehler beim Prüfen des Setup-Status' });
  }
});

/**
 * POST /api/setup/admin
 * Erstellt den ersten Administrator (nur wenn noch keiner existiert)
 */
router.post(
  '/admin',
  [
    body('email').isEmail().withMessage('Ungültige E-Mail-Adresse').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Passwort muss mindestens 8 Zeichen lang sein')
      .matches(/[A-Z]/)
      .withMessage('Passwort muss mindestens einen Großbuchstaben enthalten')
      .matches(/[0-9]/)
      .withMessage('Passwort muss mindestens eine Zahl enthalten'),
    body('name').optional().trim().escape()
  ],
  async (req, res) => {
    // Validierungsfehler prüfen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validierungsfehler',
        errors: errors.array()
      });
    }

    try {
      // Prüfen ob bereits Admins existieren
      const [existingAdmins] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['admin']
      );

      if (existingAdmins[0].count > 0) {
        return res.status(403).json({
          message: 'Setup bereits abgeschlossen. Ein Administrator existiert bereits.'
        });
      }

      const { email, password, name } = req.body;

      // Prüfen ob E-Mail bereits verwendet wird
      const [existingUser] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          message: 'Diese E-Mail-Adresse ist bereits registriert.'
        });
      }

      // Passwort hashen
      const passwordHash = await bcrypt.hash(password, 12);

      // Admin erstellen
      const [result] = await db.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        [email, passwordHash, name || null, 'admin']
      );

      // Token erstellen
      const token = jwt.sign(
        { id: result.insertId, role: 'admin' },
        process.env.JWT_SECRET,
        tokenOptions
      );

      console.log(`Admin-Account erstellt: ${email}`);

      res.status(201).json({
        message: 'Administrator erfolgreich erstellt',
        token
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Administrators:', error);
      res.status(500).json({ message: 'Serverfehler beim Erstellen des Administrators' });
    }
  }
);

module.exports = router;
