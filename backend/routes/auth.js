const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { verifyToken, requireRole } = require('../middleware/auth');

const tokenOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' };

// Registrierung
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Ungültige Email'),
    body('password').isLength({ min: 6 }).withMessage('Passwort zu kurz'),
    body('name').optional().trim(),
    body('company').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validierungsfehler', errors: errors.array() });
    }

    const { email, password, name, company } = req.body;
    try {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'E-Mail bereits registriert' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (email, password_hash, name, company) VALUES (?, ?, ?, ?)',
        [email, passwordHash, name || null, company || null]
      );

      const token = jwt.sign({ id: result.insertId, role: 'user' }, process.env.JWT_SECRET, tokenOptions);
      res.status(201).json({ token });
    } catch (err) {
      console.error('Fehler bei der Registrierung:', err);
      res.status(500).json({ message: 'Serverfehler bei der Registrierung' });
    }
  }
);

// Moderator-Registrierung durch Admins
router.post(
  '/register-moderator',
  verifyToken,
  requireRole('admin'),
  [
    body('email').isEmail().withMessage('Ungültige Email'),
    body('password').isLength({ min: 6 }).withMessage('Passwort zu kurz'),
    body('name').optional().trim(),
    body('company').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validierungsfehler', errors: errors.array() });
    }

    const { email, password, name, company } = req.body;
    try {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [
        email,
      ]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'E-Mail bereits registriert' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (email, password_hash, name, company, role) VALUES (?, ?, ?, ?, ?)',
        [email, passwordHash, name || null, company || null, 'moderator']
      );

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error('Fehler bei der Moderator-Registrierung:', err);
      res.status(500).json({ message: 'Serverfehler bei der Registrierung' });
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validierungsfehler', errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
      }

      await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, tokenOptions);
      res.json({ token });
    } catch (err) {
      console.error('Fehler beim Login:', err);
      res.status(500).json({ message: 'Serverfehler beim Login' });
    }
  }
);

module.exports = router;
