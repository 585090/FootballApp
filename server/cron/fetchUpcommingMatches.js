const cron = require('node-cron');
const Match = require('../models/Match');
const { getMatches, COMPETITIONS_TO_TRACK, isRateLimit } = require('../utils/footballDataClient');
const { mapApiMatchToDoc } = require('../utils/matchMapper');

async function fetchAndStoreForCompetitionAndDate(competition, dateStr) {
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const exists = await Match.findOne({
    competition,
    kickoffDateTime: { $gte: startOfDay, $lte: endOfDay },
  });

  if (exists) {
    console.log(`[upcoming-cron] ✅ ${competition} matches already cached for ${dateStr}`);
    return;
  }

  let data;
  try {
    data = await getMatches(competition, { dateFrom: dateStr, dateTo: dateStr });
  } catch (err) {
    if (isRateLimit(err)) {
      console.warn(`[upcoming-cron] rate limit hit for ${competition} ${dateStr}, skipping`);
      return;
    }
    console.error(`[upcoming-cron] error fetching ${competition} ${dateStr}:`, err.message);
    return;
  }

  const apiMatches = data.matches || [];
  if (apiMatches.length === 0) {
    console.log(`[upcoming-cron] ℹ️ no ${competition} matches on ${dateStr}`);
    return;
  }

  const docs = apiMatches.map((m) => mapApiMatchToDoc(m, competition));
  try {
    await Match.insertMany(docs, { ordered: false });
    console.log(`[upcoming-cron] 📥 stored ${docs.length} ${competition} matches for ${dateStr}`);
  } catch (err) {
    // Duplicate-key errors are fine — another worker raced us. Log and continue.
    if (err.code === 11000 || err.writeErrors) {
      console.log(`[upcoming-cron] partial duplicate-key on ${competition} ${dateStr} — continuing`);
    } else {
      console.error(`[upcoming-cron] insertMany failed for ${competition} ${dateStr}:`, err.message);
    }
  }
}

// Every day at 02:00 (server time). Fetches the next 7 days of fixtures
// for each tracked competition.
cron.schedule('0 2 * * *', async () => {
  console.log(`🔁 Upcoming-match cron starting for ${COMPETITIONS_TO_TRACK.join(', ')}`);

  for (let i = 0; i <= 7; i++) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    for (const competition of COMPETITIONS_TO_TRACK) {
      await fetchAndStoreForCompetitionAndDate(competition, dateStr);
    }
  }

  console.log('✅ Upcoming-match cron complete');
});
