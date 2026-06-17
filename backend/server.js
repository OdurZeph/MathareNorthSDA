/**
 * Standalone M-Pesa API server (optional).
 * The main church site can also mount these routes via src/app.js.
 *
 * Run: node backend/server.js
 * Or:  npm run mpesa:dev
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { ping } = require('./config/db');
const mpesaRoutes = require('./routes/mpesaRoutes');

const app = express();
const PORT = process.env.MPESA_PORT || process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'M-Pesa STK Push API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/mpesa', mpesaRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const server = app.listen(PORT, async () => {
  console.log(`\n💳  M-Pesa API → http://localhost:${PORT}`);
  console.log(`    STK Push   → POST http://localhost:${PORT}/api/mpesa/stkpush`);
  console.log(`    Callback   → POST http://localhost:${PORT}/api/mpesa/callback\n`);

  try {
    await ping();
    console.log('✅  MySQL connected\n');
  } catch (err) {
    console.warn('⚠️   MySQL unavailable:', err.message, '\n');
  }
});

module.exports = server;
