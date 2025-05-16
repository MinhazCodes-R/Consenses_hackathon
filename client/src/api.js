import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = (username, email, password) => {
  return api.post('/register', { username, email, password });
};

export const login = (email, password) => {
  return api.post('/login', { email, password });
};

export const getBalance = (publicKey) => {
  return api.get(`/balance/${publicKey}`);
};

export const getWallet = (userId) => {
  return api.get(`/wallet/${userId}`);
};

export const sendPayment = (userId, destinationKey, amount, memo) => {
  return api.post('/send', { userId, destinationKey, amount, memo });
};

export default api;
