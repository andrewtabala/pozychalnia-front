// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MyGamesPage from './pages/MyGamesPage';
import BorrowRequestsPage from './components/BorrowRequestsPage';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';

const App = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<Login />} />

        {/* Protected home route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Home />
              </Box>
            </ProtectedRoute>
          }
        />
        <Route path="/my-games"
          element={
            <ProtectedRoute>
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <MyGamesPage />
              </Box>
            </ProtectedRoute>
          } />
        <Route path="/borrow-requests"
          element={
            <ProtectedRoute>
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <BorrowRequestsPage />
              </Box>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
