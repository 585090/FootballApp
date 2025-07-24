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
    <div className='Scoreboard'>
      <h1 className='ScoreboardTitle'>Scoreboard</h1>
      <h2 className='ScoreboardUnderTitle'>Current scores</h2>
      <div className='Scoreboard-container'>
      {sortedPlayers.map((player) => (
        <ul className='PlayerList'>
          <li className='PlayerName'>{player.name}</li>
          <li className='PlayerScore'>{player.score}</li>
        </ul>
      ))}
      </div> 
      <Link to='/'>Go back to Home</Link>
    </div>
  );
}