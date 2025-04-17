import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, IconButton } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';

import logo from '../media/logo.png'; // Adjust the path to your logo

const drawerWidth = 240;

export default function Sidebar() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);

    const menuItems = [
        { text: 'Головна', icon: <HomeIcon fontSize="large" />, path: '/' },
        { text: 'Позики', icon: <AssignmentIcon fontSize="large" />, path: '/borrow-requests' },
        { text: 'Мої ігри', icon: <SportsEsportsIcon fontSize="large" />, path: '/my-games' },
        // { text: 'Мій профіль', icon: <PersonIcon fontSize="large" />, path: '/my-profile' },
    ];

    const drawerContent = (
        <>
            <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
                <img src={logo} width="75" />
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        button
                        component={NavLink}
                        to={item.path}
                        sx={{
                            '&.active': { backgroundColor: theme.palette.action.selected },
                            textDecoration: 'none',
                            color: 'inherit',
                            paddingLeft: "34px"
                        }}
                    >
                        <Box sx={{ marginBottom: "12px", paddingTop: "10px", display: "flex", justifyContent: "center", alignItems: "center" }} >
                            {/* {open ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                                <ListItemIcon sx={{ color: '#c93636', }}>{item.icon}</ListItemIcon>
                            </Box>
                        ) : ( */}
                            <ListItemIcon sx={{ color: '#c93636', }}>{item.icon}</ListItemIcon>
                            {/* )} */}
                            {open && <ListItemText sx={{ width: "120px" }} primary={item.text} />}
                        </Box>
                    </ListItem>
                ))}
            </List>
        </>
    );

    // Mobile: swipeable temporary drawer
    if (isMobile) {
        return (
            <>
                {!open ? (
                    <IconButton
                        onClick={() => setOpen(true)}
                        sx={{ color: "white", position: 'fixed', top: 16, left: 16, zIndex: theme.zIndex.drawer + 1 }}
                    >
                        <MenuIcon />
                    </IconButton>
                ) : null}
                <SwipeableDrawer
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                >
                    <Box sx={{ width: drawerWidth }} role="presentation" onClick={() => setOpen(false)} onKeyDown={() => setOpen(false)}>
                        {drawerContent}
                    </Box>
                </SwipeableDrawer>
            </>
        );
    }

    // Desktop: persistent, collapsible on hover
    return (
        <Box
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            sx={{
                width: open ? drawerWidth : theme.spacing(13),
                transition: "width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : theme.spacing(13),
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                },
            }}
        >
            <Drawer variant="permanent" open={open}>
                {drawerContent}
            </Drawer>
        </Box>
    );
}
