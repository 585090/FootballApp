const mongoose = require('mongoose');

/**
 * Append-only feed of user actions. Used to render the "Recent activity"
 * section in groups (and later, per-user dashboards). Writes happen from
 * PredictionController / GroupController and the scoring cron.
 *
 * Types:
 *   PREDICTION_SAVED  payload: { matchid, homeTeam, awayTeam, score: {home, away} }
 *   GROUP_JOINED      groupId set;  payload: { groupName }
 *   GROUP_CREATED     groupId set;  payload: { groupName, joinCode }
 *   POINTS_AWARDED    payload: { matchid, homeTeam, awayTeam, predicted, actual, points }
 */
const ActivitySchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['PREDICTION_SAVED', 'GROUP_JOINED', 'GROUP_CREATED', 'POINTS_AWARDED'],
  },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  /** Set for prediction/points activities; lets the feed filter by group context. */
  gamemode: { type: String, default: null, index: true },
  /** Set for group activities; the group this action targeted. */
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

ActivitySchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
