const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // Automatically parses JSON from requests

// PostgreSQL connection config
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'txdb',
  password: 'password',
  port: 5433,
});

// Confirm DB connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Failed to connect to PostgreSQL:', err.stack);
  }
  console.log('✅ Connected to PostgreSQL');
  release();
});

// ✅ Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('\n--- POST /api/register ---');
  console.log('Parsed body:', req.body);

  if (!username || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, email, password, username) VALUES ($1, $2, $3, $4)',
      [userId, email, password, username]
    );

    res.json({ status: 'success', message: 'User registered', userId });
  } catch (err) {
    console.error('DB insert error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// ✅ Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('\n--- POST /api/login ---');
  console.log('Parsed body:', req.body);

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
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
    });
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
