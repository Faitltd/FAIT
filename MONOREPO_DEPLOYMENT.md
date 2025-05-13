# FAIT Monorepo Deployment Guide

This guide explains how to deploy the FAIT monorepo applications using Docker and set up SSL certificates for subdomains.

## Prerequisites

- A server with Docker and Docker Compose installed
- Domain name with DNS configured for subdomains
- SSH access to the server

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/fait-mono.git
cd fait-mono
```

### 2. Set Up SSL Certificates

You have two options for setting up SSL certificates:

#### Option 1: Let's Encrypt (Recommended)

Run the provided script to set up SSL certificates using Let's Encrypt:

```bash
./setup-ssl.sh
```

This script will:
1. Install Certbot if not already installed
2. Request a wildcard certificate for *.fait.coop
3. Copy the certificates to the nginx/ssl directory

#### Option 2: Use Your Hosting Provider's SSL

If your hosting provider offers SSL certificates:

1. Obtain SSL certificates for your domain and subdomains
2. Place the certificate files in the `nginx/ssl` directory:
   - `nginx/ssl/fait.coop.crt` (certificate file)
   - `nginx/ssl/fait.coop.key` (private key file)

### 3. Configure Environment Variables

Create a `.env` file with the necessary environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file to include your Supabase and Stripe credentials.

### 4. Deploy with Docker Compose

Deploy all applications using Docker Compose:

```bash
docker-compose -f docker-compose.monorepo.yml up -d
```

This will:
1. Build Docker images for all applications
2. Start containers for each application
3. Set up Nginx as a reverse proxy for the subdomains

## Subdomain Configuration

The following subdomains will be available after deployment:

- `coop.fait.coop` - FAIT Coop Vue application
- `offer.fait.coop` - OfferShield application
- `score.fait.coop` - HomeHealthScore application
- `handy.fait.coop` - Handyman Calculator (While-You're-Here)
- `flipper.fait.coop` - FlipperCalc application
- `remodel.fait.coop` - Remodeling Calculator application

Make sure your DNS is configured to point these subdomains to your server's IP address.

## GitHub Actions CI/CD

This repository includes GitHub Actions workflows for continuous integration and deployment:

- `monorepo-ci.yml` - Runs tests and builds for all applications
- `deploy-fait-coop.yml` - Deploys the FAIT Coop application
- `deploy-offershield.yml` - Deploys the OfferShield application
- `deploy-all.yml` - Deploys all applications

To use these workflows, you need to set up the following GitHub secrets:

- `DOCKER_HUB_USERNAME` - Your Docker Hub username
- `DOCKER_HUB_TOKEN` - Your Docker Hub access token
- `SSH_HOST` - Your server's hostname or IP address
- `SSH_USERNAME` - Your SSH username
- `SSH_PRIVATE_KEY` - Your SSH private key

## Troubleshooting

### SSL Certificate Issues

If you encounter SSL certificate issues:

1. Check that the certificate files exist in the `nginx/ssl` directory
2. Verify that the certificate files have the correct permissions
3. Check the Nginx logs for any errors: `docker-compose logs nginx`

### Application Connectivity Issues

If applications cannot communicate with each other:

1. Make sure all services are running: `docker-compose ps`
2. Check the logs for each service: `docker-compose logs <service-name>`
3. Verify that the Docker network is properly configured

### DNS Issues

If subdomains are not resolving:

1. Verify your DNS configuration with your domain registrar
2. Check that the A records for each subdomain point to your server's IP address
3. DNS changes may take time to propagate (up to 48 hours)
