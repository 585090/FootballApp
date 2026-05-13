const { getStandings, isRateLimit } = require('../utils/footballDataClient');

/**
 * Returns the current standings for a competition. For league formats (PL),
 * this is the league table. For tournament formats (WC), this is the group
 * stage standings broken down by group.
 *
 * Note: not cached. football-data.org standings change frequently during the
 * tournament — clients should rate-limit themselves or we add a short TTL
 * cache when traffic warrants it.
 */
exports.getStandingsByCompetition = async (req, res) => {
  const { competition = 'PL' } = req.params;
  const { season } = req.query;

  try {
    const data = await getStandings(competition, season ? { season } : {});

    // For WC, data.standings is one entry per group (A-H), each with a "table".
    // For PL, data.standings has TOTAL/HOME/AWAY entries.
    res.json({
      competition,
      season: data.season,
      standings: data.standings,
    });
  } catch (err) {
    if (isRateLimit(err)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    console.error('❌ Error fetching standings:', err.message);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
};
