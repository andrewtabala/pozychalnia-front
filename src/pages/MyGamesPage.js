import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    IconButton,
    Button,
    TextField,
    Autocomplete,
    MenuItem,
    Toolbar,
    AppBar,
    Container,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

// API
import { getGames, bulkCreateGames, deleteGame } from '../api/games';
import { getBorrowedGames, returnLoan } from '../api/loans';
import { searchRawgTitles } from '../api/rawg';
import { getUsers } from '../api/users';
import Sidebar from '../components/Sidebar';
import GameCard from '../components/GameCard';
import Header from '../components/Header';

function renderPlatformLabel(platform) {
    switch (platform) {
        case 'Switch': return 'Nintendo Switch';
        case 'PS5': return 'PS5';
        case 'PS4': return 'PS4';
        case 'Xbox': return 'Xbox';
        default: return platform;
    }
}

export default function MyGamesPage() {
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId');

    const [games, setGames] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [gamesToAdd, setGamesToAdd] = useState([]);
    const [currentGame, setCurrentGame] = useState({ title: '', platform: '', available: 'yes', imageUrl: '' });
    const [hasQueuedGames, setHasQueuedGames] = useState(false);
    const [rawgOptions, setRawgOptions] = useState([]);
    const [usersMap, setUsersMap] = useState({});

    const getData = useCallback(async (map) => {
        const allGames = await getGames();
        let owned = allGames.filter(g => String(g.owner) === currentUserId)
            .map(g => ({
                ...g,
                borrowedByUsername: g.borrowedBy && map[g.borrowedBy]?.username,
                borrowedByTelegram: g.borrowedBy && map[g.borrowedBy]?.telegramContact,
            }));
        let loans = [];
        try { loans = await getBorrowedGames(); } catch { };
        const borrowed = loans.map(l => ({ ...l.game, borrowedByMe: true, lender: l.giver, loanId: l._id }));
        setGames([...borrowed, ...owned]);
    }, [currentUserId]);

    const loadUsers = useCallback(async () => {
        const users = await getUsers();
        const map = {};
        users.forEach(u => map[u._id] = u);
        setUsersMap(map);
        getData(map);
    }, [getData]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleAdd = () => setIsAdding(true);
    const handleCancel = () => {
        setIsAdding(false);
        setGamesToAdd([]);
        setHasQueuedGames(false);
    };
    const handleDelete = async (id) => {
        if (window.confirm('Точно видалити гру?')) { await deleteGame(id); loadUsers(); }
    }
    const handleReturn = async (id) => {
        if (window.confirm('Чи повернули гру?')) { await returnLoan(id); loadUsers(); }
    }

    const handleSearchChange = async (_, v) => {
        setCurrentGame(prev => ({ ...prev, title: v }));
        if (v?.length >= 3) {
            const opts = await searchRawgTitles(v);
            setRawgOptions(opts);
        }
    };
    const handleSelect = (_, val) => {
        if (val) setCurrentGame(prev => ({ ...prev, title: val.name, imageUrl: val.background_image }));
        else setCurrentGame(prev => ({ ...prev, title: '', imageUrl: '' }));
    };
    const handleChange = (f, v) => setCurrentGame(prev => ({ ...prev, [f]: v }));
    const handleOk = () => {
        setGamesToAdd(prev => [...prev, currentGame]);
        setHasQueuedGames(true);
        setCurrentGame({ title: '', platform: '', available: 'yes', imageUrl: '' });
        setRawgOptions([]);
    };
    const handleSave = async () => { 
        await bulkCreateGames(gamesToAdd); 
        setGamesToAdd([]); 
        setIsAdding(false);
        setHasQueuedGames(false); 
        loadUsers(); };

    const tint = g => g.borrowedByMe ? { bgcolor: 'rgba(255,0,0,0.1)' } : (!g.available ? { bgcolor: 'rgba(0,0,0,0.05)' } : {});

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <Box sx={{ width: '100%', flexGrow: 1, width: "100% !important" }}>
                <Header page="Мої ігри" />
                <Container sx={{ py: 2 }}>
                    {!isAdding ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Додати Ігри</Button>
                            </Box>
                            <Grid container spacing={2}>
                                {games.map(g => (
                                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={g._id}>
                                        <GameCard
                                            game={g}
                                            onDelete={() => handleDelete(g._id)}
                                            onReturn={() => handleReturn(g._id)}
                                            ownerMap={usersMap}
                                            usersMap={usersMap}
                                            currentUserId={currentUserId}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    ) : (
                        <Box>
                            <Typography variant="h6" gutterBottom>Додати гру</Typography>
                            <Autocomplete
                                options={rawgOptions}
                                getOptionLabel={o => o.name || ''}
                                onInputChange={handleSearchChange}
                                onChange={handleSelect}
                                renderInput={params => <TextField {...params} label="Назва" fullWidth sx={{ mb: 2 }} required />}
                            />
                            <TextField
                                select
                                label="Платформа"
                                value={currentGame.platform}
                                onChange={e => handleChange('platform', e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                required
                            >
                                {['Switch', 'PS5', 'PS4', 'Xbox'].map(v => (
                                    <MenuItem key={v} value={v}>{v}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Вільно для позики"
                                value={currentGame.available}
                                onChange={e => handleChange('available', e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                required
                            >
                                <MenuItem value="yes">Так</MenuItem>
                                <MenuItem value="no">Ні</MenuItem>
                            </TextField>
                            <Box sx={{ display: 'flex', justifyContent: "space-between", gap: 2, mb: 2 }}>
                                <Box sx={{display: "flex", gap: 2}}>
                                    <Button
                                        variant="contained"
                                        disabled={!currentGame.title || !currentGame.platform || !currentGame.available}
                                        onClick={handleOk}
                                    >
                                        Додати
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        disabled={!hasQueuedGames}
                                        onClick={handleSave}
                                    >
                                        Зберегти все
                                    </Button>
                                </Box>
                                <Button variant="outlined" onClick={handleCancel}>Відмінити</Button>
                            </Box>

                            {gamesToAdd.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1">Ігри, що будуть додані:</Typography>
                                    <List>
                                        {gamesToAdd.map((g, idx) => (
                                            <ListItem
                                                key={idx}
                                                secondaryAction={
                                                    <IconButton edge="end" onClick={() => {
                                                        setGamesToAdd(prev => prev.filter((_, i) => i !== idx));
                                                        if (gamesToAdd.length - 1 === 0) setHasQueuedGames(false);
                                                    }}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    primary={g.title}
                                                    secondary={`${renderPlatformLabel(g.platform)} — ${g.available === 'yes' ? 'Вільно' : 'Ні'}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
}
