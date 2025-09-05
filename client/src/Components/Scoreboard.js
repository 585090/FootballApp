import './Scoreboard.css';
import { useEffect, useState } from 'react';
import { UserPlusIcon } from '@phosphor-icons/react';


const Scoreboard = ({ players, handleClick, isAdmin, groupID }) => {

    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    const [selectedValue, setSelectedValue] = useState('');

    useEffect(() => {
        if (selectedValue) {
            const removePlayer = async () => {
                const playerToRemove = sortedPlayers[selectedValue];
                console.log(playerToRemove.email);
                console.log(groupID);
                if (!playerToRemove) return;
                //const response = await fetch('https://footballapp-u80w.onrender.com/api/admin/removePlayer', {
                const response = await fetch(`http://localhost:5000/api/groups/${groupID}/removePlayer`, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ email: playerToRemove.email, groupId: groupID })
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert(data.error || 'Something went wrong');
                }
            };
            removePlayer();
        }
    }, [selectedValue]);



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
                    <option value="" className='Settings-icon' disabled> ⋮ </option>
                    <option className='adminOption' value={index} >❌</option>
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