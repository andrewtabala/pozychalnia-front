// src/theme.js
import { createTheme } from '@mui/material/styles';

// Create a custom theme and override the default typography settings.
const theme = createTheme({
  palette: {
    primary: {
      main: '#c93636',
    },
  },
  typography: {
    // Set the new font as the default for your application.
    fontFamily: "'Raleway', 'Roboto', sans-serif",
    // Optionally, customize other typography settings (e.g., headings)
    h1: {
      fontFamily: "'Raleway', 'Roboto', sans-serif",
    },
    // ... you can extend this to h2, h3, etc.
  },
});

export default theme;
