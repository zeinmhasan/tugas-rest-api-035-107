CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  note TEXT NOT NULL,
  tx_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
