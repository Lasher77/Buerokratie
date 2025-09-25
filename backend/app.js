const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy für korrekte IP-Adressen
app.set('trust proxy', true);

// HTTPS erzwingen, wenn verfügbar
app.use((req, res, next) => {
  const httpsEnabled = req.secure || req.get('x-forwarded-proto') === 'https';
  const environment = (process.env.NODE_ENV || '').toLowerCase();
  const isLocalEnv = ['development', 'test'].includes(environment);

  if (httpsEnabled || isLocalEnv) {
    return next();
  }

  res.status(403).json({ message: 'HTTPS ist erforderlich.' });
});

// CORS-Konfiguration
const defaultAllowedOrigin = 'http://localhost:3000';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultAllowedOrigin)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOriginConfig =
  allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;

app.use(
  cors({
    origin: corsOriginConfig,
  })
);

// Routen
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

// Basis-Route
app.get('/', (req, res) => {
  res.json({ message: 'BVMW Bürokratieabbau-Plattform API' });
});

// Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Etwas ist schief gelaufen!' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route nicht gefunden' });
});

module.exports = app;
