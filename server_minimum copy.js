const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;
const FLASK_API = 'http://localhost:3001';

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));
app.options('*', cors());

// Body parser
app.use(express.json());

// PostgreSQL setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'txdb',
  password: 'password',
  port: 5433,
});
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.stack);
    process.exit(1);
  }
  console.log('✅ Connected to PostgreSQL');
  release();
});

// --- USER ROUTES ---
app.post('/api/register', async (req, res) => {
  const { username, email, password, publicKey, privateKey } = req.body;
  if (!username || !email || !password || !publicKey || !privateKey) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  try {
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password, public_key, private_key) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, username, email, password, publicKey, privateKey]
    );
    res.json({ status: 'success', message: 'User registered', userId });
  } catch (err) {
    console.error('DB insert error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'SELECT id, username, public_key FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    res.json({
      status: 'success',
      message: 'Login successful',
      userId: user.id,
      username: user.username,
      publicKey: user.public_key
    });
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// --- BALANCE via Flask ---
app.get('/api/accounts/:id/balance', async (req, res) => {
  const { id } = req.params;
  try {
    const userRes = await pool.query('SELECT public_key FROM users WHERE id = $1', [id]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const { public_key } = userRes.rows[0];
    const flaskRes = await axios.post(`${FLASK_API}/check`, { public_key });
    const data = flaskRes.data;
    if (data.status === 'success') {
      return res.json({ status: 'success', balance: data.balances.native });
    }
    return res.status(400).json({ status: 'error', message: data.message });
  } catch (err) {
    console.error('Error fetching balance:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// --- TRANSFER via Flask ---
app.post('/api/send', async (req, res) => {
  const { userId, destinationKey, amount, memo } = req.body;
  if (!userId || !destinationKey || !amount) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  try {
    const srcRes = await pool.query('SELECT private_key FROM users WHERE id = $1', [userId]);
    if (srcRes.rowCount === 0) {
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
      return res.json({
        status: 'success',
        hash: data.hash,
        sourceBalance: data.source_balance,
        destinationBalance: data.destination_balance
      });
    }
    return res.status(400).json({ status: 'error', message: data.message });
  } catch (err) {
    console.error('Error performing transfer:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Transaction history not implemented
app.get('/api/transactions/:accountId', (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented' });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
