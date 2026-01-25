const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// =============================================================================
// Middleware
// =============================================================================

// Security Headers
app.use(helmet());

// JSON und URL-encoded Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy vertrauen (Cloudflare, Nginx)
app.set('trust proxy', 1);

// =============================================================================
// HTTPS Enforcement
// =============================================================================
app.use((req, res, next) => {
  const environment = (process.env.NODE_ENV || '').toLowerCase();
  const enforceHttpsEnv = (process.env.ENFORCE_HTTPS || '').toLowerCase();
  const httpsRequired = ['true', '1', 'yes'].includes(enforceHttpsEnv) || environment === 'production';
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';

  if (!httpsRequired || isHttps) return next();

  // Redirect auf HTTPS
  return res.redirect('https://' + req.headers.host + req.url);
});

// =============================================================================
// CORS-Konfiguration
// =============================================================================
const defaultAllowedOrigin = 'http://localhost:3000';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultAllowedOrigin)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Erlauben wenn kein Origin (z.B. same-origin requests, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Prüfen ob Origin erlaubt ist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In Entwicklung mehr Infos loggen
    if (process.env.NODE_ENV === 'development') {
      console.warn(`CORS blockiert: ${origin} nicht in ALLOWED_ORIGINS (${allowedOrigins.join(', ')})`);
    }

    callback(new Error('Nicht erlaubt durch CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
};

app.use(cors(corsOptions));

// =============================================================================
// API-Routen
// =============================================================================
const setupRoutes = require('./routes/setup');
const categoriesRoutes = require('./routes/categories');
const reportsRoutes = require('./routes/reports');
const votesRoutes = require('./routes/votes');
const commentsRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth');
const wzCategoriesRoutes = require('./routes/wzCategories');

// Setup-Route (für Admin-Initialisierung)
app.use('/api/setup', setupRoutes);

// Standard-Routen
app.use('/api/categories', categoriesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/reports/:id/comments', commentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wz-categories', wzCategoriesRoutes);

// =============================================================================
// Health-Check & Info
// =============================================================================
app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api', (_req, res) => res.json({
  message: 'BVMW Bürokratieabbau-Plattform API',
  version: '1.0.0'
}));

// =============================================================================
// React-Build ausliefern (Production)
// =============================================================================
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// SPA-Fallback: alle Nicht-API-Routen an React
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(buildPath, 'index.html'));
});

// =============================================================================
// Error Handler
// =============================================================================
app.use((err, _req, res, _next) => {
  // CORS-Fehler speziell behandeln
  if (err.message === 'Nicht erlaubt durch CORS') {
    return res.status(403).json({
      message: 'CORS-Fehler: Origin nicht erlaubt. Prüfen Sie ALLOWED_ORIGINS in .env'
    });
  }

  console.error(err.stack);
  res.status(500).json({ message: 'Etwas ist schief gelaufen!' });
});

module.exports = app;
