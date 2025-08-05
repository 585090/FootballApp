require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToMongo } = require('./db');
require('./cron/fetchUpcommingMatches');
const playersRoutes = require('./routes/Players');
const predictionRoutes = require('./routes/Predictions')
const matchRoutes = require('./routes/Matches')
const groupRoutes = require('./routes/Groups')

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/players', playersRoutes);
app.use('/api/prediction', predictionRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/groups', groupRoutes)

connectToMongo().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

});