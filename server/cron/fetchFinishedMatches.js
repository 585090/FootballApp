const cron = require('node-cron');
const { getDb } = require('../db'); // your DB connection
const { matchPointLogic } = require('../utils/calculatePoints')
const { updatePlayerScore } = require('../controllers/PlayerController');

cron.schedule('* 0 * * *', async () => { // every 5 minutes
    try {
        const response = await fetch('https://api.football-data.org/v4/competitions/PL/matches', {
            headers: {
            'X-Auth-Token': process.env.FOOTBALL_API_TOKEN
            }     
        });

        const data = await response.json();

        for (const match of data.matches) {
            if (match.status === 'FINISHED') {
                const homeScore = match.score.fullTime.home;
                const awayScore = match.score.fullTime.away;

                // Update match in DB
                await getDb().collection('matches').updateOne(
                    { matchId: match.id },
                    { 
                        $set: {
                            status: match.status,
                            score: { home: homeScore, away: awayScore },
                            homeTeam: match.homeTeam.name,
                            awayTeam: match.awayTeam.name,
                            homeCrest: match.homeTeam.crest,
                            awayCrest: match.awayTeam.crest,
                            kickoffDateTime: match.utcDate
                        }
                    }
                );

                // Optionally, update player scores for this match
                const predictions = await getDb().collection('prediction').find({ matchid: match.id }).toArray();
                for (const pred of predictions) {
                    const points = matchPointLogic(pred.score, `${homeScore}-${awayScore}`);
                    await updatePlayerScore(pred.email, points);
                }
            }
        }

        console.log('Finished match update cron job.');
    } catch (err) {
        console.error('Error in cron job:', err);
    }
});
