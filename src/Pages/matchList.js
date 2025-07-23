import { Link } from "react-router-dom";
import { Match } from "../Components/Match";
export function MatchList() {
  return (
    <div className="match-list">
      <h1>Upcoming Matches</h1>
      <p>Stay tuned for the latest match predictions!</p>
      <Match HT="Norge" AT="Brasil" />
      <Match HT="Argentina" AT="France" />
      <Link to="/">Go back to home</Link>
    </div>
  );
}
