const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getAllPlayers = async (req, res) => {
    try {
        const players = await getDb().collection('players').find().toArray();
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get players' });
    }
}

exports.createPlayer = async (req, res) => {
    try {
        const newPlayer = await getDb().collection('players').insertOne(req.body);
        res.json(newPlayer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create player' });
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