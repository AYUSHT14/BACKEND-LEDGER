import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-ledger-production.up.railway.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject Authorization token from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('nexapay_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);
export const logoutUser   = ()     => api.post('/auth/logout');

// Account
export const createAccount      = (data)      => api.post('/account/create', data);
export const getUserAccounts    = ()           => api.get('/account');
export const getAccountBalance  = (accountId) => api.get(`/account/balance/${accountId}`);
export const depositFunds       = (data)      => api.post('/account/deposit', data);
export const deleteAccount      = (accountId) => api.delete(`/account/${accountId}`);


// Transactions
export const createTransaction      = (data)   => api.post('/transaction', data);
export const getUserTransactions    = (params) => api.get('/transaction', { params });

export default api;
