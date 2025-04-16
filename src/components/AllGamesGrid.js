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
} from '@mui/material';
import { getGames } from '../api/games';
import { getUserById, getUsers } from '../api/users';
import { requestLoan } from '../api/loans';

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

  // State for tracking a game request animation.
  const [requestedGame, setRequestedGame] = useState(null);

  // Retrieve the current user's ID.
  const currentUserId = localStorage.getItem('userId');

  // Fetch all games from the endpoint.
  const fetchGames = useCallback(async () => {
    try {
      const allGames = await getGames();
      setGames(allGames);
      setFilteredGames(allGames);
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
    const filtered = games.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesAvailability = true;
      if (availabilityFilter === 'available') {
        matchesAvailability = game.available === true;
      } else if (availabilityFilter === 'unavailable') {
        matchesAvailability = game.available === false;
      }
      const matchesPlatform = platformFilter === 'all' || game.platform === platformFilter;
      return matchesSearch && matchesAvailability && matchesPlatform;
    });
    setFilteredGames(filtered);
  }, [games, searchQuery, availabilityFilter, platformFilter]);

  // Tint style for unavailable games.
  const getTintStyles = (game) => {
    if (!game.available) {
      return { backgroundColor: 'rgba(128, 128, 128, 0.2)' };
    }
    return {};
  };

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
    <Box sx={{ p: 2 }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Пошук"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
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
      </Box>

      {/* Grid of games */}
      <Grid container spacing={2}>
        {filteredGames.map((game) => (
          <Grid key={game._id} item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            {/* Game card */}
            <Card sx={{ position: 'relative', ...getTintStyles(game) }}>
              {/* Hover overlay for available games */}
              {game.available && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0)',
                    transition: 'background-color 0.3s, opacity 0.3s',
                    opacity: 0,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      opacity: 1,
                    },
                  }}
                >
                  {String(game.owner) === currentUserId ? (
                    <Typography variant="button" sx={{ color: 'white' }}>
                      Це твоя гра, дурнику
                    </Typography>
                  ) : (
                    <Button variant="contained" onClick={() => handleRequest(game._id)}>
                      Позичити?
                    </Button>
                  )}
                </Box>
              )}
              {/* "Requested!" overlay */}
              {requestedGame === game._id && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    zIndex: 2,
                  }}
                >
                  Requested!
                </Box>
              )}
              <CardMedia
                component="img"
                alt={game.title}
                height="200"
                sx={{ filter: game.available ? 'none' : 'grayscale(100%)' }}
                image={game.imageUrl || 'https://via.placeholder.com/200x250?text=No+Image'}
              />
              <CardContent sx={{ p: 1 }}>
                <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'bold' }}>
                  {game.title}
                </Typography>
                <Typography variant="caption" display="block" align="center">
                  {ownerMap[game.owner]
                    ? `Власник - ${ownerMap[game.owner].username} (${ownerMap[game.owner].telegramContact})`
                    : 'Loading owner...'}
                </Typography>
                {/* Display borrower info if the game is not available */}
                {!game.available && game.borrowedBy && (
                  <Typography variant="caption" display="block" align="center" color="error">
                    {game.borrowedBy in usersMap
                      ? `Хто позичив - ${usersMap[game.borrowedBy].username} (${usersMap[game.borrowedBy].telegramContact})`
                      : 'Loading borrower...'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AllGamesGrid;
