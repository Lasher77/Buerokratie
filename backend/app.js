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

// CORS-Konfiguration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(
    cors({
      origin: allowedOrigins,
    })
  );
} else {
  app.use(cors());
}

// Routen
const categoriesRoutes = require('./routes/categories');
const reportsRoutes = require('./routes/reports');
const votesRoutes = require('./routes/votes');
const commentsRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth');

app.use('/api/categories', categoriesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/reports/:id/comments', commentsRoutes);
app.use('/api/auth', authRoutes);

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
