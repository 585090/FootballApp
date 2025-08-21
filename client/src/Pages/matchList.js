import { Match } from "../Components/Match";
import { MatchDateSwitcher } from "../Components/utils/MatchDateSwitcher";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { NavigationBar } from '../Components/utils/NavigationBar';

export function MatchList() {
  const isMobile = useMediaQuery({ maxWidth: 600 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    const getMatches = async () => {
      const dateStr = currentDate.toISOString().split('T')[0];

      try {
        const response = await fetch(`https://footballapp-u80w.onrender.com/api/matches/by-date?date=${dateStr}`);
        const data = await response.json();

        if (!response.ok) {
          // Handle known error from server
          setErrorMessage(data.error || 'Failed to add player');
          return;
        }

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

  return (
    <div>
      <NavigationBar />
      <div className="match-list">
        <h1 className="match-title">{isMobile ? "Matches" : "Upcoming Matches"}</h1>

        <div>
          <MatchDateSwitcher onDateChange={setCurrentDate} />
        </div>

        <div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {matches.map((match) => (
            <Match
              key={match.id}
              matchid={match.id}
              HT={match.homeTeam}
              AT={match.awayTeam}
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
