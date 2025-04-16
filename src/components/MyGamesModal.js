// src/components/MyGamesModal.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Button,
    TextField,
    Autocomplete,
    MenuItem,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';

// Import our endpoints
import { getGames, bulkCreateGames, deleteGame } from '../api/games';
import { getBorrowedGames, returnLoan } from '../api/loans';
import { searchRawgTitles } from '../api/rawg';
import { getUsers } from '../api/users';

/**
 * Helper: Render a platform label based on the provided platform.
 */
function renderPlatformLabel(platform) {
    switch (platform) {
        case 'Switch':
            return 'Nintendo Switch';
        case 'PS5':
            return 'PS5';
        case 'PS4':
            return 'PS4';
        case 'Xbox':
            return 'Xbox';
        default:
            return platform;
    }
}

/**
 * MyGamesModal component
 */
const MyGamesModal = ({ open, onClose }) => {
    // State for the combined list of games
    const [games, setGames] = useState([]);
    // Flag for switching between view mode and add mode
    const [isAdding, setIsAdding] = useState(false);
    // List for holding games queued for bulk creation
    const [gamesToAdd, setGamesToAdd] = useState([]);
    // Object to hold the current game being added, including the imageUrl field.
    const [currentGame, setCurrentGame] = useState({
        title: '',
        platform: '',
        available: 'yes',
        imageUrl: '',
    });
    // Indicates if at least one game is queued
    const [hasQueuedGames, setHasQueuedGames] = useState(false);
    // Autocomplete suggestions from RAWG API
    const [rawgOptions, setRawgOptions] = useState([]);
    const [usersMap, setUsersMap] = useState({});

    // Retrieve the current user's ID (adjust based on your auth implementation)
    const currentUserId = localStorage.getItem('userId');

    // Fetch owned games using getGames() and borrowed games using getBorrowedGames()
    const fetchCombinedGames = useCallback(async (map) => {
        try {
            // Fetch all games (owned by anyone)
            const allGames = await getGames();
            // Filter to get owned games: where the owner ID matches currentUserId.
            let ownedGames = allGames.filter((game) => String(game.owner) === currentUserId);

            ownedGames = ownedGames.map((game) => ({
                ...game,
                borrowedByUsername: game.borrowedBy && map[game.borrowedBy] ? map[game.borrowedBy].username : null,
                borrowedByTelegram: game.borrowedBy && map[game.borrowedBy] ? map[game.borrowedBy].telegramContact : null,
            }));

            // Fetch borrowed loans where the logged-in user is the taker.
            let borrowedLoans = [];
            try {
                borrowedLoans = await getBorrowedGames();
            } catch (borrowErr) {
                // If the endpoint returns 404, assume no borrowed games.
                borrowedLoans = [];
            }
            // Transform borrowedLoans to extract the game, mark it as borrowed, and preserve the lender info.
            const borrowedGames = borrowedLoans.map((loan) => ({
                ...loan.game, // game data from populate({ title, platform, imageUrl })
                borrowedByMe: true,
                lender: loan.giver, // add lender information from the loan
            }));

            // Combine: borrowed games come first.
            console.log('Borrowed games:', borrowedGames);
            console.log('Owned games:', ownedGames);

            setGames([...borrowedGames, ...ownedGames]);
        } catch (err) {
            console.error('Failed to fetch games:', err);
        }
    }, [currentUserId]);

    const fetchUsers = useCallback(async () => {
        try {
            const users = await getUsers();
            const map = {};
            users.forEach((user) => {
                map[user._id] = user;
            });
            setUsersMap(map);
            fetchCombinedGames(map);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        // When the modal opens (and we're not adding), fetch combined games.
    }, [open, isAdding, fetchCombinedGames]);

    // Reset states on close
    const handleClose = () => {
        setIsAdding(false);
        setGamesToAdd([]);
        setCurrentGame({ title: '', platform: '', available: 'yes', imageUrl: '' });
        setHasQueuedGames(false);
        onClose();
    };

    // Switch into add mode
    const handleAddGames = () => {
        setIsAdding(true);
    };

    // Autocomplete: When the Title input changes, update currentGame and fetch suggestions.
    const handleTitleInputChange = async (event, value) => {
        setCurrentGame((prev) => ({ ...prev, title: value }));
        if (value && value.length >= 3) {
            try {
                const suggestions = await searchRawgTitles(value);
                setRawgOptions(suggestions);
            } catch (err) {
                console.error('Error searching RAWG titles:', err);
            }
        } else {
            setRawgOptions([]);
        }
    };

    // Update the current game form fields.
    const handleChange = (field, value) => {
        setCurrentGame((prev) => ({ ...prev, [field]: value }));
    };

    // When a suggestion is selected, store both the title and the imageUrl.
    const handleTitleSelection = (event, newValue) => {
        if (newValue) {
            setCurrentGame((prev) => ({
                ...prev,
                title: newValue.name || '',
                imageUrl: newValue.background_image || '',
            }));
        } else {
            setCurrentGame((prev) => ({ ...prev, title: '', imageUrl: '' }));
        }
    };

    // Add the current game to the bulk creation queue.
    const handleOk = () => {
        setGamesToAdd((prev) => [...prev, currentGame]);
        setHasQueuedGames(true);
        setCurrentGame({ title: '', platform: '', available: 'yes', imageUrl: '' });
    };

    // Save the queued games using bulkCreateGames endpoint.
    const handleSave = async () => {
        try {
            await bulkCreateGames(gamesToAdd);
            setIsAdding(false);
            setGamesToAdd([]);
            setHasQueuedGames(false);
            fetchCombinedGames();
        } catch (err) {
            console.error('Failed to bulk create games:', err);
        }
    };

    // Updated tint styles: if a game is flagged as borrowedByMe, tint it red; otherwise, if not available, tint it gray.
    const getTintStyles = (game) => {
        if (game.borrowedByMe) {
            return { backgroundColor: 'rgba(255, 0, 0, 0.15)' };
        } else if (!game.available) {
            return { backgroundColor: 'rgba(128, 128, 128, 0.15)' };
        }
        return {};
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
                <DialogTitle sx={{ flex: 1, mb: 0, p: 0 }}>Мої ігри</DialogTitle>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* View Mode: Display grid of my games */}
            {!isAdding && (
                <DialogContent dividers>
                    <Box sx={{ textAlign: 'right', mb: 2 }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddGames}>
                            Додати Ігри
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        {games.map((gameItem) => (
                            <Grid item key={gameItem._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <Card sx={{ position: 'relative', ...getTintStyles(gameItem) }}>
                                    {/* Delete Icon Button at the top-right */}
                                    <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                                        {gameItem.available && (
                                            <IconButton
                                                size="small"
                                                onClick={async () => {
                                                    const confirmDelete = window.confirm('Точно видалити гру?');
                                                    if (confirmDelete) {
                                                        try {
                                                            await deleteGame(gameItem._id);
                                                            setGames((prevGames) =>
                                                                prevGames.filter((g) => g._id !== gameItem._id)
                                                            );
                                                        } catch (error) {
                                                            console.error('Failed to delete game:', error);
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid black',
                                                    color: 'red',
                                                    p: 0.5,
                                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        {!gameItem.available && !gameItem.borrowedByMe && (
                                            <IconButton
                                                size="small"
                                                onClick={async () => {
                                                    const confirmReturn = window.confirm('Чи повернули вам гру?');
                                                    if (confirmReturn) {
                                                        try {
                                                            await returnLoan(gameItem._id);
                                                            setGames((prevGames) =>
                                                                prevGames.filter((g) => g._id !== gameItem._id)
                                                            );
                                                        } catch (error) {
                                                            console.error('Failed to delete game:', error);
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid black',
                                                    color: 'green',
                                                    p: 0.5,
                                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
                                                }}
                                            >
                                                <CheckIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <CardMedia
                                        component="img"
                                        alt={gameItem.title}
                                        height="140"
                                        sx={{ filter: gameItem.available ? 'none' : 'grayscale(100%)' }}
                                        image={gameItem.imageUrl || 'https://via.placeholder.com/200x250?text=No+Image'}
                                    />
                                    <CardContent sx={{ position: 'relative' }}>
                                        {/* Platform label in the top-left corner */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: '#fff',
                                                px: 0.5,
                                                borderRadius: 1,
                                            }}
                                        >
                                            {renderPlatformLabel(gameItem.platform)}
                                        </Typography>
                                        {/* Game title */}
                                        <Typography variant="subtitle2" sx={{ textAlign: 'center', mt: 5, fontWeight: 'bold' }}>
                                            {gameItem.title}
                                        </Typography>
                                        {/* Conditional display for borrowed games */}
                                        {gameItem.borrowedByMe && gameItem.lender && (
                                            <Typography variant="caption" display="block" align="center">
                                                Позичено у {gameItem.lender.username}
                                            </Typography>
                                        )}
                                        {(!gameItem.available && gameItem.borrowedBy && !gameItem.borrowedByMe) && (
                                            <Typography variant="caption" display="block" align="center" color="error">
                                                Хто позичив - {gameItem.borrowedByUsername} ({gameItem.borrowedByTelegram})
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            )}

            {/* Add Mode: Form to add new games */}
            {isAdding && (
                <DialogContent dividers>
                    <Typography variant="h6" gutterBottom>
                        Додати гру
                    </Typography>
                    <Autocomplete
                        options={rawgOptions}
                        getOptionLabel={(option) => option.name || ''}
                        value={currentGame.title ? { name: currentGame.title } : null}
                        onInputChange={handleTitleInputChange}
                        onChange={handleTitleSelection}
                        renderInput={(params) => (
                            <TextField {...params} label="Назва" variant="outlined" sx={{ mb: 2 }} required />
                        )}
                    />
                    <TextField
                        select
                        label="Платформа"
                        value={currentGame.platform}
                        onChange={(e) => handleChange('platform', e.target.value)}
                        variant="outlined"
                        fullWidth
                        sx={{ display: 'block', mb: 2 }}
                        required
                    >
                        <MenuItem value="Switch">Switch</MenuItem>
                        <MenuItem value="PS5">PS5</MenuItem>
                        <MenuItem value="PS4">PS4</MenuItem>
                        <MenuItem value="Xbox">Xbox</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Вільно для позики"
                        fullWidth
                        value={currentGame.available}
                        onChange={(e) => handleChange('available', e.target.value)}
                        variant="outlined"
                        sx={{ display: 'block', mb: 2 }}
                        required
                    >
                        <MenuItem value="yes">Так</MenuItem>
                        <MenuItem value="no">Ні</MenuItem>
                    </TextField>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            disabled={!currentGame.title || !currentGame.platform || !currentGame.available}
                            onClick={handleOk}
                        >
                            Додати
                        </Button>
                        {hasQueuedGames && (
                            <Button variant="contained" color="success" onClick={handleSave}>
                                Зберегти все
                            </Button>
                        )}
                    </Box>
                    {gamesToAdd.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">
                                Ігри що будуть додані ({gamesToAdd.length}):
                            </Typography>
                            {gamesToAdd.map((g, idx) => (
                                <Typography key={idx} variant="body2">
                                    • {g.title} ({g.platform}) — {g.available === 'yes' ? 'Available' : 'Not available'}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </DialogContent>
            )}

            <DialogActions>
                {!isAdding && (
                    <Button variant="outlined" onClick={handleClose}>
                        Закрити
                    </Button>
                )}
                {isAdding && (
                    <Button variant="outlined" color="inherit" onClick={handleClose}>
                        Відмінити
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default MyGamesModal;
