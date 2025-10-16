const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy vertrauen (Cloudflare)
app.set('trust proxy', 1);

// HTTPS erzwingen (Redirect statt 403)
app.use((req, res, next) => {
  const environment = (process.env.NODE_ENV || '').toLowerCase();
  const enforceHttpsEnv = (process.env.ENFORCE_HTTPS || '').toLowerCase();
  const httpsRequired = ['true', '1', 'yes'].includes(enforceHttpsEnv) || environment === 'production';
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';

  if (!httpsRequired || isHttps) return next();

  // Redirect auf HTTPS hinter Proxy
  return res.redirect('https://' + req.headers.host + req.url);
});

// CORS (für lokale Dev; in Prod bei gleicher Origin nicht nötig)
const defaultAllowedOrigin = 'http://localhost:3000';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultAllowedOrigin)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOriginConfig = allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;
app.use(cors({ origin: corsOriginConfig }));

// API-Routen
const categoriesRoutes = require('./routes/categories');
const reportsRoutes = require('./routes/reports');
const votesRoutes = require('./routes/votes');
const commentsRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth');
const wzCategoriesRoutes = require('./routes/wzCategories');

app.use('/api/categories', categoriesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/reports/:id/comments', commentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wz-categories', wzCategoriesRoutes);

// Health-Check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Basis-Route (API-Info)
app.get('/api', (_req, res) => res.json({ message: 'BVMW Bürokratieabbau-Plattform API' }));

// React-Build ausliefern (Production, ein Host/Port)
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// SPA-Fallback: alle Nicht-API-Routen an React
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(buildPath, 'index.html'));
});

// Fehlerbehandlung (letzte Middleware)
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Etwas ist schief gelaufen!' });
});

module.exports = app;
