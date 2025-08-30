import './Scoreboard.css';
import { useState } from 'react';
import { UserPlusIcon } from '@phosphor-icons/react';


const Scoreboard = ({ players, handleClick, isAdmin }) => {

    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    const [selectedValue, setSelectedValue] = useState('');

    return (
      <div>
        <div className='Scoreboard-container'>
          <h1 className='ScoreboardTitle'>Scoreboard</h1>
          <div className='Scoreboard-header'>
            <span className='Player-rank'>Rank</span>
            <span className='Player-name'>Player</span>
            <span className='Player-score'>Points</span>
            {isAdmin && <span className='adminSettings'></span> }
          </div>
          {sortedPlayers.map((player, index) => (
            <div key={player.name} className='Player'>
              <span className='Player-rank'>{index + 1}.</span>
              <span className='Player-name'>{player.name}</span>
              <span className='Player-score'>{player.points || '0'}</span>
              {isAdmin && 
                <>
                  <select className='adminSettings' value={selectedValue} onChange={(event) => setSelectedValue(event.target.value)}>
                    <option value="" disabled> ⋮ </option>
                    <option className='adminOption' value="remove">❌</option>
                    <option className='adminOption' value="promote">Promote to admin</option>
                  </select>
                </>
                }
            </div>
          ))}
          <button className='Scoreboard-AddPlayerButton' onClick={handleClick}> <UserPlusIcon size={32} color='white'/> </button>
        </div>
      </div>
    );
}

export default Scoreboard;