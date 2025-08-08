const cron = require('node-cron');
const axios = require('axios');
const { getDb } = require('../db');
require('dotenv').config();

const API_TOKEN = process.env.FOOTBALL_API_TOKEN;
const API_URL = 'https://api.football-data.org/v4/competitions/PL/matches';

async function fetchAndStoreMatchesForDate(dateStr) {
  const db = getDb();
  const collection = db.collection('matches');

  // Check if matches already exist for the day
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const exists = await collection.findOne({
    kickoffDateTime: { $gte: startOfDay, $lte: endOfDay },
    competition: 'PL',
  });

  if (exists) {
    console.log(`✅ Matches already exist for ${dateStr}`);
    return;
  }

  try {
    const response = await axios.get(API_URL, {
      headers: { 'X-Auth-Token': API_TOKEN },
      params: { dateFrom: dateStr, dateTo: dateStr }
    });

    const now = new Date();
    const matches = response.data.matches.map((match) => ({
      matchId: match.id,
      competition: 'PL',
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: match.score.fullTime,
      kickoffDateTime: new Date(match.utcDate),
      status: now < new Date(match.utcDate) ? 'not started' : 'finished',
      fetchedAt: new Date()
    }));

    if (matches.length > 0) {
      await collection.insertMany(matches);
      console.log(`📥 Stored ${matches.length} matches for ${dateStr}`);
    } else {
      console.log(`ℹ️ No matches found for ${dateStr}`);
    }

  } catch (error) {
    console.error(`❌ Error fetching matches for ${dateStr}:`, error.message);
  }
}

// Schedule: every night at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🔁 Running daily match fetch...');

  for (let i = 0; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    await fetchAndStoreMatchesForDate(dateStr);
  }

  console.log('✅ Match fetch job complete');
});
