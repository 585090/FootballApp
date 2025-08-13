import React, { useState } from 'react';
import { gamemodeRoutes } from '../assets/GamemodeRoutes';
import './GroupList.css';
import '../assets/PopupForm.css';
import { useNavigate } from 'react-router-dom';

export const CreateGroup = ({ togglePopup }) => {
    const [tournaments] = useState([
        { id: "1", name: "Champions League" },
        { id: "2", name: "Europa League" },
        { id: "3", name: "Conference League" },
        { id: "4", name: "Premier League" }
    ]);

    const gamemodes = Object.entries(gamemodeRoutes).map(([id, config]) => ({
        id,
        name: config.label
    }));  

    const [Groupform, setGroupform] = useState({ groupName: '', tournament: '', gamemode: '' });

    const handleChange = (e) => {
        setGroupform({ ...Groupform, [e.target.name]: e.target.value });
        console.log(e.target.name, e.target.value)
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
            gamemode: Groupform.gamemode,
            email
        };
        
        console.log("Sending to backend:", JSON.stringify(bodyData, null, 2));
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
                <select
                    className='Tournament-dropdown'
                    name='gamemode'
                    value={Groupform.gamemode}
                    onChange={handleChange}
                    required
                >
                <option value="">-- Select gamemode --</option>
                {gamemodes.map((game) => (
                    <option key={game.id} value={game.id}>
                    {game.name}
                    </option>
                ))}
                </select>
                <br />
                <button type="submit">Create</button>
            </form>
        </div>
    );
};
