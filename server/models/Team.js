// models/Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  competition: { type: String, required: true },
  teamId: { type: Number, required: true, unique: true },
  teamName: { type: String, required: true },
  prevSeasonRank: { type: Number, default: null },
  logo: { type: String },
  fetchedAt: { type: Date, default: Date.now },
});

// Optional: index for faster lookups
TeamSchema.index({ competition: 1 });

module.exports = mongoose.model('Team', TeamSchema);
