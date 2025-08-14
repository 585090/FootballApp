export const tablePointLogic = (predictedIndex, trueIndex, points) => {
    
    const difference = Math.abs(predictedIndex - trueIndex)

    if (difference === 0) return 3;
    else if (difference === 1) return 2;
    else if (difference === 2) return 1;
    else return 0;
}


export const matchPointLogic = (predictedScore, actualScore) => {
    if (!predictedScore || !actualScore) return 0;

    const [predHome, predAway] = predictedScore.split('-').map(Number);
    const [actHome, actAway] = actualScore.split('-').map(Number);
    
    const predictedOutcome = predHome > predAway ? 'H' : predHome < predAway ? 'A' : 'D';
    const actualOutcome = actHome > actAway ? 'H' : actHome < actAway ? 'A' : 'D';

    if (predHome === actHome && predAway === actAway) return 3;
    if (predictedOutcome === actualOutcome) return 2;
    if (predHome === actHome || predAway === actAway) return 1;

    return 0;
}