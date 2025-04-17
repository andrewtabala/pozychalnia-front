// src/components/AllGamesGrid.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    InputLabel,
    FormControl,
    Select,
    Button,
    CircularProgress,
} from '@mui/material';
import { getGames } from '../api/games';
import { getUserById, getUsers } from '../api/users';
import { requestLoan } from '../api/loans';
import GameCard from './GameCard';

const AllGamesGrid = (props) => {
    // State for all games and the filtered list.
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);

    // State for caching owner details.
    const [ownerMap, setOwnerMap] = useState({});
    // State for caching all users, used for borrowedBy.
    const [usersMap, setUsersMap] = useState({});

    // Filter state.
    const [searchQuery, setSearchQuery] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, unavailable
    const [platformFilter, setPlatformFilter] = useState('all'); // all, Switch, PS5, PS4, Xbox
    const [ownerFilter, setOwnerFilter] = useState('all'); // all or specific user ID
    const [sortOption, setSortOption] = useState('date-desc');

    // State for tracking a game request animation.
    const [requestedGame, setRequestedGame] = useState(null);

    // Retrieve the current user's ID.
    const currentUserId = localStorage.getItem('userId');

    // Fetch all games from the endpoint.
    const fetchGames = useCallback(async () => {
        try {
            const allGames = await getGames();
            setGames(allGames);
            setFilteredGames(allGames.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error('Failed to fetch games:', err);
        }
    }, []);

    // Fetch all users and build a map for quick lookup.
    const fetchUsers = useCallback(async () => {
        try {
            const users = await getUsers();
            const map = {};
            users.forEach((user) => {
                map[user._id] = user;
            });
            setUsersMap(map);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }, []);

    useEffect(() => {
        fetchGames();
        fetchUsers();
    }, [fetchGames, fetchUsers, props]);

    // After games are loaded, fetch and cache owner details if not yet loaded.
    useEffect(() => {
        if (games.length > 0) {
            const uniqueOwnerIds = [...new Set(games.map((game) => game.owner))];
            uniqueOwnerIds.forEach((ownerId) => {
                if (!ownerMap[ownerId]) {
                    getUserById(ownerId)
                        .then((userData) => {
                            setOwnerMap((prev) => ({ ...prev, [ownerId]: userData }));
                        })
                        .catch((error) => {
                            console.error(`Failed to fetch owner with id ${ownerId}:`, error);
                        });
                }
            });
        }
    }, [games, ownerMap]);

    // Filtering logic based on search, availability, and platform.
    useEffect(() => {
        let temp = [...games];
        // search
        if (searchQuery) temp = temp.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
        // availability
        if (availabilityFilter !== 'all') {
            temp = temp.filter(g => availabilityFilter === 'available' ? g.available : !g.available);
        }
        // platform
        if (platformFilter !== 'all') {
            temp = temp.filter(g => g.platform === platformFilter);
        }
        // owner
        if (ownerFilter !== 'all') {
            temp = temp.filter(g => g.owner === ownerFilter);
        }
        // sorting
        switch (sortOption) {
            case 'title-asc':
                temp.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                temp.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'date-asc':
                temp.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'date-desc':
                temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                break;
        }
        setFilteredGames(temp);
    }, [games, searchQuery, availabilityFilter, platformFilter, ownerFilter, sortOption]);


    // Handler for requesting a game.
    const handleRequest = async (gameId) => {
        const confirmed = window.confirm('Are you sure you want to request this game?');
        if (!confirmed) return;
        try {
            await requestLoan(gameId);
            setRequestedGame(gameId);
            // Show the "Requested!" overlay briefly before refreshing the view.
            setTimeout(() => {
                setRequestedGame(null);
                fetchGames();
            }, 2000);
        } catch (error) {
            console.error('Error requesting game:', error);
        }
    };

    return (
        <>
            {games.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ p: 2 }}>
                    {/* Filters */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 180 }}>
                            <InputLabel>Сортування</InputLabel>
                            <Select
                                value={sortOption}
                                label="Сортування"
                                onChange={e => setSortOption(e.target.value)}
                            >
                                <MenuItem value="title-asc">A-Z</MenuItem>
                                <MenuItem value="title-desc">Z-A</MenuItem>
                                <MenuItem value="date-asc">Старіші спочатку</MenuItem>
                                <MenuItem value="date-desc">Новіші спочатку</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Пошук"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <FormControl variant="outlined" sx={{ minWidth: 100 }} >
                            <InputLabel id="platform-filter-label">Платформа</InputLabel>
                            <Select
                                labelId="platform-filter-label"
                                label="Платформа"
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                            >
                                <MenuItem value="all">Всі</MenuItem>
                                <MenuItem value="Switch">Switch</MenuItem>
                                <MenuItem value="PS5">PS5</MenuItem>
                                <MenuItem value="PS4">PS4</MenuItem>
                                <MenuItem value="Xbox">Xbox</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 100 }} >
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={availabilityFilter}
                                label="Статус"
                                onChange={e => setAvailabilityFilter(e.target.value)}
                            >
                                <MenuItem value="all">Всі</MenuItem>
                                <MenuItem value="available">Вільні</MenuItem>
                                <MenuItem value="unavailable">Позичені</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 100 }} >
                            <InputLabel>Власник</InputLabel>
                            <Select
                                value={ownerFilter}
                                label="Власник"
                                onChange={e => setOwnerFilter(e.target.value)}
                            >
                                <MenuItem value="all">Всі</MenuItem>
                                {Object.entries(ownerMap).map(([id, user]) => (
                                    <MenuItem key={id} value={id}>
                                        {user.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Grid of games */}
                    <Grid container spacing={2}>
                        {filteredGames.map((game) => (
                            <Grid key={game._id} item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                {/* Game card */}
                                <GameCard
                                    game={game}
                                    requested={requestedGame === game._id}
                                    usersMap={usersMap}
                                    currentUserId={currentUserId}
                                    onRequest={() => handleRequest(game._id)} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </>
    );
};

export default AllGamesGrid;
