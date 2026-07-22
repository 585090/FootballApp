const cron = require('node-cron');
const Match = require('../models/Match');
const GroupStandingPrediction = require('../models/GroupStandingPrediction');
const TournamentResult = require('../models/TournamentResult');
const TournamentPrediction = require('../models/TournamentPrediction');
const { goldenBootPointLogic, topThreePointLogic } = require('../utils/calculatePoints');
const {
  normalizeGroupCode,
  extractGroupStandings,
  calculateGroupStandingPoints,
} = require('../utils/groupStandingScoring');
const { incrementPlayerScore } = require('../controllers/PlayerController');
const {
  getMatches,
  getStandings,
  getScorers,
  COMPETITIONS_TO_TRACK,
  isRateLimit,
} = require('../utils/footballDataClient');

// Competitions to attempt tournament-wide scoring for. WC + CL have a defined
// finish (knockout final), PL does not, so it's excluded.
const TOURNAMENT_COMPETITIONS = ['WC', 'CL'];

// Returns true once every match in the competition has FINISHED status —
// our trigger for considering the tournament complete enough to auto-resolve.
async function isTournamentComplete(competition) {
  const total = await Match.countDocuments({ competition });
  if (total === 0) return false;
  const finished = await Match.countDocuments({ competition, status: 'finished' });
  return finished === total;
}

async function isGroupStageComplete(competition) {
  const total = await Match.countDocuments({ competition, group: { $ne: null } });
  if (total === 0) return false;

  const finished = await Match.countDocuments({
    competition,
    group: { $ne: null },
    status: 'finished',
  });
  return finished === total;
}

async function payoutWorldCupGroupStandings() {
  const predictions = await GroupStandingPrediction.find({
    competition: 'WC',
    pointsAwarded: null,
  });
  if (predictions.length === 0) return 0;

  const complete = await isGroupStageComplete('WC');
  if (!complete) return 0;

  let standingsData;
  try {
    standingsData = await getStandings('WC');
  } catch (err) {
    if (isRateLimit(err)) {
      console.warn('[tournament-cron] rate limit on WC group standings, retrying next cycle');
    } else {
      console.error('[tournament-cron] failed to fetch WC group standings:', err.message);
    }
    return 0;
  }

  const actualGroups = extractGroupStandings(standingsData?.standings);
  if (actualGroups.size === 0) return 0;

  let scored = 0;
  for (const pred of predictions) {
    const actualOrder = actualGroups.get(normalizeGroupCode(pred.groupCode));
    if (!actualOrder) continue;

    const points = calculateGroupStandingPoints(pred.rankedTeamIds, actualOrder);
    if (points > 0) {
      await incrementPlayerScore(pred.email, points);
    }

    pred.pointsAwarded = points;
    await pred.save();
    scored += 1;
    console.log(
      `🏁 ${pred.email}: group ${pred.groupCode} ${points} pts (WC group standings)`,
    );
  }

  return scored;
}

function hasResolvedGoldenBoot(result) {
  return result?.goldenBoot?.playerId != null;
}

function hasResolvedTopThree(result) {
  return Array.isArray(result?.topThreeTeamIds) && result.topThreeTeamIds.length >= 3;
}

function pickWinnerAndLoser(match) {
  const winner = match?.score?.winner;
  if (winner === 'HOME_TEAM') {
    return {
      winner: { id: match.homeTeam?.id ?? null, name: match.homeTeam?.name ?? null },
      loser: { id: match.awayTeam?.id ?? null, name: match.awayTeam?.name ?? null },
    };
  }
  if (winner === 'AWAY_TEAM') {
    return {
      winner: { id: match.awayTeam?.id ?? null, name: match.awayTeam?.name ?? null },
      loser: { id: match.homeTeam?.id ?? null, name: match.homeTeam?.name ?? null },
    };
  }
  return null;
}

function topThreeFromFinishedMatches(matches) {
  const finalMatch = matches.find((match) => match?.stage === 'FINAL');
  const thirdPlaceMatch = matches.find((match) => match?.stage === 'THIRD_PLACE');
  const finalOutcome = pickWinnerAndLoser(finalMatch);
  const thirdPlaceOutcome = pickWinnerAndLoser(thirdPlaceMatch);
  if (!finalOutcome || !thirdPlaceOutcome) return null;

  const ids = [
    finalOutcome.winner.id,
    finalOutcome.loser.id,
    thirdPlaceOutcome.winner.id,
  ];
  if (ids.some((id) => id == null)) return null;

  return {
    topThreeTeamIds: ids,
    topThreeTeamNames: [
      finalOutcome.winner.name,
      finalOutcome.loser.name,
      thirdPlaceOutcome.winner.name,
    ],
  };
}

// Attempts to pull final top scorer + top-3 standings from football-data.org.
// Each slice resolves independently so a rate limit on one endpoint does not
// block the other from being persisted and scored on this cycle.
async function autoFetchResult(competition) {
  const [scorersResult, standingsResult] = await Promise.allSettled([
    getScorers(competition, { limit: 1 }),
    getStandings(competition),
  ]);

  let goldenBoot = null;
  if (scorersResult.status === 'fulfilled') {
    const top = Array.isArray(scorersResult.value?.scorers) && scorersResult.value.scorers[0];
    if (top?.player?.id) {
      goldenBoot = {
        playerId: top.player.id,
        playerName: top.player.name ?? null,
        goals: top.goals ?? null,
      };
    }
  } else if (isRateLimit(scorersResult.reason)) {
    console.warn(`[tournament-cron] scorer rate limit on ${competition}, retrying that slice next cycle`);
  } else {
    console.error(`[tournament-cron] scorer auto-fetch failed for ${competition}:`, scorersResult.reason.message);
  }

  // Knockout tournaments expose the final ranking as a TOTAL standings group
  // labelled "FINAL" or similar. We take the first table in any non-group
  // stage and grab positions 1–3.
  let topThreeTeamIds = null;
  let topThreeTeamNames = null;
  if (standingsResult.status === 'fulfilled') {
    const candidate = (standingsResult.value?.standings || []).find((g) => {
      if (g.type !== 'TOTAL') return false;
      if (g.group) return false;
      return Array.isArray(g.table) && g.table.length >= 3;
    });
    if (candidate) {
      const topThreeRows = candidate.table.slice(0, 3);
      const ids = topThreeRows.map((row) => row.team?.id).filter((id) => id != null);
      if (ids.length === 3) {
        topThreeTeamIds = ids;
        topThreeTeamNames = topThreeRows.map((row) => row.team?.name ?? null);
      }
    }
  } else if (isRateLimit(standingsResult.reason)) {
    console.warn(`[tournament-cron] standings rate limit on ${competition}, retrying that slice next cycle`);
  } else {
    console.error(`[tournament-cron] standings auto-fetch failed for ${competition}:`, standingsResult.reason.message);
  }

  if (!topThreeTeamIds) {
    try {
      const matchesData = await getMatches(competition, { status: 'FINISHED' });
      const derived = topThreeFromFinishedMatches(matchesData?.matches || []);
      if (derived) {
        topThreeTeamIds = derived.topThreeTeamIds;
        topThreeTeamNames = derived.topThreeTeamNames;
      }
    } catch (err) {
      if (isRateLimit(err)) {
        console.warn(`[tournament-cron] match-result rate limit on ${competition}, retrying top-3 slice next cycle`);
      } else {
        console.error(`[tournament-cron] match-result auto-fetch failed for ${competition}:`, err.message);
      }
    }
  }

  if (!goldenBoot && !topThreeTeamIds) return null;
  return { goldenBoot, topThreeTeamIds, topThreeTeamNames };
}

// Pays out points to every prediction that hasn't been scored yet for the
// given finalized TournamentResult. Idempotent: predictions with non-null
// pointsAwarded.goldenBoot / pointsAwarded.topThree are left alone.
async function payoutPoints(result) {
  const predictions = await TournamentPrediction.find({
    competition: result.competition,
    season: result.season,
  });
  if (predictions.length === 0) return 0;

  const actualGoldenBootId = result.goldenBoot?.playerId ?? null;
  const actualTopThree = result.topThreeTeamIds || [];
  const goldenBootResolved = hasResolvedGoldenBoot(result);
  const topThreeResolved = hasResolvedTopThree(result);

  let scored = 0;
  for (const pred of predictions) {
    const predictedTopThree = [1, 2, 3].map((rank) => {
      const slot = (pred.topThree || []).find((p) => p.rank === rank);
      return slot?.teamId ?? null;
    });

    const needsGoldenBoot = goldenBootResolved && pred.pointsAwarded?.goldenBoot == null;
    const needsTopThree = topThreeResolved && pred.pointsAwarded?.topThree == null;
    if (!needsGoldenBoot && !needsTopThree) continue;

    let delta = 0;
    if (needsGoldenBoot) {
      const pts = goldenBootPointLogic(pred.goldenBoot?.playerId ?? null, actualGoldenBootId);
      pred.pointsAwarded.goldenBoot = pts;
      delta += pts;
    }
    if (needsTopThree) {
      const pts = topThreePointLogic(predictedTopThree, actualTopThree);
      pred.pointsAwarded.topThree = pts;
      delta += pts;
    }

    if (delta > 0) {
      await incrementPlayerScore(pred.email, delta);
    }
    await pred.save();
    scored += 1;
    console.log(
      `🏆 ${pred.email}: golden boot ${pred.pointsAwarded.goldenBoot ?? '—'} pts, top 3 ${pred.pointsAwarded.topThree ?? '—'} pts (${result.competition}/${result.season})`,
    );
  }
  return scored;
}

async function processCompetition(competition) {
  if (competition === 'WC') {
    await payoutWorldCupGroupStandings();
  }

  const season = String(new Date().getFullYear());
  let result = await TournamentResult.findOne({ competition, season });

  // Manual overrides are sticky — never overwrite them with auto-fetch data,
  // but still pay out points if not done yet.
  if (result?.source !== 'manual') {
    const complete = await isTournamentComplete(competition);
    if (!complete && !result?.finalizedAt) {
      return; // wait until the tournament has finished
    }
    const auto = await autoFetchResult(competition);
    if (auto) {
      const update = {
        source: 'auto',
        finalizedAt: result?.finalizedAt || new Date(),
        updatedAt: Date.now(),
      };
      if (auto.goldenBoot) {
        update.goldenBoot = auto.goldenBoot;
      }
      if (auto.topThreeTeamIds) {
        update.topThreeTeamIds = auto.topThreeTeamIds;
        update.topThreeTeamNames = auto.topThreeTeamNames || [];
      }
      result = await TournamentResult.findOneAndUpdate(
        { competition, season },
        {
          $set: update,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }
  }

  if (!result?.finalizedAt) return;

  const scored = await payoutPoints(result);
  if (scored > 0 && !result.resolvedAt) {
    result.resolvedAt = new Date();
    await result.save();
  }
}

// Every 30 minutes — checks if any tracked tournament is ready to be scored.
cron.schedule('*/30 * * * *', async () => {
  console.log(`🔁 Tournament-resolve cron starting for ${TOURNAMENT_COMPETITIONS.join(', ')}`);
  for (const competition of TOURNAMENT_COMPETITIONS) {
    if (!COMPETITIONS_TO_TRACK.includes(competition)) continue;
    try {
      await processCompetition(competition);
    } catch (err) {
      console.error(`[tournament-cron] unexpected error for ${competition}:`, err.message);
    }
  }
  console.log('✅ Tournament-resolve cron complete');
});

module.exports = {
  processCompetition,
  payoutWorldCupGroupStandings,
  normalizeGroupCode,
  extractGroupStandings,
  calculateGroupStandingPoints,
};
