// src/api.js
import axios from 'axios';

// Base URLs mapped to Nginx proxy
const NODE_API_URL = 'http://localhost:5001/api';
const FLASK_API_URL = 'http://localhost:3001/';

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

// -- Escrow --
export const initiateEscrow = (userId, amount) =>
  nodeApi.post('/escrow/initiate', { userId, amount });

export const claimEscrow = (userId, keywordPair) =>
  nodeApi.post('/escrow/claim', { userId, keywordPair });

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

export const getStellarInfo = () =>
  flaskApi.get('/stellar-info');

export const checkBalance = (publicKey) =>
  flaskApi.post('/check', { public_key: publicKey });

export default {
  nodeApi,
  flaskApi,
  register,
  login,
  getWallet,
  createAccount,
  getBalance,
  getTransactions,
  sendPayment,
  initiateEscrow,
  claimEscrow,
  checkBalance,
};
