require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToMongo } = require('./db');
require('./cron/fetchUpcommingMatches');
require('./cron/fetchFinishedMatches');

const playersRoutes = require('./routes/Players');
const predictionRoutes = require('./routes/Predictions');
const matchRoutes = require('./routes/Matches');
const groupRoutes = require('./routes/Groups');
const teamRoutes = require('./routes/Teams');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- API Routes (must come first) ---
app.use('/api/players', playersRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teams', teamRoutes);

// --- Serve React static files ---
app.use(express.static(path.join(__dirname, '../client/build')));

// --- Connect to MongoDB and start server ---
connectToMongo().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
