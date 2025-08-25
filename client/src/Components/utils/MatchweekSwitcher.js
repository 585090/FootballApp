import { useState } from "react";
import "./MatchDateSwitcher.css";
import { getCurrentMatchweek } from "../../services/APICalls";

export function MatchweekSwitcher({ currentWeek, onMatchweekChange }) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const handlePrevious = () => {
    setSelectedWeek((prevWeek) => {
      const newWeek = prevWeek - 1;
      onMatchweekChange?.(newWeek);
      console.log('Matchweek', newWeek);
      return newWeek;
    });
  };

  const handleNext = () => {
    setSelectedWeek((prevWeek) => {
      const newWeek = prevWeek + 1;
      onMatchweekChange?.(newWeek);
      console.log('Matchweek', newWeek);
      return newWeek;
    });
  };

  const setToday = () => {
    const fetchCurrentWeek = async () => {
      const week = await getCurrentMatchweek();
      if (week) {
        setSelectedWeek(week);
        onMatchweekChange?.(week);
        console.log('Matchweek', week);
      }
    };
    fetchCurrentWeek();
  };

  return (
    <div className="Container">
      <div className="DateSwitcherRow">
        <button className="DateButtons" onClick={handlePrevious}>&larr;</button>
        <span className="Date">Matchweek {selectedWeek}</span>
        <button className="DateButtons" onClick={handleNext}>&rarr;</button>
      </div>
      <div>
        <button className="ResetDateButton" onClick={setToday}>Move to today</button>
      </div>
    </div>
  );
}
