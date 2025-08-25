import React, { useState, useEffect } from 'react';
import './GroupList.css';
import '../assets/PopupForm.css';
import { Link } from 'react-router-dom';
import { CreateGroup } from './CreateGroup';
import { JoinGroup } from './JoinGroup';

export const GroupList = () => {
    const [isCreateGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
    const [isJoinGroupPopupOpen, setJoinGroupPopupOpen] = useState(false);
    const toggleCreateGroupPopup = () => setCreateGroupPopupOpen(!isCreateGroupPopupOpen);
    const toggleJoinGroupPopup = () => setJoinGroupPopupOpen(!isJoinGroupPopupOpen);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const loggedInPlayer = JSON.parse(localStorage.getItem('player'));
        const playerEmail = loggedInPlayer?.email;
        
        fetch(`https://footballapp-u80w.onrender.com/api/groups/player/${playerEmail}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                setGroups(data);
            } else {
                setGroups([]);
            }
        }).catch(error => console.error('Error fetching groups:',error))
    }, [])

    return (
        <div>
            <div className='GroupList-container'>
                <h1 className='GroupList-title'>Your groups</h1>
                <div className='GroupList-header'>
                <span className='Group-name'>Group</span>
                <span className='Group-tournament'>Tournament</span>
                <span className='Group-points'>Points</span>
                </div>
                {groups.map((group) => (
                <Link to={`/group/${encodeURIComponent(group._id)}`} key={group._id} className='Group'>
                    <div className='Group-name'>{group.groupName}</div>
                    <div className='Group-tournament'>{group.tournament}</div>
                    <div className='Group-points'>{0}</div>
                </Link>
                ))}
                <div className='Group-buttons'>
                    <button className='Group-button' onClick={toggleCreateGroupPopup}>Create group</button>
                    <button className='Group-button' onClick={toggleJoinGroupPopup}>Join group</button>
                </div>
            </div>

            {isCreateGroupPopupOpen && (
                <div className="popup-overlay" onClick={toggleCreateGroupPopup}>
                <div className="popup-content" onClick={e => e.stopPropagation()}>
                    <CreateGroup togglePopup={toggleCreateGroupPopup} />
                </div>
                </div>
            )}
            {isJoinGroupPopupOpen && (
                <div className="popup-overlay" onClick={toggleJoinGroupPopup}>
                <div className="popup-content" onClick={e => e.stopPropagation()}>
                    <JoinGroup togglePopup={toggleJoinGroupPopup} />
                </div>
                </div>
            )}
        </div>
    );
};
