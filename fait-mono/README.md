# FAIT Monorepo

This is a monorepo for all FAIT projects, built with [Turborepo](https://turbo.build/repo).

## What's inside?

This monorepo uses [npm](https://www.npmjs.com/) as a package manager. It includes the following packages/apps:

### Apps

- `fait-coop`: The main FAIT Cooperative Platform (Vue.js)
- `offershield`: Contractor quote risk analyzer
- `offershield-sveltekit`: SvelteKit version of the Contractor quote risk analyzer
- `home-health-score`: Live voice/chat-based home health report
- `handyman-calculator`: While-You're-Here handyman task cost estimator
- `flippercalc`: House flipping budget planner
- `flippercalc-sveltekit`: SvelteKit version of the House flipping budget planner
- `remodeling-calculator`: Scope-based remodel cost estimator

### Packages

- `ui`: A shared React UI component library
- `sveltekit-ui`: A shared SvelteKit UI component library
- `sveltekit-template`: A template for creating new SvelteKit applications
- `auth`: Shared authentication utilities using Supabase
- `config`: Shared configuration (Tailwind, ESLint, etc.)
- `utils`: Shared utility functions

### Tools

- `home-depot-scraper`: Internal data scraper for Home Depot products

## Local Development

### Prerequisites

- Node.js v20 or higher
- npm
- Docker and Docker Compose (for containerized development)
- Google Cloud SDK (for deployment)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/fait-mono.git
   cd fait-mono
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the necessary environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Build

To build all apps and packages, run the following command:

```bash
npm run build
```

## Deployment

This monorepo is configured for deployment to Google Cloud Run. For detailed deployment instructions, see the [Monorepo Deployment Guide](./MONOREPO_DEPLOYMENT_GUIDE.md).

### Quick Deployment

To deploy a specific application to Cloud Run:

```bash
# Make the deployment script executable
chmod +x scripts/deploy-to-cloudrun.sh

# Deploy a specific application to production
./scripts/deploy-to-cloudrun.sh --app=fait-coop --env=prod
```

To deploy all applications:

```bash
# Deploy all applications to production
./scripts/deploy-to-cloudrun.sh --all --env=prod
```

### Docker Compose

You can run all applications locally using Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## CI/CD Pipeline

This monorepo uses GitHub Actions for CI/CD. The workflows are defined in the `.github/workflows` directory:

- `cloud-run-deploy.yml`: Deploys applications to Google Cloud Run
- `terraform.yml`: Manages infrastructure with Terraform

## Infrastructure as Code

The infrastructure is managed using Terraform. The configuration files are in the `terraform` directory.

## React to SvelteKit Migration

This project is in the process of migrating from React to SvelteKit. The migration is being done app by app, with both versions available during the transition period.

### Migration Status

- `flippercalc`: ✅ SvelteKit version available
- `offershield`: ✅ SvelteKit version available
- `home-health-score`: 🔄 Migration in progress
- `handyman-calculator`: 🔄 Migration in progress
- `remodeling-calculator`: ⏳ Migration planned

### Migration Guide

For detailed instructions on migrating React apps to SvelteKit, see the [React to SvelteKit Migration Guide](./REACT_TO_SVELTEKIT_MIGRATION.md).

### Migration Script

A helper script is available to set up the basic structure for migrating an app:

```bash
# Make the script executable
chmod +x scripts/migrate-to-sveltekit.sh

# Run the script with the app name (without the -sveltekit suffix)
./scripts/migrate-to-sveltekit.sh flippercalc
```

## Useful Turborepo Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
