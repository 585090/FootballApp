const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getPrediction = async (req, res) => {
    const { prediction, matchid, email } = req.body;
    try {
        const pred = await getDb.collection('prediction').findOne({prediction, matchid, email });
        const player = await getDb.collection('players').findOne({ email });
        if(!player) {
            return res.status(401).json({ error: 'Player doesent exist!' });
        }

        res.status(200).json({
            message: 'Prediction:',
            pred: {
                id: pred._id,
                prediction: pred.prediction,
                match: pred.match,
                email: pred.email
            }
        });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to get prediction' });
    }
}