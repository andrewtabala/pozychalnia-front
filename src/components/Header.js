// src/components/Header.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const Header = () => {
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: 'primary.main', // Uses the theme's primary color
        color: 'white',
        py: 2, // Vertical padding
        px: 3, // Horizontal padding (optional)
      }}
    >
      <Typography variant="h4" align="center">
        Позичальня
      </Typography>
    </Box>
  );
};

export default Header;
