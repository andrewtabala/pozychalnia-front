import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tab,
  Tabs,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  getLoanNotifications,
  approveLoan,
  rejectLoan,
  getLoanHistory,
} from '../api/loans';
import { getGameById } from '../api/games';
import Header from './Header';

// Helper to format date only
const formatDate = (str) => new Date(str).toLocaleDateString();

// Tab panel wrapper
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

// Fetch and render avatar from gameId
function GameAvatar({ gameId, title }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (gameId) getGameById(gameId).then(g => g.imageUrl && setSrc(g.imageUrl)).catch(console.error);
  }, [gameId]);
  return <Avatar variant="square" src={src}>{!src && title?.charAt(0)}</Avatar>;
}

export default function BorrowRequestsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState('');

  // Load incoming
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getLoanNotifications();
      setNotifications(data);
    } catch {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };
  // Load history
  const loadHistory = async () => {
    setHistLoading(true);
    try {
      const data = await getLoanHistory();
      setHistory(data);
    } catch {
      setHistError('Failed to fetch loan history.');
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);
  useEffect(() => { if (tab === 1) loadHistory(); }, [tab]);

  const handleApprove = async (id) => {
    await approveLoan(id);
    setNotifications(n => n.filter(x => x._id !== id));
  };
  const handleReject = async (id) => {
    await rejectLoan(id);
    setNotifications(n => n.filter(x => x._id !== id));
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Header page="Позики" />
      <Container sx={{ py: 2, width: "100%" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Вхідні" />
          <Tab label="Історія" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : notifications.length === 0 ? (
            <Typography>Немає вхідних запитів</Typography>
          ) : (
            <List>
              {notifications.map(n => (
                <React.Fragment key={n._id}>
                  <ListItem alignItems="flex-start" secondaryAction={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="contained" size="small" onClick={() => handleApprove(n._id)}>Прийняти</Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => handleReject(n._id)}>Відхилити</Button>
                    </Box>
                  }>
                    <ListItemAvatar>
                      <GameAvatar gameId={n.game._id} title={n.game.title} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={n.game.title}
                      secondary={
                        <>
                          <Typography variant="body2">Позичальник: {n.taker.username}</Typography>
                          <Typography variant="body2" color="text.secondary">{formatDate(n.requestDate)}</Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          {histLoading ? (
            <CircularProgress />
          ) : histError ? (
            <Typography color="error">{histError}</Typography>
          ) : history.length === 0 ? (
            <Typography>Немає історії</Typography>
          ) : (
            <List>
              {history.map(loan => (
                <React.Fragment key={loan._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <GameAvatar gameId={loan.game ? loan.game._id : "-1"} title={loan.game ? loan.game.title : "Х"} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={loan.game ? loan.game.title : "Видалена гра"}
                      secondary={
                        <>
                          <Typography variant="body2">Статус: {loan.status === "returned" ? "Повернуто" : loan.status === "approved" ? "Позичено" : loan.status === "pending" ? "Очікує" : "Відхилено"}</Typography>
                          <Typography variant="body2">Власник: {loan.giver.username}</Typography>
                          <Typography variant="body2">Позичальник: {loan.taker.username}</Typography>
                          <Typography variant="body2" color="text.secondary">Позичено: {formatDate(loan.requestDate)}</Typography>
                          {loan.returnDate && <Typography variant="body2" color="text.secondary">Повернуто: {formatDate(loan.returnDate)}</Typography>}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
      </Container>
    </Box>
  );
}