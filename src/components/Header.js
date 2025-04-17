// src/components/Header.js
import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

const Header = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: 'primary.main', // Uses the theme's primary color
        color: 'white',
        position: isMobile ? 'sticky' : "unset",
        top: isMobile ? 0 : "unset",
        zIndex: 1000,
        py: 2, // Vertical padding
        px: 3, // Horizontal padding (optional)
      }}
    >
      <Typography variant="h4" align="center">
        {props.page}
      </Typography>
    </Box>
  );
};

export default Header;
