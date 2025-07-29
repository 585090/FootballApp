const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getMatchesByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: 'Missing date' });

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  const now = new Date();

  try {
    const matches = await getDb().collection('matches').find({
    kickoffDateTime: { $gte: start, $lte: end }
    }).toArray();

    const enrichedMatches = matches.map((match) => {
      const kickoff = new Date(match.kickoffDateTime);
      const endTime = new Date(kickoff.getTime() + 2 * 60 * 60 * 1000);
      console.log('Endtime:', endTime)
      let status;
        if (now < kickoff) {
        status = 'not started';
        } else if (now >= kickoff && now < endTime) {
        status = 'ongoing';
        } else {
        status = 'finished';
        }

      return {
        ...match,
        status,
        kickoff
      };
    });

    res.json(enrichedMatches);
  } catch (error) {
    console.log('Error', error);
    return res.status(500).json({ error: 'Failed to get matches' });
  }
};