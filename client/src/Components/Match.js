import React, { useEffect, useState } from 'react';
import './Match.css';
import ReactCountryFlag from "react-country-flag";
import countryCodes from '../CountryCodes.json';

export const Match = ({ matchid, HT, AT, KickOff, showInfo=true, score, status }) => {
    const [homeScore, setHomeScore] = useState(null);
    const [awayScore, setAwayScore] = useState(null);
    
    useEffect(() => {
        const getPrediction = async () => {
            const player = JSON.parse(localStorage.getItem('player'))
            if(!player) return;

            try {
                const response = await fetch(`http://localhost:5000/api/prediction?email=${player.email}&matchid=${matchid}`);
                const data = await response.json();
                
                if (response.ok && data?.pred?.score) {
                    console.log('Data:', data);
                    setHomeScore(data.pred.score.home);
                    setAwayScore(data.pred.score.away);
                }
                
                else if (response.status === 404) {
                    console.log("No prediction found — setting defaults.");
                    setHomeScore(null);
                    setAwayScore(null);
                    return;
                } 
                
                else {
                    console.log("Unexpected error fetching prediction", response.status);
                }
            } catch (error) {
                console.log("Error getting predictions", error)
            }
        }
        getPrediction();
    }, [matchid])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const player = JSON.parse(localStorage.getItem('player'));
        if (!player || !player.email) {
            alert("You must be logged in to make a prediction");
            return;
        }

        const predictionData = {
            email: player.email,
            matchid: matchid,
            // teams: {homeTeam: HT, awayTeam: AT},
            score: {home: homeScore, away: awayScore}
        };

        try {
            const response = await fetch('http://localhost:5000/api/prediction/predict', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(predictionData)
            });

            const data = await response.json();
            if (response.ok) {
                console.log("✅ Prediction saved:", data);
            } 
            else {
                console.log(data.error || "Failed to save prediction");
            }

        } catch (error) {
            console.error("❌ Error sending prediction:", error);
        }
    };


    const [timeElapsed, setTimeElapsed] = useState('');

    useEffect(() => {
        let interval;

        if (status === 'ongoing' && KickOff) {
            const kickoffTime = new Date(KickOff);
            const updateTime = () => {
            const now = new Date();
            const diffMs = now - kickoffTime;
            const minutes = Math.floor(diffMs / 60000);
            setTimeElapsed(`${minutes}'`);
            console.log('TimeElapsed:', KickOff)
        };

            updateTime(); // run immediately
            interval = setInterval(updateTime, 60000); // update every minute
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, KickOff]);

    function formatTime(kickoff) {
        const d = new Date(kickoff);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    return (
        <div className="Match-container">
            <div className='Match-main'>
                {showInfo && (
                <div className='MatchTime'>
                    <p> { formatTime(KickOff) } </p>
                </div>
                )}
                <span className="HomeTeam">
                    <p className='TeamText'>{HT}</p>
                    <div className='FlagContainer'>
                        <ReactCountryFlag countryCode={ countryCodes[HT] } className='Flags'svg />
                    </div>
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
                                onChange={(e) => setAwayScore(parseInt(e.target.value || ''))} />
                        )
                    )}
                    <div className='FlagContainer'>
                        <ReactCountryFlag countryCode={ countryCodes[AT] } className='Flags' svg />
                    </div>
                    <p className='TeamText'>{AT}</p>
                </span>
                {showInfo && (
                <div className='Prediction-Container'>
                    <button className='Prediction-button' onClick={handleSubmit}>Predict</button>
                </div>
                )}
            </div>
            {showInfo && status !== 'not started' && (
            <div className='MatchStatus'>
                <p>
                {status}
                {status === 'ongoing' && (
                    <> {timeElapsed}</>
                )}
                </p> 
            </div>
            )}
        </div>
    );
}