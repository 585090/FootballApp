import React, { useState, useEffect } from 'react';
import Scoreboard from '../Components/Scoreboard';
import { NavigationBar } from '../Components/utils/NavigationBar';
import { useParams } from 'react-router-dom';
import { gamemodeRoutes } from '../assets/GamemodeRoutes';
import './Group.css'
import '../assets/PopupForm.css';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function GroupPage() {
  
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const togglePopup = () => setPopupOpen(!isPopupOpen);
  const [addPlayer, setAddPlayer] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    fetch(`https://footballapp-u80w.onrender.com/api/groups/${groupId}`)
        .then(response => response.json())
        .then(data => {
        setGroup(data)
    })
    .catch(error => console.error('Error fetching group:', error))
  }, [groupId])
    
    if (!group) {
      return <div>Loading group...</div>;
    }

  const handleChange = (e) => {
    setAddPlayer(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const response = await fetch(`https://footballapp-u80w.onrender.com/api/groups/${groupId}/addPlayer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addPlayer })
    })
    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(data.error || 'Failed to add player');
      return;
    }

    console.log(data);
    togglePopup();
    setAddPlayer('');

    // Refresh group
    const groupRes = await fetch(`https://footballapp-u80w.onrender.com/api/groups/${groupId}`);
    const updatedGroup = await groupRes.json();
    setGroup(updatedGroup);

      } catch (error) {
    console.error('Error adding player:', error);
    alert('Something went wrong. Please try again.');
    }
  };

  const gamemode = gamemodeRoutes[group.gamemode] || {
      path: "/unknownMode",
      label: "Unknown gamemode",
  };

    return (
    <div>
      <NavigationBar />
        <h1 className='GroupPage-title'>{group?.groupName || 'Loading...'}</h1>
        {message && <p className="success-message">{message}</p>}
        <div className='GroupPage-container'>
            <Scoreboard players={ group.members || []} handleClick={togglePopup} />
        </div>
        {isPopupOpen && (
            <div className="popup-overlay" onClick={togglePopup}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                <div>
                  <h1>Add player to {group.groupName} </h1>
                  <form className='AddPlayerToGroup-form' onSubmit={handleSubmit}>
                    <input 
                      className='AddPlayerToGroup-email'
                      type='text'
                      name='email'
                      placeholder='email'
                      value={addPlayer}
                      onChange={handleChange}
                      required
                    />
                  {errorMessage && <p className="error-message">{errorMessage}</p>}
                  <button type='submit' className='AddPlayerToGroup-button'>Add</button>  
                  </form>
                </div>
            </div>
            </div>
        )}
        <div className='GroupButtons-container' > 
          <Link className='PredictionPath-link' to={gamemode.path}>{gamemode.label}</Link>
        </div>
    </div>
    )
}