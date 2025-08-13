import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import { Home } from './Pages/Home';
import { MatchList } from './Pages/matchList';
import { Matchday } from './Pages/Matchday';
import Scoreboard from './Components/Scoreboard';
import AuthPage from './Components/utils/AuthPage';
import ProtectedRoute from './assets/ProtectedRoute';
import Dashboard from './Pages/Dashboard';
import GroupPage from './Pages/Group';
import Account from './Pages/Account';
import './App.css';
import GroupsPage from './Pages/GroupsPage';

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
          path="/group/:groupId" 
          element={<ProtectedRoute> <GroupPage /> </ProtectedRoute>} />
          <Route 
            path="/groupList/" 
            element={<ProtectedRoute> <GroupsPage /> </ProtectedRoute>} />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
        <Route 
          path="/matchday" 
          element={<ProtectedRoute> <Matchday /> </ProtectedRoute>} />
          <Route 
            path="/account" 
            element={<ProtectedRoute> <Account /> </ProtectedRoute>} />
      </Routes>
      
    </Router>
  );
}

export default App
