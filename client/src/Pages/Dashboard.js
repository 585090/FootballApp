import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../Components/Match';
import { NavigationBar } from '../Components/utils/NavigationBar';
import { GroupList } from '../Components/GroupList';
import PredictionTable from '../Components/predictionTable/PredictionTable';
import './Dashboard.css';


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
    }, [])

    //Get todays matches
    function sortMatchesByKickOff(matches) {
        return matches.slice().sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    }

    useEffect(() => {
        const getMatches = async () => {
        const today = new Date().toISOString().split('T')[0];

        try {
            const response = await fetch(`http://localhost:5000/api/matches/by-date?date=${today}`);
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
            <div className='Dashboard-Container'>
                <div className='extraButtons-container'>
                    <button className='extraButton' >Button 1</button>
                    <button className='extraButton' >Button 1</button>
                    <button className='extraButton' >Button 1</button>
                </div>
                <div  className='Match-Container'>
                    <h2>Todays matches</h2>
                    {matches.length > 0 ? (
                        matches.slice(0,3).map(match => (
                        <Match className="Matches" 
                            HT={match.teamA} 
                            AT={match.teamB} 
                            KickOff={"match.kickoff"}
                            score={match.score}
                            showInfo={false}/>)
                        )
                    ) : (
                        <p> No matches today </p>
                    )}
                    <Link className='Matchday-link' to='/matchday'> more matches </Link>
                </div>
                <div className='Group-Container'>
                    <GroupList />
                </div>
            </div>
        </div>

    )
}