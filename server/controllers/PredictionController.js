const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getPrediction = async (req, res) => {
    const matchidInt = parseInt(req.query.matchid);
    const email = req.query.email;

    if (!email || isNaN(matchidInt)) {
        return res.status(400).json({ error: 'Missing or invalid matchid/email' });
    }   

    try {
        
        const player = await getDb().collection('players').findOne({ email });
        if(!player) {
            return res.status(401).json({ error: 'Player doesent exist!' });
        }

        const pred = await getDb().collection('prediction').findOne({ matchid: matchidInt, email });
        
        if (!pred) {
            return res.status(404).json({ error: 'Prediction not found' });
        }

        res.status(200).json({
            message: 'Prediction:',
            pred: {
                id: pred._id,
                matchid: pred.matchid,
                email: pred.email,
                score: pred.score
            }
        });

    } catch (error) {
        console.error("❌ Backend error in getPrediction:", error);
        return res.status(500).json({ error: 'Failed to get prediction' });
    }
}

exports.makePrediction = async (req, res) => {
    const {score, matchid, email} = req.body;
    const matchIdInt = parseInt(matchid)
    const result = await getDb().collection('prediction').updateOne(
        { matchid: matchIdInt, email },
        { $set: { score } },
        { upsert: true }
    );

    console.log('Recieved prediction:', result)

    return res.status(200).json({
        message: result.upsertedCount ? 'Prediction created' : 'Prediction updated',
        prediction: { score, matchid, email }
    });
}

exports.storePlayersPredictionTable = async (req, res) => {
    const { email, competition, season, prediction } = req.body;

    try {
        const savedPrediction = await getDb().collection('predictions').findOneAndUpdate(
            { email, competition, season },
            { $set: { email, competition, season, prediction } },
            {upsert: true, new: true}
        );

        res.json(savedPrediction)
        console.log('Predictions saved for:', savedPrediction.email)
    
    } catch (error) {
        console.error("❌ Backend error in storing prediction table:", error);
        return res.status(500).json({ error: 'Failed to store table' })
    }
};

exports.getPredictionTable = async (req, res) => {
    const {email, competition, season} = req.query;

    try {
        const predictionTable = await getDb().collection('predictions').findOne({
            email, competition, season
        })

        if(!predictionTable) return res.status(400).json({error: 'Predictions not found'})
        res.json(predictionTable.prediction);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: '❌ Backend error, failed to fetch prediction table'})
    }
}

