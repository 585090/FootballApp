import React, { useEffect, useState } from "react";
import { NavigationBar } from "../Components/utils/NavigationBar";
import {MatchweekSwitcher } from "../Components/utils/MatchweekSwitcher";
import { Match } from "../Components/Match";
import { getMatches, getCurrentMatchweek } from "../services/APICalls";

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
    const [currentMatchweek, setcurrentMatchweek] = useState(null);
    const [matches, setMatches] = useState([]);
    const [predictions ] = useState([]);

  useEffect(() => {
    const fetchCurrentMatchweek = async () => {
      const week = await getCurrentMatchweek();
      if (week) setcurrentMatchweek(week);
    }
    fetchCurrentMatchweek();
  }, [])

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
                homeCrest={match.homeTeam}
                awayCrest={match.awayTeam}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}