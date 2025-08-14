import { matchPointLogic } from "./PointLogic";

export const getMatches = async (matchweek) => {
    try {
        const response = await fetch(`http://localhost:5000/api/matches/by-matchweek/?matchweek=${matchweek}`);
        const data = await response.json();

        if (!response.ok) {
            console.log('Error', data.error);
            return;
        }
        return data;
    } 
    catch (error) {
        console.error("Error getting matches", error);
    }
}

export const getPredictions = async (email, matchid) => {
    try {
    const response = await fetch(`http://localhost:5000/api/predictions/?email=${email}&matchid=${matchid}`)
    const data = await response.json()
 
    if (!response.ok) {
        console.log('Error', data.error);
        return;
    }
    console.log('Fetched prediction for match', matchid, ':', data)
    return data;

    } catch (error) {
    console.error('Failed to get predictions:', error)
    }
}

export const storePredictions = async (email, matchid, homeGoals, awayGoals, gamemode) => {
    try {
        const score = `${homeGoals}-${awayGoals}`
        const response = await fetch(`http://localhost:5000/api/predictions/predict`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email,
                matchid,
                score,
                gamemode
            })
        })
        const data = await response.json()
        console.log('Prediction saved:', data)
    } catch (error) {
        console.log('Error saving prediction', error)
    }
}

export const updatePlayerScore = async (email, predictedScore, actualScore) => {
    try {
        const points = matchPointLogic(predictedScore, actualScore)

        const response = await fetch(`http://localhost:5000/api/players/score?email=${email}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email,
                points
            })
        })
        const data = await response.json()
        console.log('Updated score for', email, ':', data)

    } catch (error) {
        console.error('Error updating score:', error)
    }
}