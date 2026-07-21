const Prediction = require('../models/Prediction');
const GroupStandingPrediction = require('../models/GroupStandingPrediction');
const TournamentPrediction = require('../models/TournamentPrediction');

const TOURNAMENT_COMPETITION_BY_GAMEMODE = {
  '3': 'WC',
  '4': 'CL',
};

function emptyBreakdown() {
  return {
    match: 0,
    groupStandings: 0,
    topScorer: 0,
    topThree: 0,
    total: 0,
  };
}

function ensureBreakdown(scoresByEmail, email) {
  if (!scoresByEmail.has(email)) {
    scoresByEmail.set(email, emptyBreakdown());
  }
  return scoresByEmail.get(email);
}

function mergeRowsIntoMap(rows, scoresByEmail, field) {
  for (const row of rows) {
    const email = String(row?._id || '').toLowerCase();
    if (!email) continue;
    const points = Number(row?.points ?? 0);
    if (!Number.isFinite(points)) continue;

    const breakdown = ensureBreakdown(scoresByEmail, email);
    breakdown[field] += points;
    breakdown.total += points;
  }
}

function buildEmailMatch(emails) {
  if (!Array.isArray(emails) || emails.length === 0) return {};
  return {
    email: {
      $in: emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean),
    },
  };
}

async function getGamemodePointsByEmail({ gamemode, emails } = {}) {
  const scoresByEmail = await getGamemodeScoresByEmail({ gamemode, emails });
  return new Map(
    [...scoresByEmail.entries()].map(([email, breakdown]) => [email, breakdown.total]),
  );
}

async function getGamemodeScoresByEmail({ gamemode, emails } = {}) {
  const normalizedGamemode = String(gamemode || '').trim();
  if (!normalizedGamemode) return new Map();

  const emailMatch = buildEmailMatch(emails);
  const scoresByEmail = new Map();

  const [matchRows, wcGroupRows, tournamentRows] = await Promise.all([
    Prediction.aggregate([
      { $match: { ...emailMatch, gamemode: normalizedGamemode, pointsAwarded: { $ne: null } } },
      { $group: { _id: '$email', points: { $sum: '$pointsAwarded' } } },
    ]),
    normalizedGamemode === '3'
      ? GroupStandingPrediction.aggregate([
          { $match: { ...emailMatch, competition: 'WC', pointsAwarded: { $ne: null } } },
          { $group: { _id: '$email', points: { $sum: '$pointsAwarded' } } },
        ])
      : Promise.resolve([]),
    TOURNAMENT_COMPETITION_BY_GAMEMODE[normalizedGamemode]
      ? TournamentPrediction.aggregate([
          { $match: { ...emailMatch, competition: TOURNAMENT_COMPETITION_BY_GAMEMODE[normalizedGamemode] } },
          {
            $project: {
              email: 1,
              goldenBoot: { $ifNull: ['$pointsAwarded.goldenBoot', 0] },
              topThree: { $ifNull: ['$pointsAwarded.topThree', 0] },
            },
          },
          {
            $group: {
              _id: '$email',
              topScorer: { $sum: '$goldenBoot' },
              topThree: { $sum: '$topThree' },
            },
          },
        ])
      : Promise.resolve([]),
  ]);

  mergeRowsIntoMap(matchRows, scoresByEmail, 'match');
  mergeRowsIntoMap(wcGroupRows, scoresByEmail, 'groupStandings');
  for (const row of tournamentRows) {
    const email = String(row?._id || '').toLowerCase();
    if (!email) continue;

    const topScorer = Number(row?.topScorer ?? 0);
    const topThree = Number(row?.topThree ?? 0);
    if (!Number.isFinite(topScorer) || !Number.isFinite(topThree)) continue;

    const breakdown = ensureBreakdown(scoresByEmail, email);
    breakdown.topScorer += topScorer;
    breakdown.topThree += topThree;
    breakdown.total += topScorer + topThree;
  }

  return scoresByEmail;
}

module.exports = { getGamemodePointsByEmail, getGamemodeScoresByEmail };