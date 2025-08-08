import './Scoreboard.css';

const Scoreboard = ({ players }) => {

 const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div>
      <div className='Scoreboard-container'>
        <h1 className='ScoreboardTitle'>Scoreboard</h1>
        <div className='Scoreboard-header'>
          <span className='Player-rank'>Rank</span>
          <span className='Player-name'>Player</span>
          <span className='Player-score'>Score</span>
        </div>
        {sortedPlayers.map((player, index) => (
          <div key={player.name} className='Player'>
            <span className='Player-rank'>{index + 1}.</span>
            <span className='Player-name'>{player.name}</span>
            <span className='Player-score'>{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scoreboard;