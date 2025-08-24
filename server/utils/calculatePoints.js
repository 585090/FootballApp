function matchPointLogic(predictedHomeScore, predictedAwayScore, actualHomeScore, actualAwayScore) {
  // ✅ Guard against null/undefined (not falsy 0)
  if (
    predictedHomeScore === null || predictedHomeScore === undefined ||
    predictedAwayScore === null || predictedAwayScore === undefined ||
    actualHomeScore === null || actualHomeScore === undefined ||
    actualAwayScore === null || actualAwayScore === undefined
  ) {
    return 0;
  }

  const predictedOutcome = predictedHomeScore > predictedAwayScore ? 'H'
                          : predictedHomeScore < predictedAwayScore ? 'A'
                          : 'D';
  const actualOutcome = actualHomeScore > actualAwayScore ? 'H'
                       : actualHomeScore < actualAwayScore ? 'A'
                       : 'D';

  if (predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore) {
    return 3;
  }

  if (predictedOutcome === actualOutcome) {
    return 2;
  }

  if ((predictedHomeScore - predictedAwayScore) === (actualHomeScore - actualAwayScore)) {
    return 1;
  }

  if (predictedHomeScore === actualHomeScore || predictedAwayScore === actualAwayScore) {
    return 1;
  }

  return 0;
}
