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
