import './NavigatorBar.css';
import { Link, useNavigate } from 'react-router-dom';


export function NavigationBar() {
  const navigate = useNavigate();
  const player = JSON.parse(localStorage.getItem('player'));

  const handleSignOut = () => {
    localStorage.removeItem('player');
    navigate('/auth')
  }

  return (
    <div className="Navigation-bar">
        <h1 className="Logo">Footy Guru</h1>
        <div className="Nav-links">
            <Link to="/" className="Links">Home</Link>
            <Link to="/matches" className="Links">Matches</Link>
            <Link to="/scoreboard" className="Links">Scoreboard</Link>
            {player ? (
              <button className="SignOutButton" onClick={handleSignOut}>Sign out</button>
            )
            : (
              <Link to="/auth" className="Links">Login</Link>
            )
          }
        </div>
    </div>
  );
}