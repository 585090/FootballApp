const axios = require('axios');
const Match = require('../models/Match');

exports.getMatchesByDate = async (req, res) => {
  const { date, competition = 'PL' } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date' });

  try {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const cached = await Match.find({
      kickoffDateTime: { $gte: startOfDay, $lte: endOfDay },
      competition,
    });

    if (cached.length > 0) {
      console.log(`✅ Serving ${cached.length} matches from cache`);
      return res.json(cached);
    }

    // fetch from API
    const API_URL = `https://api.football-data.org/v4/competitions/${competition}/matches`;
    const API_TOKEN = process.env.FOOTBALL_API_TOKEN;

    const response = await axios.get(API_URL, {
      headers: { 'X-Auth-Token': API_TOKEN },
      params: { dateFrom: date, dateTo: date },
    });

    // get IDs already in DB
    const existing = await Match.find({}, { matchId: 1 }).lean();
    const existingIds = new Set(existing.map(m => m.matchId));

    const now = new Date();
    const newMatches = response.data.matches
      .filter(m => !existingIds.has(m.id))
      .map(m => {
        const kickoff = new Date(m.utcDate);
        const endTime = new Date(kickoff.getTime() + 2 * 60 * 60 * 1000);

        let status;
        if (now < kickoff) status = 'not started';
        else if (now >= kickoff && now < endTime) status = 'ongoing';
        else status = 'finished';

        return {
          matchId: m.id,
          competition,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          score: {
            home: m.score.fullTime.home,
            away: m.score.fullTime.away,
          },
          kickoffDateTime: kickoff,
          matchweek: m.matchday,
          status,
          fetchedAt: now,
        };
      });

    if (newMatches.length > 0) {
      await Match.insertMany(newMatches);
      console.log(`💾 Saved ${newMatches.length} new matches`);
    }

    res.json([...cached, ...newMatches]);
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }
    console.error('❌ Error fetching matches:', err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

exports.getMatchesByMatchweek = async (req, res) => {
  const { competition = 'PL', matchweek } = req.query;
  if (!matchweek) return res.status(400).json({ error: 'Missing matchweek' });

  try {
    const mwInt = parseInt(matchweek, 10);

    const cached = await Match.find({ competition, matchweek: mwInt });

    if (cached.length > 0) {
      console.log(`✅ Serving ${cached.length} matches from cache`);
      return res.json(cached);
    }

    // fetch from API
    const API_URL = `https://api.football-data.org/v4/competitions/${competition}/matches`;
    const API_TOKEN = process.env.FOOTBALL_API_TOKEN;

    const response = await axios.get(API_URL, {
      headers: { 'X-Auth-Token': API_TOKEN },
      params: { matchday: mwInt },
    });

    const existing = await Match.find({}, { matchId: 1 }).lean();
    const existingIds = new Set(existing.map(m => m.matchId));

    const now = new Date();
    const newMatches = response.data.matches
      .filter(m => !existingIds.has(m.id))
      .map(m => {
        const kickoff = new Date(m.utcDate);
        const endTime = new Date(kickoff.getTime() + 2 * 60 * 60 * 1000);

        let status;
        if (now < kickoff) status = 'not started';
        else if (now >= kickoff && now < endTime) status = 'ongoing';
        else status = 'finished';

        return {
          matchId: m.id,
          competition,
          homeTeam: m.homeTeam.shortName || m.homeTeam.name,
          awayTeam: m.awayTeam.shortName || m.awayTeam.name,
          score: {
            home: m.score.fullTime.home,
            away: m.score.fullTime.away,
          },
          kickoffDateTime: kickoff,
          matchweek: m.matchday,
          status,
          fetchedAt: now,
        };
      });

    if (newMatches.length > 0) {
      await Match.insertMany(newMatches);
      console.log(`💾 Saved ${newMatches.length} new matches`);
    }

    res.json([...cached, ...newMatches]);
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }
    console.error('❌ Error fetching matches:', err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};
