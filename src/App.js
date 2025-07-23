import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import { Home } from './Pages/Home';
import { MatchList } from './Pages/matchList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<MatchList />} />
      </Routes>
    </Router>
  );
}

export default App
