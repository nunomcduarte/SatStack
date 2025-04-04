# SatStack

A modern web application for Bitcoin transaction tracking and tax reporting, built with Next.js, Supabase, and TypeScript.

## 🚀 Project Overview

SatStack is a full-featured Bitcoin transaction management and tax reporting platform that helps users track their Bitcoin transactions, calculate capital gains using the FIFO method, and generate tax reports.

### Key Features

- 🔐 User authentication and profile management
- 📊 Bitcoin transaction tracking and management
- 📈 Portfolio insights and performance analytics
- 💰 FIFO-based capital gains calculation
- 📑 Tax reporting and document generation
- 🔄 Cryptocurrency price data integration
- 🌙 Dark/light mode support

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ with App Router
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Type Safety**: TypeScript
- **Payment Processing**: Stripe for subscriptions
- **Price Data**: CoinAPI integration
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **Development/Production**: Development mode option for testing

## 📋 Project Status & Roadmap

### Completed

- ✅ Project setup and configuration
- ✅ Environment variables configuration
- ✅ Authentication UI components (Login, Signup, Reset Password)
- ✅ Supabase integration and connection testing
- ✅ Dark/light mode theming
- ✅ Basic page routing and layout structure
- ✅ Development/Production mode toggle for testing

### In Progress

- 🔄 Dashboard UI development
- 🔄 Transaction management interface
- 🔄 Portfolio summary components

### Upcoming

- 📝 Supabase database schema creation
- 📝 Transaction data management (CRUD operations)
- 📝 FIFO tax calculation implementation
- 📝 Tax reporting generation
- 📝 User profile management
- 📝 Subscription tiers with Stripe
- 📝 Price data integration with CoinAPI
- 📝 Advanced data visualization
- 📝 Export functionality (CSV, PDF)

## 🏗️ Architecture

The application follows a modern architecture with:

- **Server Components**: Used for data fetching and static content
- **Client Components**: Used for interactive UI elements
- **API Routes**: For backend operations and third-party integrations
- **Server Actions**: For data mutations and form submissions
- **Middleware**: For route protection and authentication checks

### Database Schema (Planned)

```
user_profiles
  - id (UUID, PK, refs auth.users)
  - email (TEXT)
  - first_name (TEXT)
  - last_name (TEXT)
  - subscription_tier (TEXT)
  - subscription_status (TEXT)
  - stripe_customer_id (TEXT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

transactions
  - id (UUID, PK)
  - user_id (UUID, FK to auth.users)
  - type (TEXT) - buy, sell, transfer_in, transfer_out
  - date (TIMESTAMP)
  - bitcoin_amount (DECIMAL)
  - price_per_bitcoin (DECIMAL)
  - fiat_amount (DECIMAL)
  - fee_amount (DECIMAL)
  - description (TEXT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

tax_lots
  - id (UUID, PK)
  - user_id (UUID, FK to auth.users)
  - transaction_id (UUID, FK to transactions)
  - acquisition_date (TIMESTAMP)
  - bitcoin_amount (DECIMAL)
  - cost_basis_per_bitcoin (DECIMAL)
  - total_cost_basis (DECIMAL)
  - remaining_bitcoin (DECIMAL)
  - status (TEXT) - open, partial, closed
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

tax_disposals
  - id (UUID, PK)
  - user_id (UUID, FK to auth.users)
  - transaction_id (UUID, FK to transactions)
  - tax_lot_id (UUID, FK to tax_lots)
  - disposal_date (TIMESTAMP)
  - bitcoin_amount (DECIMAL)
  - proceeds (DECIMAL)
  - cost_basis (DECIMAL)
  - gain_loss (DECIMAL)
  - holding_period (TEXT) - short_term, long_term
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for production)

### Environment Setup

Create a `.env.local` file in the project root with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# CoinAPI Configuration
COINAPI_KEY=your-coinapi-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone [your-repo-url]

# Navigate to the project directory
cd satstack

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm run start
```

### Development Mode

When running in development, you can use the "Development mode" checkbox on the login and signup forms to bypass Supabase authentication. This allows for easier testing without requiring a full Supabase setup.

### Supabase Integration Testing

To test your Supabase connection, visit `/supabase-test` in your browser. This page will display whether your Supabase connection is working properly and show any environment variables that are configured.

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📝 License

MIT License - See LICENSE file for details.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
