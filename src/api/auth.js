// src/api/auth.js
import axiosInstance from './axiosInstance';

/**
 * Register a new user.
 * Sends a POST request to /auth/register with the user details.
 *
 * @param {Object} userData - An object containing username, email, password, and telegramContact.
 * @returns {Promise<Object>} Response data from the backend.
 */
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
/**
 * Log in a user.
 * Sends a POST request to /auth/login with the user's email and password.
 *
 * @param {Object} credentials - An object containing email and password.
 * @returns {Promise<Object>} Response data from the backend (including the JWT token).
 */
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};
