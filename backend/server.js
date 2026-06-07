require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const initDB = require('./config/initDB');
const registrationRoutes = require('./routes/registrationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/register', registrationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/sponsor-inquiry', sponsorRoutes);
app.use('/api', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ICAIH 2026 API is running.' });
});

// Optional static frontend serving when backend is used directly
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use(errorHandler);

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ICAIH 2026 backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  });
