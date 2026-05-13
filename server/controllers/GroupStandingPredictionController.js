const GroupStandingPrediction = require('../models/GroupStandingPrediction');

// GET predictions for the authenticated caller for a competition
exports.list = async (req, res) => {
  try {
    const { competition = 'WC' } = req.query;
    const docs = await GroupStandingPrediction.find({
      email: req.user.email,
      competition,
    });
    res.json(docs);
  } catch (err) {
    console.error('❌ Error listing group-stage predictions:', err);
    res.status(500).json({ error: 'Failed to load predictions' });
  }
};

// UPSERT a single group prediction
exports.upsert = async (req, res) => {
  try {
    const { competition = 'WC', groupCode, rankedTeamIds } = req.body;
    if (!groupCode || !Array.isArray(rankedTeamIds)) {
      return res.status(400).json({ error: 'groupCode and rankedTeamIds[] are required' });
    }

    const updated = await GroupStandingPrediction.findOneAndUpdate(
      { email: req.user.email, competition, groupCode },
      { $set: { rankedTeamIds, updatedAt: Date.now() } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.json({ message: 'Saved', prediction: updated });
  } catch (err) {
    console.error('❌ Error upserting group-stage prediction:', err);
    res.status(500).json({ error: 'Failed to save prediction' });
  }
};

// BULK upsert: save all groups in one request (mobile sends the full map)
exports.bulkUpsert = async (req, res) => {
  try {
    const { competition = 'WC', predictions } = req.body;
    if (!predictions || typeof predictions !== 'object') {
      return res.status(400).json({ error: 'predictions{} required' });
    }

    const lcEmail = req.user.email;
    const ops = Object.entries(predictions).map(([groupCode, rankedTeamIds]) => ({
      updateOne: {
        filter: { email: lcEmail, competition, groupCode },
        update: { $set: { rankedTeamIds, updatedAt: Date.now() } },
        upsert: true,
      },
    }));

    if (ops.length === 0) return res.json({ message: 'Nothing to save', count: 0 });

    const result = await GroupStandingPrediction.bulkWrite(ops);
    res.json({
      message: 'Saved',
      count: ops.length,
      upserted: result.upsertedCount ?? 0,
      modified: result.modifiedCount ?? 0,
    });
  } catch (err) {
    console.error('❌ Error bulk-saving group-stage predictions:', err);
    res.status(500).json({ error: 'Failed to save predictions' });
  }
};
