import { Link } from 'react-router-dom';
import './Scoreboard.css';

export default function Scoreboard() {

  const players = [
    { name: 'Simen', score: 21 },
    { name: 'Silje', score: 5 },
    { name: 'Adrian', score: 6 },
    { name: 'Julia', score: 10 },
    { name: 'Roald', score: 15 },
    { name: 'Brita', score: 10 },
    { name: 'Lene', score: 20 }
  ];

  const sortedPlayers = players.sort((a, b) => b.score - a.score);

  return (
      <div className='Scoreboard-container'>
          <h1 className='ScoreboardTitle'>Scoreboard</h1>
          <div className='Scoreboard-header'>
            <span className='Player-rank'>Rank</span>
            <span className='Player-name'>Player</span>
            <span className='Player-score'>Score</span>
          </div>
        {sortedPlayers.map((player) => (
          <div key={player.name} className='Player'>
            <span className='Player-rank'>{sortedPlayers.indexOf(player) + 1}.</span>
            <span className='Player-name'>{player.name}</span>
            <span className='Player-score'>{player.score}</span>
          </div>
        ))}
      <Link to='/'>Go back to Home</Link>
    </div>
  );
}