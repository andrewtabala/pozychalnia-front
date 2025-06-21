// src/components/Header.js
import React from 'react';
import { Box, Button, Link, Typography, useMediaQuery, useTheme } from '@mui/material';

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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

      }}
    >
      <Typography variant="h4" align="center">
        {props.page}
      </Typography>
      {!isMobile ? (
        <Button component={Link} sx={{ position: "absolute", right: 40, }} variant="contained" color="secondary" href={'https://send.monobank.ua/jar/7KQq9W5D8e'} target="_blank" rel="noopener noreferrer">
          Підтримати проект
        </Button>
      ) : null}
    </Box>
  );
};

export default Header;
