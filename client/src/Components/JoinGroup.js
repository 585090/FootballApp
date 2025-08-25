import React, { useState } from 'react';
import './GroupList.css';
import '../assets/PopupForm.css';
import { useNavigate } from 'react-router-dom';

export const JoinGroup = ({ togglePopup }) => {
    const [GroupId, setGroupId] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    const handleChange = (e) => {
        setGroupId(e.target.value);
        console.log(e.target.value)
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

    const playerJSON = localStorage.getItem('player');
    const player = playerJSON ? JSON.parse(playerJSON) : null;
    const email = player?.email; 

    try {
    const response = await fetch(`https://footballapp-u80w.onrender.com/api/groups/${GroupId}/addPlayer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(data.error || 'Failed to add player');
      return;
    }

    console.log(data);
    togglePopup();
    navigate(`/group/${GroupId}`, { state: { message: 'Joined group', group: data.group } });

    } catch (error) {
        console.error('Error adding player:', error);
        alert('Something went wrong. Please try again.');
    }
  };

    return (
        <div>
            <h1 className='GroupPopup-title'>Find group</h1>
                <form className='GroupPopup-Form' onSubmit={handleSubmit}>
                    <input
                        className='GroupName-input'
                        type="text"
                        name='groupName'
                        placeholder='Group ID'
                        value={GroupId}
                        onChange={handleChange}
                        required
                    />
                    <br />
                    <button type="submit">Join</button>
                    <span className='Error-message'>{errorMessage}</span>
                </form>
        </div>
    );
};
