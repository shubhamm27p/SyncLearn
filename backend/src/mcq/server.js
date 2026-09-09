// Set server timezone to UTC
process.env.TZ = 'UTC';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const resultRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const codingRoutes = require('./routes/codingRoutes');
const siteRoutes = require('./routes/siteRoutes');

// ─────────────────────────────────────────────
//  Initialize Express
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
//  Security & Middleware
// ─────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        config.clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
      ].filter(Boolean);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting — general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/', limiter);

// Rate limiting — stricter for auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 login/register attempts per 15 minutes
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
app.use('/auth', authLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Digital Microsys API is running 🚀',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/auth', authRoutes);
app.use('/tests', testRoutes);
app.use('/results', resultRoutes);
app.use('/users', userRoutes);
app.use('/student', studentRoutes);
app.use('/coding', codingRoutes);
app.use('/site', siteRoutes);

// ─────────────────────────────────────────────
//  Error Handling
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

// ─────────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────────
const initMCQDB = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅  MongoDB Engine initialized.');
  } catch (error) {
    console.error('❌  Failed to initialize MCQ DB:', error.message);
  }
};

module.exports = { mcqApp: app, initMCQDB };
