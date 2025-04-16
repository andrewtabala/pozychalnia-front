// src/components/BorrowRequestsModal.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import { getLoanNotifications, approveLoan, rejectLoan, getLoanHistory } from '../api/loans';
import { getGameById } from '../api/games';

// Helper component for tab panels
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`borrow-tabpanel-${index}`}
      aria-labelledby={`borrow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// New helper component to fetch and display a game's image using its ID
function GameAvatar({ gameId, alt }) {
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    
    getGameById(gameId._id)
      .then((game) => {
        if (game.imageUrl) setImageUrl(game.imageUrl);
      })
      .catch((err) => {
        console.error('Error fetching game image:', err);
      });
  }, [gameId]);
  
  return (
    <Avatar variant="square" src={imageUrl || ''} alt={alt}>
      {alt && alt.charAt(0)}
    </Avatar>
  );
}

const BorrowRequestsModal = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch incoming notifications when modal opens
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getLoanNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch loan history when the History tab is selected
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getLoanHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch loan history:', err);
      setHistoryError('Failed to fetch loan history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      // When the modal opens, fetch notifications
      fetchNotifications();
    }
  }, [open]);

  // When the History tab is selected, load history.
  useEffect(() => {
    if (tabValue === 1) {
      fetchHistory();
    }
  }, [tabValue]);

  const handleApprove = async (loanId) => {
    try {
      await approveLoan(loanId);
      // Remove the approved notification from the list
      setNotifications((prev) => prev.filter((item) => item._id !== loanId));
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleReject = async (loanId) => {
    try {
      // For simplicity, we use a default rejection reason
      await rejectLoan(loanId, 'Rejected by owner');
      // Remove the rejected notification from the list
      setNotifications((prev) => prev.filter((item) => item._id !== loanId));
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  // Helper to format a date without time.
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Позики</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Borrow requests tabs">
          <Tab label="Вхідні" id="borrow-tab-0" />
          <Tab label="Історія" id="borrow-tab-1" />
        </Tabs>
        {/* Incoming Tab */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : notifications.length === 0 ? (
            <Typography>Нема вхідних позик</Typography>
          ) : (
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      {/* Use GameAvatar to fetch the game image by ID */}
                      <GameAvatar gameId={notification.game} alt={notification.game.title || 'Game'} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.game.title}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            Хто хоче позичити: {notification.taker.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(notification.requestDate)}
                          </Typography>
                        </>
                      }
                    />
                    <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="contained" color="primary" onClick={() => handleApprove(notification._id)}>
                        Прийняти
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => handleReject(notification._id)}>
                        Відхилити
                      </Button>
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
        {/* History Tab */}
        <TabPanel value={tabValue} index={1}>
          {historyLoading ? (
            <Typography>Loading history...</Typography>
          ) : historyError ? (
            <Typography color="error">{historyError}</Typography>
          ) : history.length === 0 ? (
            <Typography>No history records.</Typography>
          ) : (
            <List>
              {history.map((loan) => (
                <React.Fragment key={loan._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      {/* Use GameAvatar for history as well */}
                      <GameAvatar gameId={loan && loan.game ? loan.game : "0"} alt={loan && loan.game ? loan.game.title : 'Game'} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={loan && loan.game ? loan.game.title : "Game"}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            Статус: {loan.status === "pending" ? "Очікує" : loan.status === "approved" ? "Схвалено" : loan.status === "rejected" ? "Відхилено" : "Повернуто"}
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            Хто дає: {loan.giver.username}
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            Хто бере: {loan.taker.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Дата позики: {formatDate(loan.requestDate)}
                          </Typography>
                          {loan.returnDate && (
                            <Typography variant="body2" color="text.secondary">
                              Дата повернення: {formatDate(loan.returnDate)}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default BorrowRequestsModal;
