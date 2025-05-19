const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const FRONTENDIP = process.env.FRONTENDIP;



const app = express();
const PORT = process.env.PORT || 5001;
const FLASK_API = 'http://flask-server:3001';


app.use(cors({
  origin: FRONTENDIP,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.options('*', cors());

app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'txdb',
  password: 'password',
  port: 5432,
});
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.stack);
    process.exit(1);
  }
  console.log('✅ Connected to PostgreSQL');
  release();
});

// --- USER REGISTRATION ---
app.post('/api/register', async (req, res) => {
  const { username, email, password, publicKey, privateKey } = req.body;
  console.log('🔐 Registering user:', username, email);

  if (!username || !email || !password || !publicKey || !privateKey) {
    console.log('❗ Missing required registration fields');
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      console.log('❗ User already exists with email:', email);
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password, public_key, private_key) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, username, email, password, publicKey, privateKey]
    );
    console.log('✅ User registered successfully:', userId);
    res.json({ status: 'success', message: 'User registered', userId });
  } catch (err) {
    console.error('❌ DB insert error during registration:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// --- USER LOGIN ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔓 Login attempt for:', email);

  if (!email || !password) {
    console.log('❗ Missing login credentials');
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, public_key FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      console.log('❗ Invalid credentials for:', email);
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('✅ Login successful:', user.id);
    res.json({
      status: 'success',
      message: 'Login successful',
      userId: user.id,
      username: user.username,
      publicKey: user.public_key
    });
  } catch (err) {
    console.error('❌ DB query error during login:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// --- BALANCE CHECK ---
app.get('/api/accounts/:id/balance', async (req, res) => {
  const { id } = req.params;
  console.log('💰 Fetching balance for userId:', id);

  try {
    const userRes = await pool.query('SELECT public_key FROM users WHERE id = $1', [id]);
    if (userRes.rowCount === 0) {
      console.log('❗ User not found for balance:', id);
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { public_key } = userRes.rows[0];
    const flaskRes = await axios.post(`${FLASK_API}/check`, { public_key });
    const data = flaskRes.data;

    if (data.status === 'success') {
      console.log('✅ Balance fetch successful for:', public_key);
      return res.json({ status: 'success', balance: data.balances.native });
    }

    console.log('❌ Flask responded with error for balance check');
    return res.status(400).json({ status: 'error', message: data.message });
  } catch (err) {
    console.error('❌ Error fetching balance:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// --- TRANSFER MONEY ---
app.post('/api/send', async (req, res) => {
  const { userId, destinationKey, amount, memo } = req.body;
  console.log('📤 Transfer initiated by user:', userId);

  if (!userId || !destinationKey || !amount) {
    console.log('❗ Missing transfer fields');
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    const srcRes = await pool.query('SELECT private_key FROM users WHERE id = $1', [userId]);
    if (srcRes.rowCount === 0) {
      console.log('❗ Sender not found:', userId);
      return res.status(404).json({ status: 'error', message: 'Sender account not found' });
    }

    const source_secret = srcRes.rows[0].private_key;
    const destination_public_key = destinationKey;

    const flaskRes = await axios.post(`${FLASK_API}/send`, {
      source_secret,
      destination_public_key,
      amount,
      memo
    });

    const data = flaskRes.data;

    if (data.status === 'success') {
      console.log('✅ Transfer completed successfully. Hash:', data.hash);
      return res.json({
        status: 'success',
        hash: data.hash,
        sourceBalance: data.source_balance,
        destinationBalance: data.destination_balance
      });
    }

    console.log('❌ Transfer failed at Flask layer');
    return res.status(400).json({ status: 'error', message: data.message });
  } catch (err) {
    console.error('❌ Error performing transfer:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// --- WALLET LOOKUP ---
app.get('/api/wallet/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('🔎 Wallet lookup for:', userId);

  try {
    const result = await pool.query(
      'SELECT public_key, private_key FROM users WHERE id = $1',
      [userId]
    );
    if (result.rowCount === 0) {
      console.log('❗ No wallet found for user:', userId);
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { public_key, private_key } = result.rows[0];
    console.log('✅ Wallet retrieved:', public_key);
    return res.json({
      status: 'success',
      publicKey: public_key,
      privateKey: private_key,
    });
  } catch (err) {
    console.error('❌ Error fetching wallet:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// --- Transaction History ---
app.get('/api/transactions/:accountId', (req, res) => {
  console.log('📜 Transaction history not implemented yet');
  res.status(501).json({ status: 'error', message: 'Not implemented' });
});

// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
