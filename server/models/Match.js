const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  matchId: { type: Number, required: true, unique: true }, // from football-data API
  competition: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  score: {
    home: { type: Number, default: null },
    away: { type: Number, default: null },
  },
  kickoffDateTime: { type: Date, required: true },
  matchweek: { type: Number, required: true },
  status: { type: String, enum: ['not started', 'ongoing', 'finished'], default: 'not started' },
  fetchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Match', MatchSchema);