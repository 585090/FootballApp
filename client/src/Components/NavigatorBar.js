import './NavigatorBar.css';

export function NavigationBar() {
  return (
    <div className="Navigation-bar">
        <h1 className="Logo">Footy Guru</h1>
        <div className="Nav-links">
            <a href="/" className="Links">Home</a>
            <a href="/matches" className="Links">Matches</a>
            <a href="/scoreboard" className="Links">Scoreboard</a>
            <a href="/signup" className="Links">Sign Up</a>
            <a href="/login" className="Links">Login</a>
        </div>
    </div>
  );
}