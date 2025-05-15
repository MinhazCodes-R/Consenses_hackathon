// node_key_server.mjs
// Express server using PostgreSQL to store temporary transaction sessions

import express from 'express';
import bodyParser from 'body-parser';
import { generate } from 'random-words';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'password',
  database: 'txdb'
});

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL:', err);
    process.exit(1);
  });

// POST /transaction/pay
// Expects JSON: { action: 'send', amount: number, publicKey: string, privateKey: string }
app.post('/transaction/pay', async (req, res) => {
  const { action, amount, publicKey, privateKey } = req.body;

  if (action !== 'send' || !publicKey || !privateKey || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid send transaction payload' });
  }

  const words = generate({ exactly: 2, join: '-' });
  const password = Array.isArray(words) ? words.join('-') : words;
  const expiresAt = new Date(Date.now() + 100 * 1000);

  try {
    await pool.query(
      'INSERT INTO transactions (password, action, amount, public_key, private_key, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [password, action, amount, publicKey, privateKey, expiresAt]
    );
    res.json({ password, validFor: 100 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /transaction/receive
// Requires header 'x-tx-password'
app.post('/transaction/receive', async (req, res) => {
  const pw = req.headers['x-tx-password'];
  if (!pw) return res.status(400).json({ error: 'Missing password header' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM transactions WHERE password = $1 AND expires_at > NOW()',
      [pw]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired password' });
    }

    const tx = rows[0];
    await pool.query('DELETE FROM transactions WHERE password = $1', [pw]);

    console.log(`✅ Transaction complete: ${tx.action} ${tx.amount ?? ''}`);
    res.json({ status: 'success', transaction: tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
