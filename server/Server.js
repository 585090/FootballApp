require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const playersRoutes = require('./routes/Players');
const predictionRoutes = require('./routes/Predictions');
const matchRoutes = require('./routes/Matches');
const groupRoutes = require('./routes/Groups');
const teamRoutes = require('./routes/Teams');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const defaultOrigins = ['http://localhost:3000'];
const origins = [...new Set([...defaultOrigins, ...allowedOrigins])];


const app = express()
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  family: 4,                 // prefer IPv4
  dbName: 'FootyGuru',       // or put /FootyGuru in the URI
});

app.use(cors());
app.use(express.json());

const corsOptions = {
  origin(origin, cb) {
    // allow non-browser requests (no Origin) and known origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true, // set to true only if you use cookies/Authorization header and need it
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// MUST come before your routes:
app.use(cors(corsOptions));

// Make sure preflight OPTIONS are handled
app.options('*', cors(corsOptions));


// API routes
app.use('/api/players', playersRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teams', teamRoutes);

// ---------- Mongo connect & start ----------
(async function start() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,            // prefer IPv4 to avoid IPv6 egress issues
      dbName: 'FootyGuru',  // keep or remove if db is in URI path
    });

    console.log('✅ Mongo connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
})();

// Graceful shutdown (optional but good practice)
process.on('SIGTERM', () => mongoose.connection.close(() => process.exit(0)));
process.on('SIGINT',  () => mongoose.connection.close(() => process.exit(0)));