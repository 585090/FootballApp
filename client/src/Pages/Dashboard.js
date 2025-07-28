import { Match } from '../Components/Match';
import Scoreboard from '../Components/Scoreboard';
import { NavigationBar } from '../Components/NavigatorBar';
import './Dashboard.css';
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
    const [players, setPlayers] = useState([]);
    useEffect(() => {
    fetch('http://localhost:5000/api/players')
        .then(response => response.json())
        .then(data => {
        const sortedPlayers = data.sort((a,b) => b.score - a.score);
        setPlayers(sortedPlayers);
        })
        .catch(error => console.error('Error fetching players:', error));
    })

    return (
        <div>
            <NavigationBar />
            <h1 className='Dashboard-title'> Dashboard </h1>
            <div className='Dashboard-Container'>
                <div  className='Match-Container'>
                    <h2>Todays matches</h2>
                    <Match className="Matches" 
                        HT={"Brazil"} 
                        AT={"Norway"} 
                        KickOff={"20:00"}
                        showInfo={false}/>
                </div>
                <div className='Scoreboard-Container'>
                    <Scoreboard className="Scoreboard"/>
                </div>
            </div>
        </div>

    )
}