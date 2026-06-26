const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const initDB = require('./config/initDB');
const registrationRoutes = require('./routes/registrationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/register', registrationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/sponsor-inquiry', sponsorRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ICAIH 2026 API is running.' });
});

// Optional static frontend serving when backend is used directly
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use((err, req, res, next) => {
  if (req.path && req.path.startsWith('/api/applications')) {
    console.error('Application submit middleware error:', err.message || err);
    return res.status(err.status || 400).json({
      ok: false,
      message: err.message || 'Application submission failed.'
    });
  }
  return next(err);
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
