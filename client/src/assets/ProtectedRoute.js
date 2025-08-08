import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const player = JSON.parse(localStorage.getItem('player')); // or sessionStorage

  if (!player) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;