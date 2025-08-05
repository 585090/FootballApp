import React, { useState } from 'react';
import './GroupList.css';
import '../assets/PopupForm.css';
import { useNavigate } from 'react-router-dom';

export const CreateGroup = ({ togglePopup }) => {
    const [tournaments] = useState([
        { id: "1", name: "Champions League" },
        { id: "2", name: "Europa League" },
        { id: "3", name: "Conference League" },
    ]);
    const [Groupform, setGroupform] = useState({ groupName: '', tournament: '' });

    const handleChange = (e) => {
        setGroupform({ ...Groupform, [e.target.name]: e.target.value });
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const playerJSON = localStorage.getItem('player');
        const player = playerJSON ? JSON.parse(playerJSON) : null;
        const email = player?.email; 

        const bodyData = {
            groupName: Groupform.groupName.trim(),
            tournament: Groupform.tournament,
            email
        };
        
        console.log(bodyData)

        const response = await fetch('http://localhost:5000/api/groups/createGroup', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(bodyData),
        });

        const data = await response.json();

        if (response.ok) {
        navigate('/dashboard', { state: { message: 'Group created', group: data.group } });
        togglePopup(); 
        } 
        else {
        alert(data.error || 'Something went wrong');
        }
    };

    return (
        <div>
            <h1 className='CreateGroup-title'>Create group</h1>
            <form className='CreateGroup-Form' onSubmit={handleSubmit}>
                <input
                    className='GroupName-input'
                    type="text"
                    name='groupName'
                    placeholder='Group Name'
                    value={Groupform.groupName}
                    onChange={handleChange}
                    required
                />
                <select
                    className='Tournament-dropdown'
                    name='tournament'
                    value={Groupform.tournament}
                    onChange={handleChange}
                    required
                >
                <option value="">-- Select tournament --</option>
                {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.name}>
                    {tournament.name}
                    </option>
                ))}
                </select>
                <br />
                <button type="submit">Create</button>
            </form>
        </div>
    );
};
