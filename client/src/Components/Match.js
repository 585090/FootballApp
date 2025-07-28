import React, { useEffect, useState } from 'react';
import './Match.css';
import ReactCountryFlag from "react-country-flag";
import countryCodes from '../CountryCodes.json';

export const Match = ({ matchid, HT, AT, KickOff, showInfo=true }) => {
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
            teams: {homeTeam: HT, awayTeam: AT},
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

    return (
        <div className="Match-container">
            {showInfo && (
            <div className='MatchTime'>
                <p> { KickOff } </p>
            </div>
            )}
            <div className="HomeTeam">
                <p className='TeamText'>{HT}</p>
                <div className='FlagContainer'>
                    <ReactCountryFlag countryCode={ countryCodes[HT] } className='Flags'svg />
                </div>
                {showInfo && (
                    <input className='Predictions' 
                        type="number" 
                        step="1" 
                        min={ 0 } 
                        value={homeScore ?? ''}
                        inputMode='numeric' 
                        onChange={(e) => setHomeScore(parseInt(e.target.value || ''))} />
                )}
            </div>
            <div className="vs"> <p>vs</p></div>
            <span className="AwayTeam">
                {showInfo && (
                <input className='Predictions' 
                    type="number" 
                    step="1"
                    min={ 0 } 
                    value={awayScore ?? ''} 
                    inputMode='numeric' 
                    onChange={(e) => setAwayScore(parseInt(e.target.value || ''))} />
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
    );
}