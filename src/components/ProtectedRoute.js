// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // A simple auth check (customize as needed)
  const isAuthenticated = Boolean(localStorage.getItem('authToken'));
  
  // If authenticated, render children, otherwise redirect to /login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
