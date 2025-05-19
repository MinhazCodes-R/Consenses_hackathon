// src/api.js
import axios from 'axios';

const API_URL = 'http://18.216.120.154:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -- User auth --
export const register = (username, email, password, publicKey, privateKey) =>
  api.post('/register', {
    username,
    email,
    password,
    publicKey,
    privateKey,
  });

export const login = (email, password) =>
  api.post('/login', { email, password });

// -- Wallet lookup --
export const getWallet = (userId) =>
  api.get(`/wallet/${userId}`);

// -- Account management --
export const createAccount = () =>
  api.post('/accounts');

export const getBalance = (accountId) =>
  api.get(`/accounts/${accountId}/balance`);

export const getTransactions = (accountId) =>
  api.get(`/transactions/${accountId}`);

// -- Payments (legacy `/send` alias → `/transactions`) --
export const sendPayment = (sourceId, destinationId, amount, memo) =>
  api.post('/send', {
    userId: sourceId,
    destinationKey: destinationId,
    amount,
    memo,
  });

export default api;
