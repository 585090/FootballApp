const { normalizeGroupCode } = require('./groupStandingScoring');

function toTopThreeSlots(predictedTopThree, actualTeamIds = [], actualTeamNames = []) {
  const predictedSlots = [1, 2, 3].map((rank) => {
    const slot = Array.isArray(predictedTopThree)
      ? predictedTopThree.find((entry) => Number(entry?.rank) === rank)
      : null;
    return {
      rank,
      predictedTeamId: slot?.teamId ?? null,
      predictedTeamName: slot?.teamName ?? null,
      actualTeamId: actualTeamIds[rank - 1] ?? null,
      actualTeamName: actualTeamNames[rank - 1] ?? null,
    };
  });

  const actualSet = new Set(actualTeamIds.filter((teamId) => teamId != null));
  const resolved = actualTeamIds.length >= 3;
  let exactCount = 0;
  let wrongSlotCount = 0;

  const slots = predictedSlots.map((slot) => {
    const exact = !resolved
      ? null
      : slot.predictedTeamId != null && slot.predictedTeamId === slot.actualTeamId;
    const inTopThree = !resolved
      ? null
      : slot.predictedTeamId != null && actualSet.has(slot.predictedTeamId);
    const wrongSlot = resolved && !exact && inTopThree;
    if (exact) exactCount += 1;
    if (wrongSlot) wrongSlotCount += 1;
    return { ...slot, exact, inTopThree, wrongSlot };
  });

  return {
    resolved,
    slots,
    exactCount,
    wrongSlotCount,
    filledCount: slots.filter((slot) => slot.predictedTeamId != null).length,
  };
}

function summarizeGroupStandingPrediction(prediction, actualTeamIds) {
  const actualPositions = new Map();
  actualTeamIds.forEach((teamId, index) => {
    if (teamId != null) actualPositions.set(Number(teamId), index + 1);
  });

  const counts = {
    exact: 0,
    offByOne: 0,
    offByTwo: 0,
    offByThreeOrMore: 0,
    filledCount: 0,
  };

  for (const [index, teamId] of (prediction?.rankedTeamIds || []).entries()) {
    if (teamId == null) continue;
    counts.filledCount += 1;
    const actualPosition = actualPositions.get(Number(teamId));
    if (actualPosition == null) continue;
    const diff = Math.abs(actualPosition - (index + 1));
    if (diff === 0) counts.exact += 1;
    else if (diff === 1) counts.offByOne += 1;
    else if (diff === 2) counts.offByTwo += 1;
    else counts.offByThreeOrMore += 1;
  }

  return counts;
}

function summarizeTournamentPerformance({
  tournamentPrediction,
  tournamentResult,
  groupPredictions = [],
  actualGroups = new Map(),
}) {
  const topScorerCorrect =
    tournamentResult?.goldenBoot?.playerId == null
      ? null
      : tournamentPrediction?.goldenBoot?.playerId != null &&
        tournamentPrediction.goldenBoot.playerId === tournamentResult.goldenBoot.playerId;

  const topThree = toTopThreeSlots(
    tournamentPrediction?.topThree || [],
    tournamentResult?.topThreeTeamIds || [],
    tournamentResult?.topThreeTeamNames || [],
  );

  const groupStandings = {
    groupsSubmitted: 0,
    exact: 0,
    offByOne: 0,
    offByTwo: 0,
    offByThreeOrMore: 0,
    filledCount: 0,
    points: 0,
  };

  for (const prediction of groupPredictions) {
    const actualTeamIds = actualGroups.get(normalizeGroupCode(prediction.groupCode));
    if (!actualTeamIds) continue;
    const counts = summarizeGroupStandingPrediction(prediction, actualTeamIds);
    groupStandings.groupsSubmitted += 1;
    groupStandings.exact += counts.exact;
    groupStandings.offByOne += counts.offByOne;
    groupStandings.offByTwo += counts.offByTwo;
    groupStandings.offByThreeOrMore += counts.offByThreeOrMore;
    groupStandings.filledCount += counts.filledCount;
    groupStandings.points += Number(prediction?.pointsAwarded ?? 0);
  }

  const answeredCount =
    (tournamentPrediction?.goldenBoot?.playerId != null ? 1 : 0) + topThree.filledCount + groupStandings.filledCount;
  const exactCount = (topScorerCorrect ? 1 : 0) + topThree.exactCount + groupStandings.exact;
  const partialCount = topThree.wrongSlotCount + groupStandings.offByOne + groupStandings.offByTwo;

  return {
    answeredCount,
    exactCount,
    partialCount,
    topScorer: {
      resolved: tournamentResult?.goldenBoot?.playerId != null,
      predictedPlayerId: tournamentPrediction?.goldenBoot?.playerId ?? null,
      predictedPlayerName: tournamentPrediction?.goldenBoot?.playerName ?? null,
      actualPlayerId: tournamentResult?.goldenBoot?.playerId ?? null,
      actualPlayerName: tournamentResult?.goldenBoot?.playerName ?? null,
      correct: topScorerCorrect,
      points: Number(tournamentPrediction?.pointsAwarded?.goldenBoot ?? 0),
    },
    topThree: {
      resolved: topThree.resolved,
      exactCount: topThree.exactCount,
      wrongSlotCount: topThree.wrongSlotCount,
      filledCount: topThree.filledCount,
      points: Number(tournamentPrediction?.pointsAwarded?.topThree ?? 0),
      slots: topThree.slots,
    },
    groupStandings,
  };
}

module.exports = {
  toTopThreeSlots,
  summarizeGroupStandingPrediction,
  summarizeTournamentPerformance,
};