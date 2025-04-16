// src/api/loans.js
import axiosInstance from './axiosInstance';

/**
 * Request a new loan for a game.
 * POST /loans/request
 * Expects an object with property: gameId.
 */
export const requestLoan = async (gameId) => {
  try {
    const response = await axiosInstance.post('/loans/request', { gameId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve a loan request.
 * POST /loans/:loanId/approve
 */
export const approveLoan = async (loanId) => {
  try {
    const response = await axiosInstance.post(`/loans/${loanId}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark a loan as returned.
 * POST /loans/:loanId/return
 */
export const returnLoan = async (id) => {
  try {
    const response = await axiosInstance.post(`/loans/return/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


/**
 * Reject a loan request.
 * POST /loans/:loanId/reject
 * Optionally accepts a rejectionReason in the request body.
 */
export const rejectLoan = async (loanId, rejectionReason) => {
  try {
    const response = await axiosInstance.post(`/loans/${loanId}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieve loan notifications for the logged-in user as the Giver.
 * GET /loans/notifications
 */
export const getLoanNotifications = async () => {
  try {
    const response = await axiosInstance.get('/loans/notifications');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBorrowedGames = async () => {
  try {
    const response = await axiosInstance.get('/loans/borrowed');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get complete loan history for the logged-in user (both as taker and giver).
 * GET /loans/history
 */
export const getLoanHistory = async () => {
  try {
    const response = await axiosInstance.get('/loans/history');
    return response.data;
  } catch (error) {
    throw error;
  }
};
