// src/pages/Login.js
import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Box, Link, InputAdornment, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/auth';
import { updateTelegramContact } from '../api/users';

const Login = () => {
  const navigate = useNavigate();
  // Toggle between login (true) and register (false) modes
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const [updateTgData, setUpdateTgData] = useState(false); // State to track if Telegram contact update is needed

  const handleToggle = () => {
    setErrorMsg('');
    setIsLogin((prev) => !prev);
    setRegisterStep(1); // Reset register step when toggling to login
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;

    try {
      const data = await loginUser({
        email: email.value,
        password: password.value,
      });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId); // Store user ID if needed
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.message && error.response.data.message === "Please update your Telegram data") {
        setUpdateTgData(true); // Set state to show Telegram contact step
      }
      setErrorMsg(error.response?.data?.message || 'Login failed');
    }
  };

  const handleStepChange = (e) => {
    setUpdateTgData(false);
    e.preventDefault();
    setErrorMsg(''); // Clear error message when changing steps
    handleRegister(e); // Call register function to handle the current step
  }

  const handleRegister = async (e) => {
    setUpdateTgData(false);
    e.preventDefault();
    const { username, email, password } = e.target.elements;

    try {
      const data = await registerUser({
        username: username.value,
        email: email.value,
        password: password.value,
        // telegramContact: contactValue,
      });
      setUserId(data.userId); // Store user ID for later use
      setRegisterStep(2);

      setErrorMsg('Акаунт зареєстровано! Тепер додайте контакт в телеграмі для верифікації.');
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMsg(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleAddTgContact = async (e) => {
    setUpdateTgData(false);
    e.preventDefault();
    setLoading(true);
    const { telegramContact } = e.target.elements;
    const contactValue = telegramContact.value.startsWith('@')
      ? telegramContact.value
      : '@' + telegramContact.value;
    try {
      await updateTelegramContact(userId, contactValue);
      const es = new EventSource(`${process.env.REACT_APP_API_URL}/stream/user-tg-chat`);
      es.onopen = () => console.log('✅ SSE connection opened');
      es.onerror = e => console.error('🚨 SSE error:', e);
      es.addEventListener('userChange', e => {
        const user = JSON.parse(e.data);
        if (user && user.telegramContact && user.telegramContact === contactValue) {
          if (user.telegramChatId) {
            es.close(); // Close the SSE connection after verification
            setIsLogin(true); // Switch to login mode after successful verification
            setErrorMsg('Контакт в телеграмі верифіковано! Тепер ви можете увійти.');
            setRegisterStep(1); // Reset register step
            setUserId(null); // Clear user ID

          }
        }
      });
      window.open("https://t.me/obminenka_bot", '_blank').focus();
      setLoading(false);
    }
    catch (error) {
      console.error('Error updating Telegram contact:', error);
      setErrorMsg(error.response?.data?.message || 'Сталася помилка');
      setLoading(false);
    }

  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h4" gutterBottom>
          {isLogin ? 'Увійти' : 'Зареєструватися'}
        </Typography>
        {errorMsg && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Typography>
        )}
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              margin="normal"
              required
            />
            {updateTgData ? (
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                component={Link}
                href="https://t.me/obminenka_bot"
                target="_blank"
                sx={{ mt: 2 }}
              >
                Додати контакт в телеграмі
              </Button>
            ) : null}
            <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
              Увійти
            </Button>
          </form>
        ) : registerStep === 1 ? (
          <form onSubmit={handleStepChange}>
            <TextField
              fullWidth
              label="Нікнейм"
              name="username"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              margin="normal"
              required
            />
            <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
              Зареєструватися
            </Button>
          </form>
        ) : (
          <form onSubmit={handleAddTgContact}>
            <TextField
              fullWidth
              label="Контакт в телеграмі"
              name="telegramContact"
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
            />
            <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <span>Верифікувати контакт</span>
              )}
            </Button>
          </form>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            {isLogin ? "Нема акаунту? " : 'Вже маєте акаунт? '}
            <Link component="button" variant="body2" onClick={handleToggle}>
              {isLogin ? 'Зареєструватися' : 'Увійти'}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
