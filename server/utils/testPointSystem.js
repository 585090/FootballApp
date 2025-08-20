const { matchPointLogic, tablePointLogic } = require('./calculatePoints');

// Dummy matches
const matches = [
  { score: "2-1", actual: "2-1" },
  { score: "1-1", actual: "0-0" },
  { score: "3-2", actual: "2-3" },
  { score: "0-0", actual: "0-0" }
];

// Dummy table positions
const tablePredictions = [
  { predicted: 1, actual: 1 },
  { predicted: 3, actual: 2 },
  { predicted: 5, actual: 2 },
  { predicted: 8, actual: 8 }
];

// Test match points
matches.forEach(m => {
  const points = matchPointLogic(m.score, m.actual);
  console.log(`Predicted: ${m.score}, Actual: ${m.actual}, Points: ${points}`);
});

// Test table points
tablePredictions.forEach(t => {
  const points = tablePointLogic(t.predicted, t.actual);
  console.log(`Predicted position: ${t.predicted}, Actual: ${t.actual}, Points: ${points}`);
});
