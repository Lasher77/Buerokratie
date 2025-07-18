const express = require('express');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy für korrekte IP-Adressen
app.set('trust proxy', true);

// Routen
const categoriesRoutes = require('./routes/categories');
const reportsRoutes = require('./routes/reports');
const votesRoutes = require('./routes/votes');
const commentsRoutes = require('./routes/comments');

app.use('/api/categories', categoriesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/reports/:id/comments', commentsRoutes);

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
