require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToMongo } = require('./db');
const playersRoutes = require('./routes/Players');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/players', playersRoutes);

connectToMongo().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

});