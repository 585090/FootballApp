const cron = require('node-cron');
const Match = require('../models/Match');       // your Mongoose model
const Prediction = require('../models/Prediction'); // your Mongoose model
const { matchPointLogic } = require('../utils/calculatePoints');
const { updatePlayerScore } = require('../controllers/PlayerController');

// Run every hour at minute 0
cron.schedule('* * * * *', async () => {
  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/PL/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_TOKEN,
      },
    });

    const data = await response.json();

    for (const match of data.matches) {
      if (match.status === 'finished') {
        const homeScore = match.score.fullTime.home;
        const awayScore = match.score.fullTime.away;

        // ✅ Update or insert match
        await Match.findOneAndUpdate(
          { matchId: match.id },
          {
            $set: {
              status: match.status,
              score: { home: homeScore, away: awayScore },
              homeTeam: match.homeTeam.name,
              awayTeam: match.awayTeam.name,
              homeCrest: match.homeTeam.crest,
              awayCrest: match.awayTeam.crest,
              kickoffDateTime: match.utcDate,
            },
          },
          { upsert: true, new: true }
        );

        // ✅ Get predictions from Mongoose
        const predictions = await Prediction.find({ matchid: match.id });

        for (const pred of predictions) {
          const points = matchPointLogic(pred.score, `${homeScore}-${awayScore}`);
          await updatePlayerScore(pred.email, points);
        }
      }
    }

    console.log('✅ Finished match update cron job.');
  } catch (err) {
    console.error('❌ Error in cron job:', err.message);
  }
});
