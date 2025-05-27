-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL -- You should encrypt this before storing
);

-- TRANSACTIONS TABLE (Normal direct transfers)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES users(id),
  destination_id UUID REFERENCES users(id),
  amount NUMERIC NOT NULL,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACCOUNTS TABLE (Optional: could be deprecated if balance is pulled from Stellar)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY REFERENCES users(id),
  balance NUMERIC NOT NULL
);

-- ESCROW TRANSACTIONS TABLE (NEW)
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_pair TEXT NOT NULL UNIQUE,
  sender_user_id UUID NOT NULL REFERENCES users(id),
  sender_private_key TEXT NOT NULL,        -- encrypted
  escrow_public_key TEXT NOT NULL,
  escrow_private_key TEXT NOT NULL,        -- encrypted
  amount NUMERIC NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  claimed_at TIMESTAMP
);
