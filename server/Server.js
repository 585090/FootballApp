require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const playersRoutes = require('./routes/Players');
const predictionRoutes = require('./routes/Predictions');
const matchRoutes = require('./routes/Matches');
const groupRoutes = require('./routes/Groups');
const teamRoutes = require('./routes/Teams');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Allowed origins: env-driven + localhost
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set(['http://localhost:3000', ...envOrigins]));

app.set('trust proxy', true);
app.use(express.json({ limit: '5mb' }));

// ---- CORS (no explicit app.options('*') needed) ----
const corsOptions = {
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Health / root
app.get('/healthz', (req, res) => res.status(200).send('ok'));
app.get('/', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/players', playersRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teams', teamRoutes);

// Start
(async () => {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not set');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
      dbName: 'FootyGuru',
    });
    console.log('✅ Mongo connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 API listening on ${PORT}`));
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
})();

process.on('SIGTERM', () => mongoose.connection.close(() => process.exit(0)));
process.on('SIGINT',  () => mongoose.connection.close(() => process.exit(0)));
