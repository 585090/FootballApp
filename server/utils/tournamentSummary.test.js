const test = require('node:test');
const assert = require('node:assert/strict');

const {
  toTopThreeSlots,
  summarizeGroupStandingPrediction,
  summarizeTournamentPerformance,
} = require('./tournamentSummary');

test('toTopThreeSlots counts exact and wrong-slot podium hits', () => {
  const summary = toTopThreeSlots(
    [
      { rank: 1, teamId: 20, teamName: 'France' },
      { rank: 2, teamId: 10, teamName: 'Spain' },
      { rank: 3, teamId: 30, teamName: 'Brazil' },
    ],
    [10, 20, 30],
    ['Spain', 'France', 'Brazil'],
  );

  assert.equal(summary.exactCount, 1);
  assert.equal(summary.wrongSlotCount, 2);
  assert.equal(summary.filledCount, 3);
  assert.equal(summary.resolved, true);
  assert.equal(summary.slots[0].wrongSlot, true);
  assert.equal(summary.slots[2].exact, true);
});

test('summarizeGroupStandingPrediction counts positional accuracy buckets', () => {
  const counts = summarizeGroupStandingPrediction(
    { rankedTeamIds: [1, 2, 3, 4] },
    [1, 3, 2, 4],
  );

  assert.deepEqual(counts, {
    exact: 2,
    offByOne: 2,
    offByTwo: 0,
    offByThreeOrMore: 0,
    filledCount: 4,
  });
});

test('summarizeTournamentPerformance combines top scorer, podium and WC groups', () => {
  const summary = summarizeTournamentPerformance({
    tournamentPrediction: {
      goldenBoot: { playerId: 9, playerName: 'Alice' },
      topThree: [
        { rank: 1, teamId: 20, teamName: 'France' },
        { rank: 2, teamId: 10, teamName: 'Spain' },
        { rank: 3, teamId: 30, teamName: 'Brazil' },
      ],
      pointsAwarded: { goldenBoot: 15, topThree: 8 },
    },
    tournamentResult: {
      goldenBoot: { playerId: 9, playerName: 'Alice' },
      topThreeTeamIds: [10, 20, 30],
      topThreeTeamNames: ['Spain', 'France', 'Brazil'],
    },
    groupPredictions: [
      { groupCode: 'Group A', rankedTeamIds: [1, 2, 3, 4], pointsAwarded: 10 },
    ],
    actualGroups: new Map([['GROUP_A', [1, 3, 2, 4]]]),
  });

  assert.equal(summary.answeredCount, 8);
  assert.equal(summary.exactCount, 4);
  assert.equal(summary.partialCount, 4);
  assert.equal(summary.topScorer.correct, true);
  assert.equal(summary.topScorer.resolved, true);
  assert.equal(summary.topThree.exactCount, 1);
  assert.equal(summary.topThree.resolved, true);
  assert.equal(summary.topThree.wrongSlotCount, 2);
  assert.equal(summary.groupStandings.exact, 2);
  assert.equal(summary.groupStandings.offByOne, 2);
  assert.equal(summary.groupStandings.points, 10);
});