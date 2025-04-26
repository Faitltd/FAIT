# FAIT Co-op

This is the FAIT Co-op platform, a cooperative marketplace connecting clients with service agents.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

### Development

```bash
# Start development server with Vite
npm run dev

# Start development server (simple mode) with Vite
npm run dev:simple

# Start development server with Webpack
npm run webpack:dev
```

### Build

```bash
# Build for production with Vite
npm run build

# Build simple version with Vite
npm run build:simple

# Build for production with Webpack
npm run webpack:build

# Build for production with Webpack and analyze the bundle
npm run webpack:analyze
```

### Bundler Comparison

```bash
# Compare Vite and Webpack builds
./compare-builds.sh

# Switch between bundlers for development
./switch-bundler.sh vite    # Use Vite
./switch-bundler.sh webpack # Use Webpack
```

### Database Management

```bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore

# Apply migrations
npm run db:migrate
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Test OAuth integration
npm run test:oauth
```

## Features

- User authentication (email/password and Google OAuth)
- Client and service agent profiles
- Service booking system
- Service agent verification
- Admin dashboard
- Points and rewards system
- Governance and voting
- Subscription Management
  - Tiered subscription plans
  - Feature unlocks based on tier
  - Service limits per subscription
  - Featured listings for premium tiers

## Tech Stack

- React 18
- TypeScript
- Vite & Webpack (dual bundler support)
- Supabase (Auth, Database, Storage, Edge Functions)
- Tailwind CSS
- Stripe (Subscription Billing)

## Project Structure

```
├── docs/                 # Documentation
├── migrations/          # Database migrations
├── public/              # Static assets
├── scripts/             # Utility scripts
├── src/                 # Source code
│   ├── api/            # API integration
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Application pages
│   └── utils/          # Helper utilities
└── supabase/           # Supabase configuration
```

## Database Migrations

All database migrations are consolidated in `essential_migrations.sql`. This includes:
- Base tables setup (messages, subscriptions)
- Profile enhancements
- Service agent portfolio system
- Warranty claims system
- Work history tracking
- References management
- Subscription management
- Security policies (RLS)

## Configuration

### Vite Configuration
The project uses a Vite configuration file (`vite.config.ts`) that supports different modes:
- Default mode: Standard development/production setup
- Simple mode: Lightweight version with minimal features

### Webpack Configuration
The project also includes a Webpack configuration file (`webpack.config.js`) that provides:
- Production-ready bundling
- Bundle analysis
- Code splitting
- Asset optimization

For more details on the Webpack integration, see [WEBPACK_INTEGRATION.md](WEBPACK_INTEGRATION.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
