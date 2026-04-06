import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');

// Account
export const createAccount = (data) => api.post('/account/create', data);
export const getUserAccounts = () => api.get('/account');
export const getAccountBalance = (accountId) => api.get(`/account/balance/${accountId}`);

// Transactions
export const createTransaction = (data) => api.post('/transaction', data);

export default api;
