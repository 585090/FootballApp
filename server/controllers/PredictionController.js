const Prediction = require('../models/Prediction');

// GET a single prediction for a match
exports.getPrediction = async (req, res) => {
  const { email, matchid } = req.query;
  if (!email || !matchid) {
    return res.status(400).json({ error: 'Email and matchid required' });
  }

  try {
    const matchIdInt = parseInt(matchid, 10);
    const prediction = await Prediction.findOne({
      email: email.toLowerCase(),
      matchid: matchIdInt,
    });

    console.log('🎯 Sending prediction for match', matchIdInt, prediction);
    res.status(200).json(prediction || null);
  } catch (err) {
    console.error('❌ Error in getPrediction:', err);
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
};

// CREATE or UPDATE a prediction
exports.makePrediction = async (req, res) => {
  const { email, matchid, score, gamemode } = req.body;

  try {
    const updated = await Prediction.findOneAndUpdate(
      { email: email.toLowerCase(), matchid, gamemode },
      { $set: { score } },
      { new: true, upsert: true }
    );

    console.log('✅ Prediction saved:', updated);

    res.status(200).json({
      message: updated.isNew ? 'Prediction created' : 'Prediction updated',
      prediction: updated,
    });
  } catch (err) {
    console.error('❌ Error in makePrediction:', err);
    res.status(500).json({ error: 'Failed to save prediction' });
  }
};

// STORE a whole prediction table (per competition/season)
exports.storePlayersPredictionTable = async (req, res) => {
  const { email, competition, season, prediction } = req.body;

  try {
    const saved = await Prediction.findOneAndUpdate(
      { email: email.toLowerCase(), competition, season },
      { $set: { prediction } },
      { new: true, upsert: true }
    );

    console.log('💾 Predictions table saved for:', email, competition, season);
    res.json(saved);
  } catch (err) {
    console.error('❌ Backend error in storing prediction table:', err);
    res.status(500).json({ error: 'Failed to store table' });
  }
};

// GET a whole prediction table
exports.getPredictionTable = async (req, res) => {
  const { email, competition, season } = req.query;

  try {
    const table = await Prediction.findOne({ email, competition, season });
    if (!table) return res.status(404).json({ error: 'Predictions not found' });

    res.json(table.prediction);
  } catch (err) {
    console.error('❌ Error in getPredictionTable:', err);
    res.status(500).json({ error: 'Failed to fetch prediction table' });
  }
};
