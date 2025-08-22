const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
});

module.exports = mongoose.model('Player', PlayerSchema);