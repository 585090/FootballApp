import { Link } from "react-router-dom";
import { Match } from "../Components/Match";
import { MatchDateSwitcher } from "../Components/Calendar";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";

export function MatchList() {
  const isMobile = useMediaQuery({ maxWidth: 600 });
  const [currentDate, setCurrentDate] = useState(new Date());

  const matches = [
    { id: 1, teamA: "France", teamB: "Germany", date: "2025-07-23", kickoff: "20:00" },
    { id: 2, teamA: "Brazil", teamB: "Argentina", date: "2025-07-24", kickoff: "20:00" },
    { id: 3, teamA: "Italy", teamB: "Spain", date: "2025-07-25", kickoff: "20:00" },
    { id: 4, teamA: "England", teamB: "Portugal", date: "2025-07-23", kickoff: "18:00" },
    { id: 5, teamA: "Netherlands", teamB: "Belgium", date: "2025-07-24", kickoff: "17:00" },
    { id: 6, teamA: "Mexico", teamB: "USA", date: "2025-07-25", kickoff: "19:00" },
    { id: 7, teamA: "Japan", teamB: "South Korea", date: "2025-07-23", kickoff: "14:00" },
    { id: 8, teamA: "Nigeria", teamB: "Ghana", date: "2025-07-26", kickoff: "21:00" },
    { id: 9, teamA: "Uruguay", teamB: "Colombia", date: "2025-07-26", kickoff: "20:00" },
    { id: 10, teamA: "Australia", teamB: "New Zealand", date: "2025-07-27", kickoff: "16:00" },
    { id: 11, teamA: "Sweden", teamB: "Denmark", date: "2025-07-27", kickoff: "18:30" },
    { id: 12, teamA: "Croatia", teamB: "Serbia", date: "2025-07-28", kickoff: "20:45" },
    { id: 13, teamA: "Morocco", teamB: "Egypt", date: "2025-07-28", kickoff: "19:00" },
    { id: 14, teamA: "Canada", teamB: "Costa Rica", date: "2025-07-29", kickoff: "21:15" },
    { id: 15, teamA: "Switzerland", teamB: "Austria", date: "2025-07-29", kickoff: "17:45" }
  ];

  const sortedMatches = matches.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.kickoff}`);
    const dateB = new Date(`${b.date}T${b.kickoff}`);
    return dateA - dateB;
  })

  const filteredMatches = sortedMatches.filter((match) => {
    const matchDate = new Date(match.date);
    return (
      matchDate.getFullYear() === currentDate.getFullYear() &&
      matchDate.getMonth() === currentDate.getMonth() &&
      matchDate.getDate() === currentDate.getDate()
    );
  });

  return (
    <div className="match-list">
      <h1 className="match-title"> {isMobile ? "Matches" : "Upcoming Matches"} </h1>
      <div>
        <MatchDateSwitcher onDateChange={setCurrentDate} />
      </div>
      <div>
        {filteredMatches.map((match) => (
        <Match HT={match.teamA} AT={match.teamB} KickOff={match.kickoff} />
        ))}
      </div>
      <Link to="/">Go back to home</Link>
    </div>
  );
}
