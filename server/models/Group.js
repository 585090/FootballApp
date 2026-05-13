const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  tournament: { type: String, required: true },
  gamemode: { type: Number, default: 0 },
  owner: { type: String, required: true }, // email of owner
  joinCode: { type: String, unique: true, sparse: true, uppercase: true, index: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
});

module.exports = mongoose.model('Group', GroupSchema);
