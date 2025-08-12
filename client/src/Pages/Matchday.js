import React, { use, useEffect, useState } from "react";
import { NavigationBar } from "../Components/utils/NavigationBar";
import {MatchweekSwitcher } from "../Components/utils/MatchweekSwitcher";
import { Match } from "../Components/Match";
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

    useEffect(() => {
        const getTeams = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/teams/PL`)
                const data = await response.json()
                setTeams(data)
            } catch (error) {
                console.log('Error getting teams', error)
            }
        }
        getTeams();
    }, [])


  useEffect(() => {
    const getMatches = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/by-matchweek/?matchweek=${currentMatchweek}`);
        const data = await response.json();

        if (!response.ok) {
          console.log('Error', data.error);
          return;
        }

        setMatches(sortMatchesByKickOff(data));
      } catch (error) {
        console.error("Error getting matches", error);
      }
    };
    getMatches();
  }, [currentMatchweek]);

    function getTeamCrest(teamName) {
        if (!teams || teams.length === 0) return "";
        const team = teams.find(t => t.teamName === teamName);
        console.log("Looking for:", teamName);
        console.log("Available teams:", teams.map(t => t.teamName));
        return team ? team.logo : "";
    }

  function sortMatchesByKickOff(matches) {
    return matches.slice().sort((a, b) => new Date(a.kickoffDateTime) - new Date(b.kickoffDateTime));
  }

  const groupedMatches = groupMatchesByDay(matches);

  return (
    <div>
      <NavigationBar />
      <MatchweekSwitcher onMatchweekChange={setcurrentMatchweek} />

      {Object.entries(groupedMatches).map(([day, dayMatches]) => (
        <div key={day} >
            <div className="matchDay-title" >
                <h2>{ day } </h2>
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
  );
}