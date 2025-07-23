import { Home } from './Home';
import { Link } from 'react-router-dom';

export default function Scoreboard() {
  return (
    <div>
      <h1>Scoreboard</h1>
      {/* Additional scoreboard content will go here */}
      <Link to="/">Go back to Home</Link>
    </div>
  );
}