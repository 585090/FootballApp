require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const { connectToMongo } = require('./db');
const playersRoutes = require('./routes/Players');
const predictionRoutes = require('./routes/Predictions');
const matchRoutes = require('./routes/Matches');
const groupRoutes = require('./routes/Groups');
const teamRoutes = require('./routes/Teams');

const app = express()
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  family: 4,                 // prefer IPv4
  dbName: 'FootyGuru',       // or put /FootyGuru in the URI
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/players', playersRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teams', teamRoutes);

(async () => {
  try {
    await connectToMongo();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API ready on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('❌ Mongo connect failed:', e.message);
    process.exit(1);
  }
})();