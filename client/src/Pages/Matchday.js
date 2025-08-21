import React, { useEffect, useState } from "react";
import { NavigationBar } from "../Components/utils/NavigationBar";
import {MatchweekSwitcher } from "../Components/utils/MatchweekSwitcher";
import { Match } from "../Components/Match";
import { getMatches } from "../services/APICalls";

import "./Matchday.css"

function groupMatchesByDay(matches) {
    return matches.reduce((groups, match) => {
        const dateObj = new Date(match.kickoffDateTime);
        
        const dayWithDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
        });

        if (!groups[dayWithDate]) {
        groups[dayWithDate] = [];
        }
        groups[dayWithDate].push(match);
        return groups;
    }, {});
}


export function Matchday() {
    const [currentMatchweek, setcurrentMatchweek] = useState(1);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [predictions ] = useState([]);
    const [competition] = useState('PL')

    // Fetch teams
    useEffect(() => {
        const getTeams = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/teams/${competition}`)
                const data = await response.json()
                setTeams(data)
            } catch (error) {
                console.log('Error getting teams', error)
            }
        }
        getTeams();
    }, [competition])

  //Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      const data = await getMatches(currentMatchweek);
      if (Array.isArray(data)) {
        setMatches(sortMatchesByKickOff(data));
      }
      else {
        setMatches([]);
      }
    }
    fetchMatches();
  }, [currentMatchweek]);

    function getTeamCrest(teamName) {
        if (!teams || teams.length === 0) return "";
        const team = teams.find(t => t.teamName === teamName);
        return team ? team.logo : "";
    }

  function sortMatchesByKickOff(matches) {
    return matches.slice().sort((a, b) => new Date(a.kickoffDateTime) - new Date(b.kickoffDateTime));
  }

  const groupedMatches = groupMatchesByDay(matches);

  return (
    <div>
      <NavigationBar />
      <div className="Matchday-container">
        <MatchweekSwitcher onMatchweekChange={setcurrentMatchweek} />
        {Object.entries(groupedMatches).map(([day, dayMatches]) => (
          <div key={day} >
              <div className="matchDay-title" >
                  <h2>{ day } </h2>
                  {predictions}
              </div>
            {dayMatches.map((match) => (
              <Match
                key={match.matchId}
                matchid={match.matchId}
                HT={match.homeTeam}
                AT={match.awayTeam}
                KickOff={match.kickoffDateTime}
                score={match.score}
                status={match.status}
                homeCrest={getTeamCrest(match.homeTeam)}
                awayCrest={getTeamCrest(match.awayTeam)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}