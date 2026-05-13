const Team = require('../models/Team');
const { getTeams, getStandings, COMPETITIONS, isRateLimit } = require('../utils/footballDataClient');

/**
 * For competitions with previous-season standings (league formats), we fetch
 * standings to enrich teams with their previous rank. Tournament competitions
 * (e.g. World Cup) don't have meaningful "previous season standings" the same
 * way, so we skip that call for them.
 */
const PREV_SEASON_BY_COMPETITION = {
  PL: { season: '2024' },
  // WC and CL: skip — no useful prev-season-rank concept.
};

exports.getTeamsByCompetition = async (req, res) => {
  const { competition = 'PL' } = req.params;
  const meta = COMPETITIONS[competition];

  if (!meta) {
    return res.status(400).json({ error: `Unknown competition: ${competition}` });
  }

  try {
    const cached = await Team.find({ competition });

    if (cached.length === meta.expectedTeams && meta.expectedTeams > 0) {
      console.log(`✅ Serving ${competition} teams from cache (${cached.length})`);
      return res.json(cached);
    }

    const teamsResponse = await getTeams(competition);
    const apiTeams = teamsResponse.teams || [];

    let standingsMap = new Map();
    const prevSeasonOpts = PREV_SEASON_BY_COMPETITION[competition];
    if (prevSeasonOpts) {
      try {
        const standingsRes = await getStandings(competition, prevSeasonOpts);
        const totalStandings = standingsRes.standings?.find((s) => s.type === 'TOTAL');
        if (totalStandings) {
          for (const entry of totalStandings.table) {
            standingsMap.set(entry.team.id, entry.position);
          }
        }
      } catch (err) {
        // Standings are an enrichment — log and continue without them.
        console.warn(`⚠️ Failed to fetch previous-season standings for ${competition}:`, err.message);
      }
    }

    const newTeams = apiTeams.map((team) => ({
      competition,
      teamId: team.id,
      teamName: team.shortName || team.name,
      prevSeasonRank: standingsMap.get(team.id) ?? null,
      logo: team.crest,
    }));

    if (newTeams.length > 0) {
      await Team.deleteMany({ competition });
      await Team.insertMany(newTeams);
      console.log(`💾 Saved ${newTeams.length} ${competition} teams`);
    }

    res.json(newTeams);
  } catch (err) {
    if (isRateLimit(err)) {
      console.error('⚠️ Rate limit exceeded fetching teams');
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    console.error('❌ Error fetching teams:', err.message);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};
