# Supabase Database Schema Setup

This document outlines the steps to set up the database schema in Supabase for SatStack.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key for your `.env.local` file

## Database Schema

### 1. Set Up Authentication

Supabase provides built-in authentication. Enable the providers you want to use:

1. Go to Authentication > Providers
2. Enable Email authentication
3. Optionally enable OAuth providers (Google, GitHub, etc.)

### 2. Create Tables

Run the following SQL in the Supabase SQL Editor to create the necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'transfer_in', 'transfer_out')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  bitcoin_amount DECIMAL NOT NULL,
  price_per_bitcoin DECIMAL,
  fiat_amount DECIMAL,
  fee_amount DECIMAL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax Lots Table (for FIFO accounting)
CREATE TABLE tax_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
  bitcoin_amount DECIMAL NOT NULL,
  cost_basis_per_bitcoin DECIMAL NOT NULL,
  total_cost_basis DECIMAL NOT NULL,
  remaining_bitcoin DECIMAL NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partial', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax Disposals Table
CREATE TABLE tax_disposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tax_lot_id UUID NOT NULL REFERENCES tax_lots(id) ON DELETE CASCADE,
  disposal_date TIMESTAMP WITH TIME ZONE NOT NULL,
  bitcoin_amount DECIMAL NOT NULL,
  proceeds DECIMAL NOT NULL,
  cost_basis DECIMAL NOT NULL,
  gain_loss DECIMAL NOT NULL,
  holding_period TEXT CHECK (holding_period IN ('short_term', 'long_term')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Set Up Row Level Security (RLS)

Run the following SQL to enable Row Level Security and set up policies:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_disposals ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Tax Lots Policies
CREATE POLICY "Users can view their own tax lots"
  ON tax_lots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax lots"
  ON tax_lots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax lots"
  ON tax_lots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax lots"
  ON tax_lots FOR DELETE
  USING (auth.uid() = user_id);

-- Tax Disposals Policies
CREATE POLICY "Users can view their own tax disposals"
  ON tax_disposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax disposals"
  ON tax_disposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax disposals"
  ON tax_disposals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax disposals"
  ON tax_disposals FOR DELETE
  USING (auth.uid() = user_id);
```

### 4. Create a User Profile Trigger

Set up a trigger to automatically create a user profile when a new user signs up:

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. (Optional) Create Indexes for Performance

```sql
-- Create indexes for common query patterns
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_tax_lots_user_id ON tax_lots(user_id);
CREATE INDEX idx_tax_lots_status ON tax_lots(status);
CREATE INDEX idx_tax_disposals_user_id ON tax_disposals(user_id);
CREATE INDEX idx_tax_disposals_disposal_date ON tax_disposals(disposal_date);
```

## Testing the Schema

After setting up the schema, you can test it by:

1. Signing up a new user in your application
2. Checking if a user profile was automatically created
3. Inserting a test transaction through the Supabase dashboard
4. Querying the transaction to ensure RLS is working correctly

## Next Steps

Once the schema is set up, you can:

1. Update your `.env.local` file with your Supabase credentials
2. Use the Supabase client in your application to interact with the database
3. Implement CRUD operations for transactions
4. Implement the FIFO tax calculation logic 