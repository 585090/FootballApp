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
    const getMatches = async() => {
      const dateStr = currentDate.toISOString().split('T')[0];
      try {
        const result = await fetch(`http://localhost:5000/api/matches?date=${dateStr}`)
        const data = await result.json();
        console.log('Matches:', data)
        setMatches(data);
        
      } catch (error) {
        console.log("Error getting matches", error)
      }
    }

    getMatches();
  }, [currentDate])

  return (
    <div>
      <NavigationBar />
      <div className="match-list">
        <h1 className="match-title"> {isMobile ? "Matches" : "Upcoming Matches"} </h1>
        <div>
          <MatchDateSwitcher onDateChange={setCurrentDate} />
        </div>
        <div>
          {matches.map((match) => (
          <Match key={match._id} matchid={match.id} HT={match.teamA} AT={match.teamB} KickOff={match.kickoff} />
          ))}
        </div>
      </div>
    </div>
  );
}
