/**
 * Manual script to recalculate tournament prediction points.
 * Usage: node scripts/recalculateTournamentPoints.js [--competition WC] [--season 2026] [--dry-run]
 *
 * Recomputes stored TournamentPrediction.pointsAwarded from the current
 * pointsConfig and TournamentResult docs, then applies only the delta to each
 * Player.points so reruns stay idempotent.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const TournamentPrediction = require('../models/TournamentPrediction');
const TournamentResult = require('../models/TournamentResult');
const Player = require('../models/Player');
const { goldenBootPointLogic, topThreePointLogic } = require('../utils/calculatePoints');

const VALID_COMPETITIONS = new Set(['WC', 'CL']);

function parseCliOptions(argv = process.argv.slice(2)) {
  let competition = null;
  let season = null;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--competition' || arg === '-c') {
      competition = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--competition=')) {
      competition = arg.split('=')[1] ?? null;
      continue;
    }
    if (arg === '--season' || arg === '-s') {
      season = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--season=')) {
      season = arg.split('=')[1] ?? null;
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  const normalizedCompetition = competition == null ? null : String(competition).trim().toUpperCase();
  if (normalizedCompetition && !VALID_COMPETITIONS.has(normalizedCompetition)) {
    console.error(`❌ Invalid competition "${competition}". Use one of: ${Array.from(VALID_COMPETITIONS).join(', ')}`);
    process.exit(1);
  }

  return {
    competition: normalizedCompetition,
    season: season == null ? null : String(season).trim(),
    dryRun,
  };
}

function dbNameFromUri(uri) {
  try {
    if (!uri) return null;
    const parsed = new URL(uri.replace('mongodb+srv://', 'mongodb://'));
    const pathname = (parsed.pathname || '').replace(/^\//, '').trim();
    return pathname || null;
  } catch {
    return null;
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/FootyGuru';
  const dbName = dbNameFromUri(uri) || process.env.DB_NAME || 'FootyGuru';
  await mongoose.connect(uri, { dbName });
  console.log(`✅ Connected to MongoDB (db="${mongoose.connection.db.databaseName}")`);
}

function resolvedGoldenBoot(result) {
  return result?.goldenBoot?.playerId != null;
}

function resolvedTopThree(result) {
  return Array.isArray(result?.topThreeTeamIds) && result.topThreeTeamIds.length >= 3;
}

function predictedTopThree(prediction) {
  return [1, 2, 3].map((rank) => {
    const slot = (prediction.topThree || []).find((entry) => entry.rank === rank);
    return slot?.teamId ?? null;
  });
}

async function recalculateTournamentPoints(options = {}) {
  const filter = {};
  if (options.competition) filter.competition = options.competition;
  if (options.season) filter.season = options.season;

  const results = await TournamentResult.find(filter).lean();
  if (results.length === 0) {
    console.log('ℹ️ No tournament results matched the requested filter. Nothing to recalculate.');
    return;
  }

  console.log(`🔄 Recalculating tournament points for ${results.length} result set(s)...`);
  if (options.dryRun) {
    console.log('🧪 Mode: DRY RUN (no database writes)');
  }

  let updatedPredictions = 0;
  let touchedPlayers = 0;
  let totalDelta = 0;

  for (const result of results) {
    const predictions = await TournamentPrediction.find({
      competition: result.competition,
      season: result.season,
    });

    if (predictions.length === 0) {
      console.log(`ℹ️ ${result.competition}/${result.season}: no predictions found`);
      continue;
    }

    const canScoreGoldenBoot = resolvedGoldenBoot(result);
    const canScoreTopThree = resolvedTopThree(result);
    console.log(`🏆 ${result.competition}/${result.season}: ${predictions.length} predictions`);

    for (const pred of predictions) {
      const previousGoldenBoot = pred.pointsAwarded?.goldenBoot ?? 0;
      const previousTopThree = pred.pointsAwarded?.topThree ?? 0;

      const nextGoldenBoot = canScoreGoldenBoot
        ? goldenBootPointLogic(pred.goldenBoot?.playerId ?? null, result.goldenBoot.playerId)
        : pred.pointsAwarded?.goldenBoot;
      const nextTopThree = canScoreTopThree
        ? topThreePointLogic(predictedTopThree(pred), result.topThreeTeamIds)
        : pred.pointsAwarded?.topThree;

      const normalizedNextGoldenBoot = nextGoldenBoot ?? 0;
      const normalizedNextTopThree = nextTopThree ?? 0;
      const previousTotal = previousGoldenBoot + previousTopThree;
      const nextTotal = normalizedNextGoldenBoot + normalizedNextTopThree;
      const delta = nextTotal - previousTotal;

      if (delta === 0) continue;

      console.log(
        `  ${pred.email}: golden boot ${previousGoldenBoot} -> ${normalizedNextGoldenBoot}, ` +
        `top 3 ${previousTopThree} -> ${normalizedNextTopThree}, Δ ${delta > 0 ? '+' : ''}${delta}`,
      );

      if (!options.dryRun) {
        pred.pointsAwarded = {
          goldenBoot: nextGoldenBoot ?? null,
          topThree: nextTopThree ?? null,
        };
        await pred.save();
        await Player.updateOne({ email: pred.email }, { $inc: { points: delta } });
      }

      updatedPredictions += 1;
      touchedPlayers += 1;
      totalDelta += delta;
    }
  }

  console.log('');
  console.log(options.dryRun ? '✅ Dry run complete' : '✅ Tournament recalculation complete');
  console.log(`📈 Updated predictions: ${updatedPredictions}`);
  console.log(`👤 Player score adjustments: ${touchedPlayers}`);
  console.log(`🧮 Net point delta applied: ${totalDelta}`);
}

const options = parseCliOptions();
connectDB()
  .then(() => recalculateTournamentPoints(options))
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('❌ Tournament recalculation failed:', err);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  });