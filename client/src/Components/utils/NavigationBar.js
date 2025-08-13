import './NavigationBar.css';
import { Link } from 'react-router-dom';
import { SoccerBallIcon, HouseIcon, UsersThreeIcon, UserIcon } from '@phosphor-icons/react';


export const NavigationBar = () => {
  const player = JSON.parse(localStorage.getItem('player'));

  return (
    <div className="Navigation-bar">
      <div className='header-NavBar'>
        <Link to="/" className='Logo'>Footy Guru</Link>
        {player ? (
            <Link className="SignOutButton" to="/account"> 
              <UserIcon size={32} /> 
            </Link>
          )
          : (
            <Link to="/auth" className="SignOutButton">Login</Link>
          )
        }
      </div>
      <div className="Nav-links">
          <Link to="/dashboard" className="Links"> 
            <HouseIcon size={32} /> 
            <br /> 
            Home 
          </Link>
          <Link to="/matchday" className='Links'>
            <SoccerBallIcon size={32} />
            <br />
            Matches
          </Link>
          <Link to="/group" className='Links'> 
            <UsersThreeIcon size={32} />
            <br />
            Groups
          </Link>
      </div>
    </div>
  );
}