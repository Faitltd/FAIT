# FAIT Monorepo Deployment Guide

This guide explains how to deploy the FAIT monorepo applications to Google Cloud Run.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Manual Deployment](#manual-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Infrastructure as Code](#infrastructure-as-code)
- [Environment Variables](#environment-variables)
- [SSL Certificates](#ssl-certificates)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Google Cloud Platform account with billing enabled
- Google Cloud SDK installed and configured
- Docker installed
- Node.js v20 or higher
- Git
- Access to the FAIT GitHub repository

## Local Development

### Setting Up the Development Environment

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

### Testing with Docker Compose

You can test the entire monorepo locally using Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Manual Deployment

### Deploying a Single Application

To deploy a single application to Cloud Run:

```bash
# Make the deployment script executable
chmod +x scripts/deploy-to-cloudrun.sh

# Deploy a specific application to production
./scripts/deploy-to-cloudrun.sh --app=fait-coop --env=prod

# Deploy a specific application to staging
./scripts/deploy-to-cloudrun.sh --app=fait-coop --env=staging
```

### Deploying All Applications

To deploy all applications to Cloud Run:

```bash
# Deploy all applications to production
./scripts/deploy-to-cloudrun.sh --all --env=prod

# Deploy all applications to staging
./scripts/deploy-to-cloudrun.sh --all --env=staging
```

## CI/CD Pipeline

We use GitHub Actions for continuous integration and deployment.

### Workflow Files

- `.github/workflows/cloud-run-deploy.yml`: Main CI/CD pipeline for building, testing, and deploying applications to Cloud Run

### Triggering Deployments

- Push to `develop` branch: Automatically deploys to staging
- Push to `main` branch: Automatically deploys to production
- Manual trigger: Can be used to deploy specific applications to staging or production

### GitHub Secrets

The following secrets need to be configured in the GitHub repository:

- `GCP_PROJECT_ID`: Google Cloud project ID
- `GCP_SA_KEY`: Google Cloud service account key (JSON)
- `TURBO_TOKEN`: Turborepo token for caching
- `TURBO_TEAM`: Turborepo team name

## Infrastructure as Code

We use Terraform to manage the infrastructure for the FAIT monorepo.

### Terraform Modules

- `cloud-run`: Module for deploying applications to Cloud Run

### Managing Infrastructure

You can manage the infrastructure using the following commands:

```bash
# Initialize Terraform
cd terraform/environments/[ENVIRONMENT]
terraform init

# Plan changes
terraform plan -var-file=terraform.tfvars

# Apply changes
terraform apply -var-file=terraform.tfvars

# Destroy infrastructure
terraform destroy -var-file=terraform.tfvars
```

### Terraform Variables

Create a `terraform.tfvars` file in each environment directory with the following variables:

```hcl
supabase_url           = "your_supabase_url"
supabase_anon_key      = "your_supabase_anon_key"
stripe_publishable_key = "your_stripe_publishable_key"
stripe_secret_key      = "your_stripe_secret_key"
google_client_id       = "your_google_client_id"
jwt_secret             = "your_jwt_secret"
```

## Environment Variables

### Required Environment Variables

Each application requires specific environment variables:

- **FAIT Coop**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GOOGLE_CLIENT_ID`
  - `VITE_STRIPE_PUBLIC_KEY`

- **OfferShield**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`

- **HomeHealthScore**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Setting Environment Variables in Cloud Run

You can set environment variables in Cloud Run using the Google Cloud Console or the gcloud CLI:

```bash
gcloud run services update [SERVICE_NAME] \
  --update-env-vars KEY1=VALUE1,KEY2=VALUE2 \
  --region [REGION]
```

## SSL Certificates

We use Google-managed SSL certificates for our domains.

### Setting Up Custom Domains

1. Verify domain ownership in Google Cloud Console
2. Map the domain to the Cloud Run service
3. Configure DNS records to point to the Cloud Run service

## Monitoring and Logging

### Cloud Run Monitoring

You can monitor your Cloud Run services in the Google Cloud Console:

1. Go to the Cloud Run section
2. Select your service
3. Click on the "Metrics" tab

### Cloud Logging

You can view logs for your Cloud Run services in the Google Cloud Console:

1. Go to the Cloud Run section
2. Select your service
3. Click on the "Logs" tab

## Troubleshooting

### Common Issues

- **Deployment Failures**: Check the deployment logs in GitHub Actions or the Google Cloud Console
- **Application Errors**: Check the application logs in Cloud Logging
- **Environment Variables**: Verify that all required environment variables are set correctly
- **Custom Domains**: Ensure that DNS records are configured correctly

### Getting Help

If you encounter any issues, please contact the DevOps team or create an issue in the GitHub repository.
