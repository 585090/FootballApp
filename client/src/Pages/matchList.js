import { Match } from "../Components/Match";
import { MatchDateSwitcher } from "../Components/MatchDateSwitcher";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { NavigationBar } from '../Components/NavigatorBar';

export function MatchList() {
  const isMobile = useMediaQuery({ maxWidth: 600 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const getMatches = async () => {
      const dateStr = currentDate.toISOString().split('T')[0];

      try {
        const response = await fetch(`http://localhost:5000/api/matches?date=${dateStr}`);
        const data = await response.json();

        // Optional: Sort here if you want to store sorted version
        setMatches(sortMatchesByKickOff(data));
      } catch (error) {
        console.error("Error getting matches", error);
      }
    };

    getMatches();
  }, [currentDate]);

  function sortMatchesByKickOff(matches) {
    return matches.slice().sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  }

  function formatTime(kickoff) {
    const d = new Date(kickoff);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return (
    <div>
      <NavigationBar />
      <div className="match-list">
        <h1 className="match-title">{isMobile ? "Matches" : "Upcoming Matches"}</h1>

        <div>
          <MatchDateSwitcher onDateChange={setCurrentDate} />
        </div>

        <div>
          {matches.map((match) => (
            <Match
              key={match.id}
              matchid={match.id}
              HT={match.teamA}
              AT={match.teamB}
              KickOff={match.kickoff}
              score={match.score}
              status={match.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
