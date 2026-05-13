const cron = require('node-cron');
const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const { matchPointLogic } = require('../utils/calculatePoints');
const { incrementPlayerScore } = require('../controllers/PlayerController');
const { getMatches, COMPETITIONS_TO_TRACK, isRateLimit } = require('../utils/footballDataClient');
const { mapApiMatchToDoc } = require('../utils/matchMapper');

const FINAL_STATUSES = new Set(['FINISHED', 'IN_PLAY', 'PAUSED']);

async function processCompetition(competition) {
  let data;
  try {
    data = await getMatches(competition);
  } catch (err) {
    if (isRateLimit(err)) {
      console.warn(`[finished-cron] rate limit hit for ${competition}, skipping`);
      return;
    }
    console.error(`[finished-cron] failed to fetch ${competition}:`, err.message);
    return;
  }

  for (const apiMatch of data.matches || []) {
    if (!FINAL_STATUSES.has(apiMatch.status)) continue;

    const doc = mapApiMatchToDoc(apiMatch, competition);
    const fullTimeHome = apiMatch.score?.fullTime?.home;
    const fullTimeAway = apiMatch.score?.fullTime?.away;
    const halfTimeHome = apiMatch.score?.halfTime?.home;
    const halfTimeAway = apiMatch.score?.halfTime?.away;
    const scoreHome = fullTimeHome ?? halfTimeHome ?? 0;
    const scoreAway = fullTimeAway ?? halfTimeAway ?? 0;
    doc.score = { home: scoreHome, away: scoreAway };

    console.log(
      `⚽ [${competition}] ${doc.homeTeam} ${scoreHome}-${scoreAway} ${doc.awayTeam} · ${apiMatch.status}`,
    );

    await Match.findOneAndUpdate(
      { matchId: doc.matchId },
      { $set: doc },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (apiMatch.status !== 'FINISHED') continue;

    const predictions = await Prediction.find({ matchid: apiMatch.id });
    for (const pred of predictions) {
      if (!pred.score) continue;
      if (pred.pointsAwarded !== null && pred.pointsAwarded !== undefined) continue;

      const points = matchPointLogic(pred.score.home, pred.score.away, scoreHome, scoreAway);
      await incrementPlayerScore(pred.email, points);
      pred.pointsAwarded = points;
      await pred.save();
      console.log(
        `🏅 ${pred.email}: ${pred.score.home}-${pred.score.away} vs ${scoreHome}-${scoreAway} → ${points} pts (match ${apiMatch.id})`,
      );
    }
  }
}

// Every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  console.log(`🔁 Finished-match cron starting for ${COMPETITIONS_TO_TRACK.join(', ')}`);
  for (const competition of COMPETITIONS_TO_TRACK) {
    await processCompetition(competition);
  }
  console.log('✅ Finished-match cron complete');
});
