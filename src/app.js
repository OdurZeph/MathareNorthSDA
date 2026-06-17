require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Rate limiting ───────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later' }
});

app.use('/api/', apiLimiter);

// ── Compression (gzip/brotli) ─────────────────────────────────────────────────
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5000',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000',
  'https://mnchurch.org',
  'https://www.mnchurch.org',
];

const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || extraOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors());

// ── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Static files (serve the frontend from project root) ──────────────────────
const path = require('path');
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Vary', 'Accept');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Church Backend API is running', timestamp: new Date() });
});

const validateTurnstile = require('./middleware/validateTurnstile');

const contactRoutes     = require('./routes/contact.routes');
const prayerRoutes      = require('./routes/prayer.routes');
const membershipRoutes  = require('./routes/membership.routes');
const dedicationRoutes  = require('./routes/dedication.routes');
const authRoutes        = require('./routes/auth.routes');
const adminRoutes       = require('./routes/admin.routes');
const mpesaRoutes       = require('./routes/mpesa.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const newsletterRoutes   = require('./routes/newsletter.routes');
const { createTransferRequest } = require('./controllers/membership.controller');
const { createPrayerRequest } = require('./controllers/prayer.controller');

// ── Primary API routes (used by the website) ────────────────────────────────
app.use('/api/contact', validateTurnstile, contactRoutes);
app.use('/api/prayer', validateTurnstile, prayerRoutes);
app.use('/api/membership', validateTurnstile, membershipRoutes);
app.use('/api/child-dedication', validateTurnstile, dedicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api/newsletter', newsletterRoutes);

// ── Route aliases (alternate paths) ───────────────────────────────────────────
app.post('/api/prayer-request', validateTurnstile, require('./middleware/validatePrayer'), createPrayerRequest);
app.post('/api/membership-transfer', validateTurnstile, createTransferRequest);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  const isCors = err.message?.startsWith('CORS:');
  res.status(isCors ? 403 : 500).json({
    success: false,
    message: isCors ? err.message : 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

module.exports = app;
