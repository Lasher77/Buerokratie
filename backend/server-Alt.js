const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routen importieren
const categoriesRoutes = require('./routes/categories');
const reportsRoutes = require('./routes/reports');

// Routen einbinden
app.use('/api/categories', categoriesRoutes);
app.use('/api/reports', reportsRoutes);

// Einfache Route zum Testen
app.get('/', (req, res) => {
  res.json({ message: 'Willkommen bei der Bürokratieabbau-API' });
});

// Port festlegen
const PORT = process.env.PORT || 5000;

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

