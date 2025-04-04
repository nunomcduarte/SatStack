# SatStack Database Schema

This document outlines the database structure for the SatStack application, implemented in Supabase.

## Tables

### user_profiles

Stores additional user information beyond the auth.users table maintained by Supabase.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- RLS policy - users can only access their own profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

### transactions

Stores Bitcoin transaction records for users.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'transfer_in', 'transfer_out', 'income', 'expense')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  bitcoin_amount NUMERIC(18, 8) NOT NULL,
  price_per_bitcoin NUMERIC(18, 2),
  fiat_amount NUMERIC(18, 2),
  exchange TEXT,
  description TEXT,
  tags TEXT[],
  tax_classification TEXT CHECK (tax_classification IN ('short_term', 'long_term', 'income', 'expense', 'none')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- RLS policy
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);
```

### tax_lots

Tracks tax lots for FIFO accounting method.

```sql
CREATE TABLE tax_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  bitcoin_amount NUMERIC(18, 8) NOT NULL,
  remaining_amount NUMERIC(18, 8) NOT NULL,
  acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cost_basis_per_bitcoin NUMERIC(18, 2) NOT NULL,
  total_cost_basis NUMERIC(18, 2) NOT NULL,
  is_fully_disposed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_tax_lots_user_id ON tax_lots(user_id);
CREATE INDEX idx_tax_lots_transaction_id ON tax_lots(transaction_id);
CREATE INDEX idx_tax_lots_acquisition_date ON tax_lots(acquisition_date);
CREATE INDEX idx_tax_lots_is_fully_disposed ON tax_lots(is_fully_disposed);

-- RLS policy
ALTER TABLE tax_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tax lots"
  ON tax_lots FOR ALL
  USING (auth.uid() = user_id);
```

### tax_disposals

Records tax disposals for FIFO accounting.

```sql
CREATE TABLE tax_disposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tax_lot_id UUID NOT NULL REFERENCES tax_lots(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE, 
  bitcoin_amount NUMERIC(18, 8) NOT NULL,
  disposal_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cost_basis NUMERIC(18, 2) NOT NULL,
  proceeds NUMERIC(18, 2) NOT NULL,
  gain_loss NUMERIC(18, 2) NOT NULL,
  holding_period_days INTEGER NOT NULL,
  is_long_term BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_tax_disposals_user_id ON tax_disposals(user_id);
CREATE INDEX idx_tax_disposals_tax_lot_id ON tax_disposals(tax_lot_id);
CREATE INDEX idx_tax_disposals_transaction_id ON tax_disposals(transaction_id);
CREATE INDEX idx_tax_disposals_disposal_date ON tax_disposals(disposal_date);
CREATE INDEX idx_tax_disposals_is_long_term ON tax_disposals(is_long_term);

-- RLS policy
ALTER TABLE tax_disposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tax disposals"
  ON tax_disposals FOR ALL
  USING (auth.uid() = user_id);
```

### price_history

Stores historical Bitcoin price data.

```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  price_usd NUMERIC(18, 2) NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_price_history_date ON price_history(date);

-- RLS policy - all authenticated users can read
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read price history"
  ON price_history FOR SELECT
  USING (auth.role() = 'authenticated');
```

### user_settings

Stores user preferences and settings.

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  default_fiat_currency TEXT DEFAULT 'USD',
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  timezone TEXT DEFAULT 'UTC',
  theme TEXT DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS policy
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = id);
```

### api_keys

Stores user API keys for exchanges and services.

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, service_name)
);

-- Index
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- RLS policy
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);
```

## Views

### portfolio_summary

Provides a summary of the user's Bitcoin portfolio.

```sql
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
  user_id,
  SUM(CASE WHEN type IN ('buy', 'transfer_in', 'income') THEN bitcoin_amount ELSE 0 END) - 
  SUM(CASE WHEN type IN ('sell', 'transfer_out', 'expense') THEN bitcoin_amount ELSE 0 END) AS current_bitcoin_balance,
  SUM(CASE WHEN type IN ('buy', 'transfer_in') THEN fiat_amount ELSE 0 END) AS total_invested,
  SUM(CASE WHEN type IN ('sell', 'transfer_out') THEN fiat_amount ELSE 0 END) AS total_withdrawn
FROM transactions
GROUP BY user_id;

-- RLS policy
ALTER VIEW portfolio_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio summary"
  ON portfolio_summary FOR SELECT
  USING (auth.uid() = user_id);
```

### tax_year_summary

Provides tax summary by year.

```sql
CREATE OR REPLACE VIEW tax_year_summary AS
SELECT 
  user_id,
  EXTRACT(YEAR FROM disposal_date) AS year,
  SUM(CASE WHEN is_long_term THEN gain_loss ELSE 0 END) AS long_term_gain_loss,
  SUM(CASE WHEN NOT is_long_term THEN gain_loss ELSE 0 END) AS short_term_gain_loss,
  SUM(gain_loss) AS total_gain_loss,
  COUNT(*) AS disposal_count
FROM tax_disposals
GROUP BY user_id, EXTRACT(YEAR FROM disposal_date);

-- RLS policy
ALTER VIEW tax_year_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax summary"
  ON tax_year_summary FOR SELECT
  USING (auth.uid() = user_id);
```

## Relationships

The database schema follows these relationships:

1. Each `user_profile` is linked to one Supabase `auth.user`
2. Each `user_profile` can have many `transactions`
3. Each `transaction` can create one or more `tax_lots` (for buys)
4. Each `transaction` can reference one or more `tax_disposals` (for sells)
5. Each `tax_lot` can be linked to multiple `tax_disposals` until fully disposed
6. Each `user_profile` has one `user_settings` record
7. Each `user_profile` can have multiple `api_keys`

## Data Flow

1. When a user registers, a trigger automatically creates a `user_profile`
2. When a user adds a Bitcoin purchase transaction, a `tax_lot` is created
3. When a user adds a Bitcoin sale transaction, the system:
   - Identifies the oldest available tax lots (FIFO method)
   - Creates `tax_disposal` records for each tax lot used
   - Updates the `remaining_amount` and `is_fully_disposed` fields on tax lots
4. Tax calculations are performed by analyzing the `tax_disposals` table

## Security

All tables have Row Level Security (RLS) policies that ensure users can only access their own data. These policies are enforced at the database level for maximum security. 