import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import { Home } from './Pages/Home';
import { MatchList } from './Pages/matchList';
import Scoreboard from './Pages/Scoreboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<MatchList />} />
        <Route path="/Scoreboard" element={<Scoreboard />} />
      </Routes>
    </Router>
  );
}

export default App
