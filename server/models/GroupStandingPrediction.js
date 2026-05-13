const mongoose = require('mongoose');

const GroupStandingPredictionSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  competition: { type: String, required: true }, // e.g. 'WC'
  groupCode: { type: String, required: true },   // e.g. 'Group A' or 'GROUP_A'
  rankedTeamIds: { type: [Number], required: true, default: [] },
  pointsAwarded: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

GroupStandingPredictionSchema.index(
  { email: 1, competition: 1, groupCode: 1 },
  { unique: true },
);

module.exports = mongoose.model('GroupStandingPrediction', GroupStandingPredictionSchema);
