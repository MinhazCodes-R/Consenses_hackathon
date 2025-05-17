const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.options('*', cors());

// Body parser
app.use(express.json());

// PostgreSQL connection
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

// -- REGISTER --------------------------------------------------
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  try {
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4)',
      [userId, username, email, password]
    );
    res.json({ status: 'success', message: 'User registered', userId });
  } catch (err) {
    console.error('DB insert error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// -- LOGIN -----------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'SELECT id, username FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    res.json({ status: 'success', message: 'Login successful', userId: user.id, username: user.username });
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// -- WALLET LOOKUP ------------------------------------------------
// Return public/private keys for a user
app.get('/api/wallet/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT public_key, private_key FROM users WHERE id = $1',
      [userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const { public_key, private_key } = result.rows[0];
    res.json({ status: 'success', publicKey: public_key, privateKey: private_key });
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// -- LEGACY SEND ALIAS ------------------------------------------
// Keep existing front-end POST /api/send working
app.post('/api/send', (req, res, next) => {
  const { userId, destinationKey, amount, memo } = req.body;
  req.body = { sourceId: userId, destinationId: destinationKey, amount, memo };
  req.url = '/api/transactions';
  next();
});

// -- ACCOUNTS & TRANSACTIONS -----------------------------------
// Create account
app.post('/api/accounts', async (req, res) => {
  const accountId = uuidv4();
  try {
    await pool.query('INSERT INTO accounts (id, balance) VALUES ($1, 0)', [accountId]);
    res.json({ status: 'success', accountId, balance: 0 });
  } catch (err) {
    console.error('DB insert error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// Get balance
app.get('/api/accounts/:id/balance', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT balance FROM accounts WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Account not found' });
    }
    res.json({ status: 'success', balance: result.rows[0].balance });
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// Perform transaction
app.post('/api/transactions', async (req, res) => {
  const { sourceId, destinationId, amount, memo } = req.body;
  const missing = ['sourceId', 'destinationId', 'amount'].filter(k => !req.body[k]);
  if (missing.length) {
    return res.status(400).json({ status: 'error', message: `Missing params: ${missing.join(', ')}` });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const srcRes = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [sourceId]);
    if (srcRes.rowCount === 0) throw new Error('Source account not found');
    const srcBal = parseFloat(srcRes.rows[0].balance);
    const amt = parseFloat(amount);
    if (srcBal < amt) throw new Error('Insufficient funds');
    const destRes = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [destinationId]);
    if (destRes.rowCount === 0) throw new Error('Destination account not found');
    const destBal = parseFloat(destRes.rows[0].balance);
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amt, sourceId]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amt, destinationId]);
    const txId = uuidv4();
    await client.query(
      `INSERT INTO transactions (id, source_id, destination_id, amount, memo)
       VALUES ($1, $2, $3, $4, $5)`, [txId, sourceId, destinationId, amt, memo || null]
    );
    await client.query('COMMIT');
    res.json({ status: 'success', transactionId: txId, sourceBalance: srcBal - amt, destinationBalance: destBal + amt });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', err.message);
    res.status(400).json({ status: 'error', message: err.message });
  } finally {
    client.release();
  }
});

// List transactions
app.get('/api/transactions/:accountId', async (req, res) => {
  const { accountId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, source_id, destination_id, amount, memo, created_at
       FROM transactions WHERE source_id = $1 OR destination_id = $1 ORDER BY created_at DESC`,
      [accountId]
    );
    res.json({ status: 'success', transactions: result.rows });
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));