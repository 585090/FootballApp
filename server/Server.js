require('dotenv').config();
require('./cron/fetchFinishedMatches')

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

// ---- Explicit CORS (handles preflight reliably) ----
const allowed = new Set([
  'http://localhost:3000',
  'https://footyguru.netlify.app'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowed.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin'); // good practice when echoing origin
    res.header('Access-Control-Allow-Credentials', 'true'); // only needed if you use cookies/Authorization
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '5mb' }));

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
