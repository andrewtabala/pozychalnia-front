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

    const [isModalOpen, setModalOpen] = useState(false);
    const [isMyGamesOpen, setMyGamesOpen] = useState(false);

    const onSidebarButtonClick = (button) => {
        if (button === 'позики') {
            handleOpenModal(); // Open the modal when the button is clicked
        } else if (button === 'мої ігри') {
            handleOpenMyGames(); // Open the My Games modal when the button is clicked
        } else if (button === 'my profile') {
            // Navigate to My Profile page
        }
    }

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleOpenMyGames = () => {
        setMyGamesOpen(true);
    }

    const handleCloseMyGames = () => {
        setMyGamesOpen(false);
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar onButtonClick={onSidebarButtonClick} />
            {/* Main content area */}
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                <Header />  {/* Optionally, include your header at the top */}
                <Box sx={{ p: 3 }}>
                    <AllGamesGrid isModalOpen isMyGamesOpen /> {/* Your main content, e.g., a grid of games */}
                </Box>
            </Box>
            <BorrowRequestsModal
                open={isModalOpen}
                onClose={handleCloseModal}
            />
            <MyGamesModal
                open={isMyGamesOpen}
                onClose={handleCloseMyGames}
            />
        </Box>
    );
};

export default Home;
