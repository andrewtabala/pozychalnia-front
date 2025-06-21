// src/api/users.js
import axiosInstance from './axiosInstance';

/**
 * Fetch all users (omitting sensitive data like passwords).
 * GET /users
 *
 * @returns {Promise<Array>} An array of user objects.
 */
export const getUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTelegramContact = async (userId, telegramContact) => {
  try {
    const response = await axiosInstance.put(`/users/${userId}/update-telegram-contact`, { telegramContact });
    return response.data;
  } catch (error) {
    throw error;
  }
}


/**
 * Fetch a single user by ID (omitting sensitive data like passwords).
 * GET /users/:id
 *
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user object.
 */
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
