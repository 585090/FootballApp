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
    const [currentMatchweek, setcurrentMatchweek] = useState(null);
    const [matches, setMatches] = useState([]);
    const [ predictions ] = useState([]);

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

  useEffect(() => {
    const fetchInitialMatchweek = async () => {
      const allMatches = await getMatches(); // get all matches of the season
      if (!allMatches) return;

      const today = new Date();

      // Find first matchweek where at least one match is >= today
      const groupedByWeek = allMatches.reduce((acc, match) => {
        if (!acc[match.matchweek]) acc[match.matchweek] = [];
        acc[match.matchweek].push(match);
        return acc;
      }, {});

      const current = Object.keys(groupedByWeek).find(week =>
        groupedByWeek[week].some(m => new Date(m.kickoffDateTime) >= today)
      );

      if (current) {
        setcurrentMatchweek(Number(current));
      }
    };

    fetchInitialMatchweek();
  }, []);



  const groupedMatches = groupMatchesByDay(matches);

  return (
    <div>
      <NavigationBar />
      <div className="Matchday-container">
        <MatchweekSwitcher currentWeek={currentMatchweek} onMatchweekChange={setcurrentMatchweek} />
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