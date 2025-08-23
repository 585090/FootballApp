function tablePointLogic (predictedIndex, trueIndex) {
    
    const difference = Math.abs(predictedIndex - trueIndex)

    if (difference === 0) return 3;
    else if (difference === 1) return 2;
    else if (difference === 2) return 1;
    else return 0;
}


function matchPointLogic (predictedHomeScore, predictedAwayScore , actualHomeScore, actualAwayScore) {
    if (!predictedScore || !actualScore) return 0;
    
    const predictedOutcome = predictedHomeScore > predictedAwayScore ? 'H' : predictedHomeScore < predictedAwayScore ? 'A' : 'D';
    const actualOutcome = actualHomeScore > actualAwayScore ? 'H' : actualHomeScore < actualAwayScore ? 'A' : 'D';

    if (predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore) return 3;
    if (predictedOutcome === actualOutcome) return 2;
    if (predictedHomeScore === actualHomeScore || predictedAwayScore === actualAwayScore) return 1;

    return 0;
}

module.exports = {tablePointLogic, matchPointLogic}