const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getPrediction = async (req, res) => {
    const { email, matchid } = req.query;
    if (!email || !matchid) {
        return res.status(400).json({ error: "Email and matchid required" });
    }

    try {
        const matchIdInt = parseInt(matchid)
        const prediction = await getDb()
            .collection('predictions')
            .findOne({ 
                email: email.toLowerCase(),
                matchid: matchIdInt 
            });
        
        console.log('Sending prediction for match', matchIdInt, ':', prediction)
        res.status(200).json(prediction || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch prediction" });
    }
};

exports.makePrediction = async (req, res) => {
    const {email, matchid, score, gamemode} = req.body;

    const result = await getDb().collection('predictions').updateOne(
        { matchid, email, gamemode },
        { $set: { score } },
        { upsert: true }
    );

    console.log('Recieved prediction:', result)

    return res.status(200).json({
        message: result.upsertedCount ? 'Prediction created' : 'Prediction updated',
        prediction: { email, matchid, score, gamemode }
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

