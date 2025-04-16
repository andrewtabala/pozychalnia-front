// src/pages/Login.js
import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Box, Link, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  // Toggle between login (true) and register (false) modes
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggle = () => {
    setErrorMsg('');
    setIsLogin((prev) => !prev);
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
      setErrorMsg(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password, telegramContact } = e.target.elements;
    // Optionally, you can ensure here that telegramContact.value starts with '@'
    // For example:
    const contactValue = telegramContact.value.startsWith('@')
      ? telegramContact.value
      : '@' + telegramContact.value;
    
    try {
      await registerUser({
        username: username.value,
        email: email.value,
        password: password.value,
        telegramContact: contactValue,
      });
      // Optionally, you can log the user in automatically after registration
      // or prompt the user to login instead:
      setIsLogin(true);
      setErrorMsg('Registration successful! Please log in.');
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMsg(error.response?.data?.message || 'Registration failed');
    }
  };

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
            <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
              Увійти
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
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
              Зареєструватися
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
