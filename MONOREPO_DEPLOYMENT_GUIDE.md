# FAIT Monorepo Deployment Guide

This guide explains how to deploy the FAIT monorepo applications to different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment](#development-environment)
- [Staging Environment](#staging-environment)
- [Production Environment](#production-environment)
- [CI/CD Pipeline](#cicd-pipeline)
- [SSL Certificates](#ssl-certificates)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Restore](#backup-and-restore)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker and Docker Compose installed
- Node.js v16 or higher
- Git
- Access to the FAIT GitHub repository
- Access to the Docker Hub repository
- SSH access to the staging and production servers

## Development Environment

The development environment is designed for local development and testing.

### Starting the Development Environment

We provide a convenient script to start the development environment:

```bash
# Start all applications
./dev.sh

# Build and start all applications
./dev.sh -b

# Start a specific application
./dev.sh fait-coop

# Clean and start all applications
./dev.sh -c
```

### Accessing the Applications

The applications are available at the following URLs:

- Main: http://localhost
- FAIT Coop: http://coop.localhost
- OfferShield: http://offer.localhost
- HomeHealthScore: http://score.localhost
- Handyman Calculator: http://handy.localhost
- FlipperCalc: http://flipper.localhost
- Remodeling Calculator: http://remodel.localhost

### Viewing Logs

```bash
# View logs for all applications
docker-compose -f docker-compose.development.yml logs -f

# View logs for a specific application
docker-compose -f docker-compose.development.yml logs -f fait-coop
```

### Stopping the Development Environment

```bash
docker-compose -f docker-compose.development.yml down
```

## Staging Environment

The staging environment is used for testing before deploying to production.

### Deploying to Staging

```bash
# Deploy all applications to staging
TAG=latest docker-compose -f docker-compose.staging.yml up -d

# Deploy a specific version to staging
TAG=v1.0.0 docker-compose -f docker-compose.staging.yml up -d

# Deploy a specific application to staging
TAG=latest docker-compose -f docker-compose.staging.yml up -d fait-coop
```

### Accessing the Staging Applications

The applications are available at the following URLs:

- FAIT Coop: https://coop.staging.fait.coop
- OfferShield: https://offer.staging.fait.coop
- HomeHealthScore: https://score.staging.fait.coop
- Handyman Calculator: https://handy.staging.fait.coop
- FlipperCalc: https://flipper.staging.fait.coop
- Remodeling Calculator: https://remodel.staging.fait.coop

## Production Environment

The production environment is the live environment used by customers.

### Deploying to Production

```bash
# Deploy all applications to production
TAG=v1.0.0 docker-compose -f docker-compose.production.yml up -d

# Deploy a specific application to production
TAG=v1.0.0 docker-compose -f docker-compose.production.yml up -d fait-coop
```

### Accessing the Production Applications

The applications are available at the following URLs:

- FAIT Coop: https://coop.fait.coop
- OfferShield: https://offer.fait.coop
- HomeHealthScore: https://score.fait.coop
- Handyman Calculator: https://handy.fait.coop
- FlipperCalc: https://flipper.fait.coop
- Remodeling Calculator: https://remodel.fait.coop

## CI/CD Pipeline

We use GitHub Actions for continuous integration and deployment.

### Workflow Files

- `.github/workflows/ci-cd.yml`: Main CI/CD pipeline for building, testing, and deploying applications

### Triggering Deployments

- Push to `develop` branch: Automatically deploys to staging
- Push to `main` branch: Automatically deploys to production
- Manual trigger: Can be used to deploy specific applications to production

### GitHub Secrets

The following secrets need to be configured in the GitHub repository:

- `DOCKER_HUB_USERNAME`: Docker Hub username
- `DOCKER_HUB_TOKEN`: Docker Hub access token
- `STAGING_SSH_HOST`: Staging server hostname
- `STAGING_SSH_USERNAME`: Staging server username
- `STAGING_SSH_PRIVATE_KEY`: Staging server SSH private key
- `PRODUCTION_SSH_HOST`: Production server hostname
- `PRODUCTION_SSH_USERNAME`: Production server username
- `PRODUCTION_SSH_PRIVATE_KEY`: Production server SSH private key
- `TURBO_TOKEN`: Turborepo token for caching
- `TURBO_TEAM`: Turborepo team name

## SSL Certificates

We use Let's Encrypt for SSL certificates.

### Setting Up SSL Certificates

```bash
# Set up SSL certificates
./setup-ssl.sh
```

### Renewing SSL Certificates

SSL certificates are automatically renewed by a cron job that runs weekly.

## Monitoring and Logging

We use Prometheus, Grafana, Loki, and Promtail for monitoring and logging.

### Accessing Monitoring Dashboards

- Grafana: https://grafana.fait.coop
- Prometheus: https://prometheus.fait.coop

### Viewing Logs

Logs can be viewed in the Grafana dashboard under the "Explore" section by selecting the Loki data source.

## Backup and Restore

We provide a script for backing up the monorepo.

### Creating a Backup

```bash
# Create a backup manually
./backup.sh
```

### Automated Backups

Backups are automatically created by a cron job that runs daily.

### Restoring from a Backup

```bash
# Restore from a backup
tar -xzf backups/fait_backup_YYYYMMDD_HHMMSS.tar.gz -C /path/to/restore
```

## Troubleshooting

### Common Issues

#### Docker Containers Not Starting

```bash
# Check the status of the containers
docker-compose -f docker-compose.production.yml ps

# View the logs
docker-compose -f docker-compose.production.yml logs -f
```

#### SSL Certificate Issues

```bash
# Check the Nginx logs
docker-compose -f docker-compose.production.yml logs -f nginx

# Manually renew the certificates
./setup-ssl.sh
```

#### Application Not Responding

```bash
# Restart the application
docker-compose -f docker-compose.production.yml restart fait-coop

# Check the application logs
docker-compose -f docker-compose.production.yml logs -f fait-coop
```
