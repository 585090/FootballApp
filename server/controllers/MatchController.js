const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const axios = require('axios');
require('dotenv').config();

exports.getMatchesByDate = async (req, res) => {
  const {date, competition='PL'} = req.query;

  if (!date) return res.status(400).json({ error: 'Missing date' });

  try {

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const cachedMatches = await getDb().collection('matches').find({
      kickoffDateTime: { $gte: startOfDay, $lte: endOfDay },
      competition,
    }).toArray();

    if (cachedMatches.length > 0) {
      console.log(`Serving ${cachedMatches.length} matches from cache`);
      return res.json(cachedMatches);
    }

    const API_URL = `https://api.football-data.org/v4/competitions/${competition}/matches`;
    const API_TOKEN = process.env.FOOTBALL_API_TOKEN;

    const response = await axios.get(API_URL, {
      headers: { 'X-Auth-Token': API_TOKEN },
      params: {
        dateFrom: date,
        dateTo: date
      }
    });

    const now = new Date();
  
    const newMatches = response.data.matches.map((match) => {
      const kickoff = new Date(match.utcDate);
      const endTime = new Date(kickoff.getTime() + 2 * 60 * 60 * 1000);

      let status;
      if (now < kickoff) {
        status = 'not started';
      } else if (now >= kickoff && now < endTime) {
        status = 'ongoing'
      } else {
        status = 'finished'
      }

      return {
        matchId: match.id,
        competition,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        score: match.score.fullTime,
        kickoffDateTime: kickoff,
        status,
        fetchedAt: new Date()
      };
    });

    if (newMatches.length > 0) {
      await getDb().collection('matches').insertMany(newMatches);
      console.log(`Saved ${newMatches.length} new matches to DB`);
    }
    
    res.json(newMatches);

  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded. Try again later.');
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait and try again.' });
    }

    console.error('Error fetching matches from API', error.message);
    return res.status(500).json({ error: 'Failed to fetch matches from external API' });
  }
};