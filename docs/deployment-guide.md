# FAIT Co-op Deployment Guide

This guide provides instructions for deploying the FAIT Co-op platform to production.

## Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Supabase account
- Stripe account
- Vercel account (recommended for hosting)
- GitHub account (for version control)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fait-coop.git
cd fait-coop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

For production, you'll need to set these environment variables in your hosting platform (e.g., Vercel).

## Database Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Note your project URL and anon key for the environment variables

### 2. Apply Database Migrations

```bash
npx supabase link --project-ref your_project_ref
npx supabase db push
```

Alternatively, you can run the migrations manually in the Supabase SQL editor:

1. Go to the SQL editor in the Supabase dashboard
2. Copy the contents of each migration file in the `supabase/migrations` directory
3. Run the SQL commands in order

### 3. Set Up Authentication

1. Go to the Authentication settings in the Supabase dashboard
2. Enable Email/Password authentication
3. Configure Google OAuth if needed

### 4. Configure Email

For password reset functionality:

1. Go to the Authentication > Email Templates section in the Supabase dashboard
2. Customize the password reset email template
3. Set up SMTP settings for production emails

## Stripe Integration

### 1. Create Stripe Products and Plans

```bash
export STRIPE_SECRET_KEY=your_stripe_secret_key
node scripts/setup_stripe_products.js
```

### 2. Set Up Stripe Webhook

```bash
./scripts/setup_stripe_webhook.sh
```

### 3. Configure Stripe Environment Variables

In your Supabase project:

1. Go to Settings > API
2. Add the following environment variables:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: The webhook secret from the setup script
   - `STRIPE_PRICE_*`: The price IDs for each subscription tier

## Deployment

### Deploying to Vercel (Recommended)

1. Push your code to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push
```

2. Create a Vercel account and connect it to your GitHub repository

3. Configure environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_STRIPE_PUBLIC_KEY`

4. Deploy your project:

```bash
vercel
```

Or deploy directly from the Vercel dashboard.

### Deploying to Netlify

1. Create a `netlify.toml` file in the root directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "supabase/functions"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Push your code to GitHub

3. Create a Netlify account and connect it to your GitHub repository

4. Configure environment variables in Netlify

5. Deploy your project

## Post-Deployment Tasks

### 1. Set Up Domain

1. Purchase a domain name if you don't have one
2. Configure the domain in your hosting platform (Vercel or Netlify)
3. Update DNS settings with your domain registrar

### 2. Configure SSL

SSL should be automatically configured by Vercel or Netlify. If not:

1. Go to your hosting platform's SSL settings
2. Enable SSL
3. Choose automatic certificate management

### 3. Test the Deployment

1. Test user registration and login
2. Test the booking flow
3. Test the payment process
4. Test the messaging system
5. Test the subscription management

### 4. Set Up Monitoring

1. Set up error monitoring with a service like Sentry
2. Configure performance monitoring
3. Set up alerts for critical errors

### 5. Set Up Backups

1. Configure regular database backups in Supabase
2. Set up a backup schedule
3. Test the backup and restore process

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions

1. Create a `.github/workflows/ci.yml` file:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run build --if-present
    - name: Archive production artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist
```

2. Create a `.github/workflows/test-migrations.yml` file:

```yaml
name: Test Database Migrations

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'

jobs:
  test-migrations:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Run migrations
        run: |
          cd supabase
          for file in migrations/*.sql; do
            PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -f "$file"
          done
```

## Scaling Considerations

### Database Scaling

1. Monitor database performance
2. Consider upgrading your Supabase plan as your user base grows
3. Implement caching for frequently accessed data

### Application Scaling

1. Implement code splitting for better bundle size
2. Use CDN for static assets
3. Optimize API calls
4. Implement rate limiting

### Cost Management

1. Monitor usage of paid services
2. Set up billing alerts
3. Optimize resource usage

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   - Check Supabase authentication settings
   - Verify environment variables

2. **Database Connection Issues**
   - Check Supabase connection string
   - Verify RLS policies

3. **Payment Processing Issues**
   - Check Stripe configuration
   - Verify webhook setup

### Getting Help

If you encounter issues, check the following resources:

1. [Supabase Documentation](https://supabase.com/docs)
2. [Stripe Documentation](https://stripe.com/docs)
3. [Vercel Documentation](https://vercel.com/docs)
4. [Project GitHub Issues](https://github.com/yourusername/fait-coop-platform/issues)
