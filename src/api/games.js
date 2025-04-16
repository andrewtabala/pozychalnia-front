// src/api/games.js
import axiosInstance from './axiosInstance';

/**
 * Get all games
 * GET /games
 */
export const getGames = async () => {
  try {
    const response = await axiosInstance.get('/games');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGameById = async (gameId) => {
  try {
    const response = await axiosInstance.get(`/games/${gameId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new game.
 * POST /games
 * Expects gameData object with properties: title, platform, condition, imageUrl.
 * The backend sets the owner from the authenticated user.
 */
export const createGame = async (gameData) => {
  try {
    const response = await axiosInstance.post('/games', gameData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a game by its id.
 * PUT /games/:id
 * Expects gameData object with any of the properties: title, platform, condition, imageUrl.
 * Only the owner is permitted to update.
 */
export const updateGame = async (gameId, gameData) => {
  try {
    const response = await axiosInstance.put(`/games/${gameId}`, gameData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a game by its id.
 * DELETE /games/:id
 * Only the owner is permitted to delete.
 */
export const deleteGame = async (gameId) => {
  try {
    const response = await axiosInstance.delete(`/games/${gameId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add multiple games at once.
 * POST /games/bulk
 * Expects an object with an array property "games" where each element is a game object.
 */
export const bulkCreateGames = async (gamesArray) => {
  try {
    const response = await axiosInstance.post('/games/bulk', { games: gamesArray });
    return response.data;
  } catch (error) {
    throw error;
  }
};
