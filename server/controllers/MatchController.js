const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getMatchesByDate = async (req, res) => {
    const { date } = req.query;
    try {
        const matches = await getDb().collection('matches').find({ date }).toArray();

        res.json(matches);

    } catch (error) {
        console.log('Error', error)
        return res.status(500).json({ error: 'Failed to get matches' });
    }
}