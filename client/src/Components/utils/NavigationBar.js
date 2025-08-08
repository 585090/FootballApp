import './NavigationBar.css';
import { Link, useNavigate } from 'react-router-dom';


export const NavigationBar = () => {
  const navigate = useNavigate();
  const player = JSON.parse(localStorage.getItem('player'));

  const handleSignOut = () => {
    localStorage.removeItem('player');
    navigate('/auth')
  }

  return (
    <div className="Navigation-bar">
        <Link to="/" className='Logo'>Footy Guru</Link>
        <div className="Nav-links">
            <Link to="/matches" className="Links">Matches</Link>
            <Link to="/dashboard" className='Links'>Dashboard</Link>
            <Link to="/groupPage" className='Links'>Groups</Link>
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