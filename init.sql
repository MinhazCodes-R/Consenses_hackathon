CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT,
  email TEXT,
  password TEXT,
  public_key TEXT,
  private_key TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  source_id UUID,
  destination_id UUID,
  amount NUMERIC,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY,
  balance NUMERIC
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id SERIAL PRIMARY KEY,
  keyword_pair TEXT UNIQUE NOT NULL,
  sender_user_id UUID REFERENCES users(id),
  sender_private_key TEXT NOT NULL,
  escrow_public_key TEXT NOT NULL,
  escrow_private_key TEXT NOT NULL,
  amount NUMERIC(16, 7) NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP
);
