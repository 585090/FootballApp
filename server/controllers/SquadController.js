const axios = require('axios');

/**
 * Proxies football-data.org's /teams/:id endpoint and returns just the squad
 * we care about. No DB caching yet — add one if we hit rate limits.
 */
exports.getSquadByTeam = async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    if (!teamId) return res.status(400).json({ error: 'teamId required' });

    const token = process.env.FOOTBALL_API_TOKEN;
    if (!token) return res.status(500).json({ error: 'FOOTBALL_API_TOKEN not configured' });

    const resp = await axios.get(`https://api.football-data.org/v4/teams/${teamId}`, {
      headers: { 'X-Auth-Token': token },
      timeout: 15000,
    });
    const team = resp.data;

    res.json({
      teamId: team.id,
      teamName: team.shortName || team.name,
      crest: team.crest,
      squad: (team.squad || []).map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        nationality: p.nationality,
      })),
    });
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Team not found' });
    }
    console.error('❌ Error fetching squad:', err.message);
    res.status(500).json({ error: 'Failed to fetch squad' });
  }
};
