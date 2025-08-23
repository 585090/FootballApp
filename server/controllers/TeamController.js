const axios = require('axios');
const Team = require('../models/Team');
require('dotenv').config();

exports.getTeamsByCompetition = async (req, res) => {
  const { competition = 'PL' } = req.params;

  try {
    // Look up in DB
    const cachedTeams = await Team.find({ competition });

    const expectedTeamCounts = {
      PL: 20,
      CL: 32,
      // extend if needed
    };
    const expectedCount = expectedTeamCounts[competition] || 0;

    if (cachedTeams.length === expectedCount && expectedCount > 0) {
      console.log(`✅ Serving ${competition} from cache`);
      return res.json(cachedTeams);
    }

    // Otherwise fetch fresh from API
    const API_URL = `https://api.football-data.org/v4/competitions/${competition}/teams`;
    const API_URL_PrevStanding = `https://api.football-data.org/v4/competitions/${competition}/standings?season=2024`;
    const API_TOKEN = process.env.FOOTBALL_API_TOKEN;

    const responseTeams = await axios.get(API_URL, {
      headers: { 'X-Auth-Token': API_TOKEN },
    });

    const responseStandings = await axios.get(API_URL_PrevStanding, {
      headers: { 'X-Auth-Token': API_TOKEN },
    });

    const standings = responseStandings.data.standings.find(
      (s) => s.type === 'TOTAL'
    );
    const standingsMap = new Map();
    standings.table.forEach((entry) => {
      standingsMap.set(entry.team.id, entry.position);
    });

    const newTeams = responseTeams.data.teams.map((team) => ({
      competition,
      teamId: team.id,
      teamName: team.shortName,
      prevSeasonRank: standingsMap.get(team.id) || null,
      logo: team.crest,
    }));

    if (newTeams.length > 0) {
      // Remove old records, then save
      await Team.deleteMany({ competition });
      await Team.insertMany(newTeams);
      console.log(`💾 Saved ${newTeams.length} new ${competition} teams`);
    }

    res.json(newTeams);
  } catch (err) {
    if (err.response?.status === 429) {
      console.error('⚠️ Rate limit exceeded');
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    console.error('❌ Error fetching teams:', err.message);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};
