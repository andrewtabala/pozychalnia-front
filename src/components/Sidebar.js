// src/components/Sidebar.js
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 240; // Set the sidebar width

const Sidebar = (props) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Позики', icon: <AssignmentIcon />, path: '/borrow-requests' },
    { text: 'Мої ігри', icon: <SportsEsportsIcon />, path: '/my-games' },
    { text: 'Мій профіль - в розробці', icon: <PersonIcon />, path: '/my-profile' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {/* Optional header area in the sidebar */}
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Меню
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem 
              button
              sx={{ cursor: 'pointer' }}
              key={index} 
              onClick={() => props.onButtonClick(item.text.toLowerCase())} // Call the passed function with the item text
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
