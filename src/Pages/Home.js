import { Link } from "react-router-dom"

export function Home() {
  return (
    <div className="home">
      <h1>Welcome to the Football Score Predictions</h1>
      <p>Your go-to platform for predicting football match outcomes!</p>
      <Link to="/matches">View Upcoming Matches</Link>
      <br />
      <Link to="/Scoreboard">View Scoreboard</Link>
    </div>
  )
}

