import { useState } from "react";
import "./MatchDateSwitcher.css";

export function MatchweekSwitcher({ onMatchweekChange }) {
  const [selectedWeek, setSelectedWeek] = useState(1);

  const handlePrevious = () => {
    setSelectedWeek((prevWeek) => {
      const newWeek = Math.max(1, prevWeek - 1);
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
    setSelectedWeek(() => {
      const newWeek = 1;
      onMatchweekChange?.(newWeek);
      console.log('Matchweek', newWeek);
      return newWeek;
    });
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
