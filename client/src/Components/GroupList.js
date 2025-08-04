import React, { useState, useEffect } from 'react';
import './GroupList.css';
import '../assets/PopupForm.css';
import { Link } from 'react-router-dom';
import { CreateGroup } from './CreateGroup';

export const GroupList = () => {
    const [isPopupOpen, setPopupOpen] = useState(false);
    const togglePopup = () => setPopupOpen(!isPopupOpen);

    const [groups, setGroups] = useState([]);
    
    useEffect(() => {
        fetch('http://localhost:5000/api/groups')
        .then(response => response.json())
        .then(data => {
            setGroups(data)
        }).catch(error => console.error('Error fetching groups:',error))
    }, [])

    return (
        <div>
        <div className='GroupList-container'>
            <h1 className='GroupList-title'>Groups</h1>
            <div className='GroupList-header'>
            <span className='Group-name'>Group</span>
            <span className='Group-tournament'>Tournament</span>
            <span className='Group-points'>Points</span>
            </div>
            {groups.map((group) => (
            <Link to='/scoreboard' key={group.id} className='Group'>
                <div className='Group-name'>{group.name}</div>
                <div className='Group-tournament'>{group.tournament}</div>
                <div className='Group-points'>0</div>
            </Link>
            ))}
            <button className='CreateGroup-button' onClick={togglePopup}>Create Group</button>
        </div>

        {isPopupOpen && (
            <div className="popup-overlay" onClick={togglePopup}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                <CreateGroup togglePopup={togglePopup} />
            </div>
            </div>
        )}
        </div>
    );
};
