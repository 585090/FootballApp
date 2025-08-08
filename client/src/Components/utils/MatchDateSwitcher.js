import { useState } from "react";
import "./MatchDateSwitcher.css";

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
    setSelectedDate(today);
    onDateChange?.(today);
  };

  const formatDate = (date) => {
    if (isToday(date)) return "Today";
    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handler for when user picks a date from calendar input
  const handleDateChange = (e) => {
    const pickedDate = new Date(e.target.value);
    if (!isNaN(pickedDate)) {
      setSelectedDate(pickedDate);
      onDateChange?.(pickedDate);
    }
  };

  // Format the date to yyyy-mm-dd for the input value
  const toInputDateString = (date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="Container">
      <div className="DateSwitcherRow">
        <button className="DateButtons" onClick={handlePrevious}>&larr;</button>
        <span className="Date">{formatDate(selectedDate)}</span>
        <input
          type="date"
          value={toInputDateString(selectedDate)}
          onChange={handleDateChange}
          className="DatePicker"
        />
        <button className="DateButtons" onClick={handleNext}>&rarr;</button>
      </div>
      <div>
        <button className="ResetDateButton" onClick={setToday}>Move to today</button>
      </div>
    </div>
  );
}
