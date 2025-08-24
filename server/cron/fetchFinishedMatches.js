const cron = require('node-cron');
const Match = require('../models/Match');       // your Mongoose model
const Prediction = require('../models/Prediction'); // your Mongoose model
const { matchPointLogic } = require('../utils/calculatePoints');
const { incrementPlayerScore } = require('../controllers/PlayerController');

// Run every 10 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/PL/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_TOKEN,
      },
    });

    const data = await response.json();
    const validStatuses = ['FINISHED', 'IN_PLAY', 'PAUSED'];

    for (const match of data.matches) {
      if (validStatuses.includes(match.status)) {
        const homeScore = match.score.fullTime.home || match.score.halfTime.home || 0;
        const awayScore = match.score.fullTime.away || match.score.halfTime.away || 0;
        console.log(`⚽ Processing finished match: ${match.id} - ${match.homeTeam.shortName} ${homeScore} vs ${awayScore} ${match.awayTeam.shortName} status ${match.status}`);
        // ✅ Update or insert match
        await Match.findOneAndUpdate(
          { matchId: match.id },
          {
            $set: {
              status: match.status,
              score: { home: homeScore , away: awayScore },
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
          if (!pred.score) continue;
          if (pred.pointsAwarded) continue;
          
          const points = matchPointLogic(pred.score.home, pred.score.away, homeScore, awayScore);
          await incrementPlayerScore(pred.email, points);
          pred.pointsAwarded = points;
          await pred.save();
          console.log(`${pred.email} predicted ${pred.score.home}-${pred.score.away}, actual ${homeScore}-${awayScore} for match ${match.id}, awarded ${points} points`);
        }
      }
    }

    console.log('✅ Finished match update cron job.');
  } catch (err) {
    console.error('❌ Error in cron job:', err.message);
  }
});