import React from 'react';
import './Match.css';

export const Match = ({ HT, AT }) => {
    return (
        <div className="container">
            <div className='MatchTime'>
                <p>Time: 20:00</p>
            </div>
            <div className="HomeTeam">
                {HT}
                <input className='Predictions' type="number" id="points" name="points" step="1" min={ 0 } defaultValue={ 0 } />
                </div>
            <div className="vs">
                <p>vs</p>
            </div>
            <div className="AwayTeam">
                <input className='Predictions' type="number" id="points" name="points" step="1" min={ 0 } defaultValue={ 0 } />
                {AT}
            </div>
        </div>
    );
}