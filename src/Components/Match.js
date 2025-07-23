import React from 'react';
import './Match.css';
import ReactCountryFlag from "react-country-flag";
import countryCodes from '../CountryCodes.json';

export const Match = ({ HT, AT, KickOff }) => {
    return (
        <div className="container">
            <div className='MatchTime'>
                <p> { KickOff } </p>
            </div>
            <div className="HomeTeam">
                {HT}
                <ReactCountryFlag countryCode={ countryCodes[HT] } className='Flags'svg />
                <input className='Predictions' type="number" id="points" name="points" step="1" min={ 0 } defaultValue={ 0 } />
                </div>
            <div className="vs">
                <p>vs</p>
            </div>
            <div className="AwayTeam">
                <input className='Predictions' type="number" id="points" name="points" step="1" min={ 0 } defaultValue={ 0 } />
                <ReactCountryFlag countryCode={ countryCodes[AT] } className='Flags' svg />
                {AT}
            </div>
        </div>
    );
}