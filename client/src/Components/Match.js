import React, { useEffect, useState } from 'react';
import './Match.css';
import ReactCountryFlag from "react-country-flag";
import countryCodes from '../CountryCodes.json';

export const Match = ({ matchid, HT, AT, KickOff, showInfo=true, score, status, homeCrest, awayCrest }) => {
    const [homeScore, setHomeScore] = useState(null);
    const [awayScore, setAwayScore] = useState(null);

    function getTime (ISOString) {
        const date = new Date(ISOString)
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return time;
    }

    return (
        <div className="Match-container">
            <div className='Match-main'>
                <div className='MatchTime'>
                    <p> { getTime(KickOff) } </p>
                </div>
                <span className="HomeTeam">
                    <p className='TeamText'>{HT}</p>
                    <img className='teamLogo' src={homeCrest} alt='' />
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
                    <img className='teamLogo' src={awayCrest} alt='' />
                    <p className='TeamText'>{AT}</p>
                </span>
            </div>
        </div>
    );
}