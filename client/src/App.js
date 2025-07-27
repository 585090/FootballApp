import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import { Home } from './Pages/Home';
import { MatchList } from './Pages/matchList';
import Scoreboard from './Pages/Scoreboard';
import AuthPage from './Components/AuthPage';
import ProtectedRoute from './Components/ProtectedRoute'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/" 
          element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
        <Route path="/matches" element={<MatchList />} />
        <Route 
          path="/Scoreboard" 
          element={<ProtectedRoute> <Scoreboard /> </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App
