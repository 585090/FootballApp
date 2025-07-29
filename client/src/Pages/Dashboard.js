import { Match } from '../Components/Match';
import Scoreboard from '../Components/Scoreboard';
import { NavigationBar } from '../Components/NavigatorBar';
import './Dashboard.css';
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);

    //Get players
    useEffect(() => {
    fetch('http://localhost:5000/api/players')
        .then(response => response.json())
        .then(data => {
        const sortedPlayers = data.sort((a,b) => b.score - a.score);
        setPlayers(sortedPlayers);
        })
        .catch(error => console.error('Error fetching players:', error));
    })

    //Get todays matches
    function sortMatchesByKickOff(matches) {
        return matches.slice().sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    }

    useEffect(() => {
        const getMatches = async () => {
        const today = new Date().toISOString().split('T')[0];

        try {
            const response = await fetch(`http://localhost:5000/api/matches?date=${today}`);
            const data = await response.json();

            // Optional: Sort here if you want to store sorted version
            setMatches(sortMatchesByKickOff(data));
        } catch (error) {
            console.error("Error getting matches", error);
        }
        };

    getMatches();
  }, []);

    return (
        <div>
            <NavigationBar />
            <h1 className='Dashboard-title'> Dashboard </h1>
            <div className='Dashboard-Container'>
                <div  className='Match-Container'>
                    <h2>Todays matches</h2>
                    {matches.map(match => (
                    <Match className="Matches" 
                        HT={match.teamA} 
                        AT={match.teamB} 
                        KickOff={"match.kickoff"}
                        score={match.score}
                        showInfo={false}/>)
                    )}
                </div>
                <div className='Scoreboard-Container'>
                    <Scoreboard className="Scoreboard"/>
                </div>
            </div>
        </div>

    )
}