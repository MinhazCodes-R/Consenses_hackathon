// src/api.js
import axios from 'axios';

// Base URLs mapped to Nginx proxy
const NODE_API_URL = 'https://ran-backend-domain.shop/api';
const FLASK_API_URL = 'https://ran-backend-domain.shop/python';

const nodeApi = axios.create({
  baseURL: NODE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const flaskApi = axios.create({
  baseURL: FLASK_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────── Node backend routes ───────────────

// -- User auth --
export const register = (username, email, password, publicKey, privateKey) =>
  nodeApi.post('/register', {
    username,
    email,
    password,
    publicKey,
    privateKey,
  });

export const login = (email, password) =>
  nodeApi.post('/login', { email, password });

// -- Wallet lookup --
export const getWallet = (userId) =>
  nodeApi.get(`/wallet/${userId}`);

// -- Account management --
export const createAccount = () =>
  nodeApi.post('/accounts');

export const getBalance = (accountId) =>
  nodeApi.get(`/accounts/${accountId}/balance`);

export const getTransactions = (accountId) =>
  nodeApi.get(`/transactions/${accountId}`);

// -- Payments (legacy `/send` alias → `/transactions`) --
export const sendPayment = (sourceId, destinationId, amount, memo) =>
  nodeApi.post('/send', {
    userId: sourceId,
    destinationKey: destinationId,
    amount,
    memo,
  });

// ─────────────── Flask backend routes (example) ───────────────

// Replace with real Flask endpoints when used
export const getStellarInfo = () =>
  flaskApi.get('/stellar-info');

export default {
  nodeApi,
  flaskApi,
};
