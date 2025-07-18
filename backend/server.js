const app = require('./app');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
