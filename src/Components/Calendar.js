import { useState } from "react";
import "./Calendar.css";

export function MatchDateSwitcher({ onDateChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const setToday = () => {
    const today = new Date();
    today.setDate(today.getDate());
    setSelectedDate(today);
    onDateChange?.(today);
  }

  const formatDate = (date) => {
    if (isToday(date)) return "Today";
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="Container">
      <div className="DateSwitcherRow">
        <button className="DateButtons" onClick={handlePrevious}>&larr;</button>
        <span className="Date">{formatDate(selectedDate)}</span>
        <button className="DateButtons" onClick={handleNext}>&rarr; </button>
      </div>
      <div>
        <button className="ResetDateButton" onClick={setToday}>Move to today</button>
      </div>
    </div>
  );
}
