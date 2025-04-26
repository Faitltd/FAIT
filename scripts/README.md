# FAIT Co-op - Scripts

This directory contains scripts for setting up and managing the FAIT Co-op platform.

## Scripts

### `insert_fake_data.sh`

This script inserts fake data for testing the Pricing and Monetization Subsystem.

#### Usage

```bash
./scripts/insert_fake_data.sh
```

#### Prerequisites

- Docker running
- Supabase running locally

### `insert_fake_data.sql`

This SQL file contains the fake data to be inserted into the database. It is used by the `insert_fake_data.sh` script.

### `setup_stripe_products.js`

This script sets up the Stripe products and plans for the FAIT Co-op platform.

#### Usage

```bash
export STRIPE_SECRET_KEY=sk_test_your_key
node scripts/setup_stripe_products.js
```

#### Prerequisites

- Node.js installed
- Stripe CLI installed
- Stripe API key set in environment variable STRIPE_SECRET_KEY

### `setup_stripe_webhook.sh`

This script sets up the Stripe webhook for the FAIT Cooperative Platform.

#### Usage

```bash
export STRIPE_SECRET_KEY=sk_test_your_key
./scripts/setup_stripe_webhook.sh
```

#### Prerequisites

- Stripe CLI installed
- Stripe API key set in environment variable STRIPE_SECRET_KEY
- Supabase project set up and running

### `generate_admin_dashboard.js`

This script generates skeleton components for the Admin Dashboard.

#### Usage

```bash
node scripts/generate_admin_dashboard.js
```

#### Prerequisites

- Node.js installed

### `implement_dashboard_stats.js`

This script implements the DashboardStats component with actual functionality.

#### Usage

```bash
node scripts/implement_dashboard_stats.js
```

#### Prerequisites

- Node.js installed
- Admin Dashboard components generated

### `implement_admin_dashboard_page.js`

This script implements the AdminDashboardPage with actual functionality.

#### Usage

```bash
node scripts/implement_admin_dashboard_page.js
```

#### Prerequisites

- Node.js installed
- Admin Dashboard components generated

### `implement_admin_dashboard.sh`

This script orchestrates the execution of all Admin Dashboard implementation scripts.

#### Usage

```bash
./scripts/implement_admin_dashboard.sh
```

#### Prerequisites

- Node.js installed
