import React from 'react';
import './Match.css';
import ReactCountryFlag from "react-country-flag";
import countryCodes from '../CountryCodes.json';

export const Match = ({ HT, AT, KickOff, showInfo=true }) => {

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
                        defaultValue={ 0 }
                        inputMode='numeric' />
                )}
            </div>
            <div className="vs">
                <p>vs</p>
            </div>
            <span className="AwayTeam">
                {showInfo && (
                <input className='Predictions' 
                    type="number" 
                    step="1"
                    min={ 0 } 
                    defaultValue={ 0 } 
                    inputMode='numeric' />
                )}      
                <div className='FlagContainer'>
                    <ReactCountryFlag countryCode={ countryCodes[AT] } className='Flags' svg />
                </div>
                <p className='TeamText'>{AT}</p>
            </span>
        </div>
    );
}