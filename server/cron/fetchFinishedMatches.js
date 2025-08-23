const cron = require('node-cron');
const Match = require('../models/Match');       // your Mongoose model
const Prediction = require('../models/Prediction'); // your Mongoose model
const { matchPointLogic } = require('../utils/calculatePoints');
const { updatePlayerScore } = require('../controllers/PlayerController');

// Run every 10 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/PL/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_TOKEN,
      },
    });

    const data = await response.json();

    for (const match of data.matches) {
      if (match.status === 'FINISHED') {
        const homeScore = match.score.fullTime.home;
        const awayScore = match.score.fullTime.away;

        // ✅ Update or insert match
        await Match.findOneAndUpdate(
          { matchId: match.id },
          {
            $set: {
              status: match.status,
              score: { home: homeScore, away: awayScore },
              homeTeam: match.homeTeam.shortName,
              awayTeam: match.awayTeam.shortName,
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
          const points = matchPointLogic(pred.score.home, pred.score.home, homeScore, awayScore);
          await updatePlayerScore(pred.email, points);
          console.log(`🏆 Updated ${pred.email} with ${points} points for match ${match.id}`);
        }
      }
    }

    console.log('✅ Finished match update cron job.');
  } catch (err) {
    console.error('❌ Error in cron job:', err.message);
  }
});
