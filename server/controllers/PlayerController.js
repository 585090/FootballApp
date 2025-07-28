const bcrypt = require('bcryptjs');

const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getAllPlayers = async (req, res) => {
  try {
    const players = await getDb().collection('players').find().toArray();

    const sanitizedPlayers = players.map(player => ({
      id: player._id,
      name: player.name,
      email: player.email,
      score: typeof player.score === 'number' ? player.score : 0  // Ensure score is a number
    }));

    res.json(sanitizedPlayers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get players' });
  }
};

exports.createPlayer = async (req, res) => {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingPlayer = await getDb().collection('players').findOne({ email });
    if (existingPlayer) {
        return res.status(409).json({ error: 'Player already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Hashed password on server:', hashedPassword);
    const newPlayer = {
        email,
        name,
        password: hashedPassword,
        score: 0
    };

    const result = await getDb().collection('players').insertOne(newPlayer);
    console.log('Received on server:', newPlayer.score);    
    return res.status(201).json({
        message: 'Player registered',
        player: {
        email: newPlayer.email,
        name: newPlayer.name,
        id: result.insertedId,
        score: newPlayer.score
    }});
}

exports.loginPlayer = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const player = await getDb().collection('players').findOne({ email });
        
        if (!player) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, player.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({
            message: 'Login successful',
            player: {
                id: player._id,
                email: player.email,
                name: player.name
            }
        });
    } catch (error) {
        console.error('Login error:', error.message, error.stack);
        return res.status(500).json({ error: 'Failed to login player' });
    }
}



exports.updatePlayerScore = async (req, res) => {
    const { name, score } = req.body;

    try {
        const playerScore = await getDb().collection('players').updateOne(
            { name },                      
            { $set: { score } }            
        );

        if (playerScore.modifiedCount > 0) {
            res.json({ message: 'Player score updated successfully' });
        } else if (playerScore.matchedCount > 0) {
            res.status(400).json({ error: 'Player score is already up to date' });
        } else {
            res.status(404).json({ error: 'Player not found or score unchanged' });
        }
    
    } catch (err) {
        res.status(500).json({ error: 'Failed to update player score' });
    }
}

exports.deletePlayer = async (req, res) => {
    try {
        const result = await getDb().collection('players').deleteOne({ _id: ObjectId(req.params.id) });
        
        if (result.deletedCount > 0) {
            res.json({ message: 'Player deleted successfully' });
        } else {
            res.status(404).json({ error: 'Player not found' });
        }
    
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete player' });
    }
}