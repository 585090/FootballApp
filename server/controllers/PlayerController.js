const bcrypt = require('bcryptjs');
const Player = require('../models/Player');

// GET all players
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find({});
    const sanitized = players.map(p => ({
      id: p._id,
      name: p.name,
      email: p.email,
      points: p.points || 0
    }));
    res.json(sanitized);
  } catch (err) {
    console.error('❌ getAllPlayers error:', err);
    res.status(500).json({ error: 'Failed to get all players' });
  }
};

// GET players by groupId (if you have groupId field in schema)
exports.getPlayersByGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const players = await Player.find({ groupIds: groupId });
    res.json(players);
  } catch (err) {
    console.error('❌ getPlayersByGroup error:', err);
    res.status(500).json({ error: 'Failed to get players by group' });
  }
};

// SIGNUP
exports.createPlayer = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    console.log('📩 Incoming signup:', { email, name });

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await Player.findOne({ email });
    if (existing) {
      console.log('⚠️ Duplicate signup attempt:', email);
      return res.status(409).json({ error: 'Player already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log('🔑 Hashed password created');

    const newPlayer = new Player({
      email,
      name,
      password: hashed,
      points: 0,
      groups: []    // 👈 ensure groups field exists
    });
    await newPlayer.save();
    console.log('✅ New player saved:', newPlayer._id);

    res.status(201).json({
      message: 'Player registered',
      player: { id: newPlayer._id, email, name, points: newPlayer.points }
    });
  } catch (err) {
    console.error('❌ Signup error full:', err.message, err.stack);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};


// LOGIN
exports.loginPlayer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const player = await Player.findOne({ email });
    if (!player) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, player.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({
      message: 'Login successful',
      player: { id: player._id, email: player.email, name: player.name, points: player.points }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Failed to login player' });
  }
};

// UPDATE SCORE
exports.updatePlayerScore = async (req, res) => {
  try {
    const { email, points } = req.body;
    const result = await Player.updateOne({ email }, { $inc: { points } });

    if (result.modifiedCount > 0) return res.json({ message: 'Player score updated' });
    if (result.matchedCount > 0) return res.status(400).json({ error: 'Score unchanged' });

    res.status(404).json({ error: 'Player not found' });
  } catch (err) {
    console.error('❌ updatePlayerScore error:', err);
    res.status(500).json({ error: 'Failed to update score' });
  }
};

// DELETE
exports.deletePlayer = async (req, res) => {
  try {
    const result = await Player.deleteOne({ _id: req.params.id });
    if (result.deletedCount > 0) return res.json({ message: 'Player deleted' });
    res.status(404).json({ error: 'Player not found' });
  } catch (err) {
    console.error('❌ deletePlayer error:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
};
