import React, { useEffect, useState } from 'react';
import './Match.css';
import { storePredictions, getPredictions, updatePlayerScore } from '../services/APICalls';

export const Match = ({ matchid, HT, AT, KickOff, showInfo=true, score, status, homeCrest, awayCrest }) => {
    const [homeScore, setHomeScore] = useState(null);
    const [awayScore, setAwayScore] = useState(null);
    const [teams, setTeams] = useState([]);
    const [ message, setMessage ] = useState('');
    const [competition] = useState('PL')

    function getTime (ISODateString) {
        const date = new Date(ISODateString)
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return time;
    }

    useEffect(() => {
        const validStatuses = ['FINISHED', 'IN_PLAY', 'PAUSED'];
        const handleScoreUpdate = async () => {
            if (validStatuses.includes(status)) {
                const player = JSON.parse(localStorage.getItem('player'));
                if (!player?.email) return;

                const prediction = await getPredictions(player.email, matchid);

                if (prediction?.score) {
                    const predictedScore = prediction.score; // stored format "2-1"
                    const actualScore = `${score.home}-${score.away}`;
                    await updatePlayerScore(player.email, predictedScore, actualScore);
                }
            }
        };

        handleScoreUpdate();
    }, [status, matchid, score]);

    const handlePrediction = async () => {
        try {
            const player = JSON.parse(localStorage.getItem('player'));
            const gamemode = '1';

            if (homeScore === null || awayScore === null) {
                alert("Please enter both home and away scores before submitting.");
                return;
            }

            await storePredictions(player.email, matchid, homeScore, awayScore, gamemode);
            setMessage('Prediction saved!');
        } catch (error) {
            console.error('Error saving prediction:', error);
        }
    };

    function getTeamCrest(teamName) {
        if (!teams || teams.length === 0) return "";
        const team = teams.find(t => t.teamName === teamName);
        return team ? team.logo : "";
    }

    useEffect(() => {
        const getTeams = async () => {
            try {
                const response = await fetch(`https://footballapp-u80w.onrender.com/api/teams/${competition}`)
                const data = await response.json()
                setTeams(data)
            } catch (error) {
                console.log('Error getting teams', error)
            }
        }
        getTeams();
    }, [competition])

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const player = JSON.parse(localStorage.getItem('player'));
                if (!player?.email) return;

                const prediction = await getPredictions(player.email, matchid);

                // If a prediction exists, set it as default
                if (prediction?.score) {
                    const [home, away] = prediction.score.split('-').map(Number);
                    setHomeScore(home);
                    setAwayScore(away);
                }
            } catch (error) {
                console.error('Error getting prediction:', error);
            }
        };
        fetchPrediction();
    }, [matchid]);

    return (
        <div className="Match-container">
            <div className='Match-main'>
                <div className='MatchTime'>
                    <p> { getTime(KickOff) } </p>
                </div>
                <span className="HomeTeam">
                    {showInfo && (
                    <p className='TeamText'>{HT}</p>
                    )}
                    <img className='teamLogo' src={getTeamCrest(homeCrest)} alt='' />
                        {status !== 'not started' ? (
                            <p className="FinalScore">{score?.home ?? homeScore ?? '-'}</p>
                        ) : (
                            showInfo && (
                                <input className='Predictions' 
                                    type="number" 
                                    step="1" 
                                    min={0} 
                                    value={homeScore ?? ''}
                                    inputMode='numeric' 
                                    required
                                    onChange={(e) => setHomeScore(parseInt(e.target.value || ''))} />
                            )
                        )}
                </span>
                <div className="vs"> <p>vs</p></div>
                <span className="AwayTeam">
                    {status !== 'not started' ? (
                        <p className="FinalScore">{score?.away ?? awayScore ?? '-'}</p>
                    ) : (
                        showInfo && (
                            <input className='Predictions' 
                                type="number" 
                                step="1" 
                                min={0}
                                value={awayScore ?? ''}
                                inputMode='numeric' 
                                required
                                onChange={(e) => setAwayScore(parseInt(e.target.value || ''))} />
                        )
                    )}
                    <img className='teamLogo' src={getTeamCrest(awayCrest)} alt='' />
                    {showInfo && (
                        <p className='TeamText'>{AT}</p>
                    )}
                </span>
            </div>
            {showInfo && status === "not started" && (
                <div className='Prediction-container'>
                    <button className='Predict-button' onClick={handlePrediction} >Predict</button>
                    <span className='predictionMessage'> {message} </span>
                </div>

            )}
        </div>
    );
}