const PointLogic = (predictedIndex, trueIndex, points) => {
    
    const difference = Math.abs(predictedIndex - trueIndex)

    if (difference === 0) return points += 3;
    else if (difference === 1) return points += 2;
    else if (difference === 2) return points += 1;
    else return points += 0;
}

export default PointLogic;