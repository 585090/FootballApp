import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import { Home } from './Pages/Home';
import { MatchList } from './Pages/matchList';
import Scoreboard from './Components/Scoreboard';
import AuthPage from './Components/AuthPage';
import ProtectedRoute from './Components/ProtectedRoute'
import Dashboard from './Pages/Dashboard'
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
          path="/scoreboard" 
          element={<ProtectedRoute> <Scoreboard /> </ProtectedRoute>} />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App
