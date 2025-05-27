const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { generateKeywordPair, generateEscrowKeypair } = require('./utils');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const FLASK_API = process.env.FLASK_API || 'http://flask-server:3001';

app.use(cors({
  origin: ['http://localhost:3000', 'https://consenses-hackathon-zt67.vercel.app'],
  credentials: true,
}));

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.stack);
    process.exit(1);
  }
  console.log('✅ Connected to PostgreSQL');
  release();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Node server running' });
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, publicKey, privateKey } = req.body;

  if (!username || !email || !password || !publicKey || !privateKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password, public_key, private_key) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, username, email, password, publicKey, privateKey]
    );

    res.json({ status: 'success', userId });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, public_key FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    res.json({ status: 'success', userId: user.id, username: user.username, publicKey: user.public_key });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/wallet/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT public_key, private_key FROM users WHERE id = $1',
      [userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    const { public_key, private_key } = result.rows[0];
    res.json({ status: 'success', publicKey: public_key, privateKey: private_key });
  } catch (err) {
    console.error('❌ Wallet lookup failed:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/escrow/initiate', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: 'Missing userId or amount' });

  try {
    const user = await pool.query('SELECT private_key FROM users WHERE id = $1', [userId]);
    if (user.rowCount === 0) return res.status(404).json({ error: 'User not found' });

    const senderPrivateKey = user.rows[0].private_key;
    const keywordPair = generateKeywordPair();
    const { publicKey: escrowPublicKey, secretKey: escrowPrivateKey } = await generateEscrowKeypair();

    // ✅ Fund the escrow account first so it exists on testnet
    await axios.get(`https://friendbot.stellar.org?addr=${escrowPublicKey}`);

    const sendToEscrow = await axios.post(`${FLASK_API}/send`, {
      source_secret: senderPrivateKey,
      destination_public_key: escrowPublicKey,
      amount,
      memo: `escrow-${keywordPair}`
    });

    if (sendToEscrow.data.status !== 'success') {
      return res.status(500).json({ error: 'Failed to send to escrow' });
    }

    await pool.query(
      `INSERT INTO escrow_transactions (keyword_pair, sender_user_id, sender_private_key, escrow_public_key, escrow_private_key, amount)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [keywordPair, userId, senderPrivateKey, escrowPublicKey, escrowPrivateKey, amount]
    );

    res.json({ status: 'success', keywordPair, escrowPublicKey });
  } catch (err) {
    console.error('❌ Escrow initiation failed:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/escrow/claim', async (req, res) => {
  const { userId, keywordPair } = req.body;
  if (!userId || !keywordPair) return res.status(400).json({ error: 'Missing userId or keywordPair' });

  try {
    const escrow = await pool.query(
      'SELECT * FROM escrow_transactions WHERE keyword_pair = $1 AND claimed = FALSE',
      [keywordPair]
    );
    if (escrow.rowCount === 0) return res.status(404).json({ error: 'No unclaimed escrow found' });

    const { escrow_private_key, amount } = escrow.rows[0];
    const receiver = await pool.query('SELECT public_key FROM users WHERE id = $1', [userId]);
    if (receiver.rowCount === 0) return res.status(404).json({ error: 'Receiver not found' });

    const receiverPublicKey = receiver.rows[0].public_key;
    const sendToReceiver = await axios.post(`${FLASK_API}/send`, {
      source_secret: escrow_private_key,
      destination_public_key: receiverPublicKey,
      amount,
      memo: `claim-${keywordPair}`
    });

    if (sendToReceiver.data.status !== 'success') {
      return res.status(500).json({ error: 'Failed to send from escrow' });
    }

    await pool.query(
      'UPDATE escrow_transactions SET claimed = TRUE, claimed_at = CURRENT_TIMESTAMP WHERE keyword_pair = $1',
      [keywordPair]
    );

    res.json({ status: 'success', hash: sendToReceiver.data.hash });
  } catch (err) {
    console.error('❌ Claim failed:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));