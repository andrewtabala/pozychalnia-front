// src/pages/Home.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import Header from '../components/Header'; // Your header component (if separate)
import Sidebar from '../components/Sidebar';
import BorrowRequestsModal from '../components/BorrowRequestsModal'; // Your modal component
import MyGamesModal from '../components/MyGamesModal'; // Your modal component
import { useState } from 'react';
import AllGamesGrid from '../components/AllGamesGrid';

const Home = () => {

    return (
        <Box sx={{ display: 'flex', width: "100%" }}>
            {/* Main content area */}
            <Box component="main" sx={{ flexGrow: 1, p: 0, width: "100% !important" }}>
                <Header page="Позичальня" />  {/* Optionally, include your header at the top */}
                <Box sx={{ p: 3 }}>
                    <AllGamesGrid isModalOpen isMyGamesOpen /> {/* Your main content, e.g., a grid of games */}
                </Box>
            </Box>
        </Box>
    );
};

export default Home;
