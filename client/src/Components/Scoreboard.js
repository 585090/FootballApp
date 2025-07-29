import './Scoreboard.css';
import React, { useState, useEffect } from 'react';

const Scoreboard = () => {
  const [players, setPlayers] = useState([]);
  //const sortedPlayers = players.sort((a, b) => b.score - a.score);

  useEffect(() => {
    fetch('http://localhost:5000/api/players')
      .then(response => response.json())
      .then(data => {
        const sortedPlayers = data.sort((a,b) => b.score - a.score);
        setPlayers(sortedPlayers);
      })
      .catch(error => console.error('Error fetching players:', error));
  })

  useEffect(() => {
    fetch('http://localhost:5000/api/predictions')
  })

  return (
    <div>
      <div className='Scoreboard-container'>
            <h1 className='ScoreboardTitle'>Scoreboard</h1>
            <div className='Scoreboard-header'>
              <span className='Player-rank'>Rank</span>
              <span className='Player-name'>Player</span>
              <span className='Player-score'>Score</span>
            </div>
          {players.map((player) => (
            <div key={player.name} className='Player'>
              <span className='Player-rank'>{players.indexOf(player) + 1}.</span>
              <span className='Player-name'>{player.name}</span>
              <span className='Player-score'>{player.score}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Scoreboard;