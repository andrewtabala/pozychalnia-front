// src/api/rawg.js
import axiosInstance from './axiosInstance';

/**
 * Fetch a list of games from the RAWG API via our backend proxy.
 * This endpoint is used, for example, to autocomplete game titles.
 * GET /rawg/games
 *
 * @returns {Promise<Object>} The RAWG games list data.
 */
export const fetchRawgGames = async () => {
  try {
    const response = await axiosInstance.get('/rawg/games');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch detailed information for a specific game from the RAWG API
 * via our backend proxy. This includes game titles, genres, images, etc.
 * GET /rawg/games/:id
 *
 * @param {string} gameId - The ID of the game to fetch details for.
 * @returns {Promise<Object>} The RAWG game detail data.
 */
export const fetchRawgGameDetails = async (gameId) => {
  try {
    const response = await axiosInstance.get(`/rawg/games/${gameId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchRawgTitles = async (query) => {
  try {
    const res = await axiosInstance.get(`/rawg/search?query=${encodeURIComponent(query)}`);
    // Depending on the RAWG API response structure, adjust:
    // For instance, return res.data.results if RAWG wraps the results in a "results" field.
    return res.data.results || [];
  } catch (err) {
    console.error('Error searching RAWG titles:', err);
    throw err;
  }
};
