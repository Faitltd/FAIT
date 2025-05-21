# FAIT Coop Deployment Guide

This guide provides instructions for deploying the FAIT Coop platform to Google Cloud Run.

## Prerequisites

- Google Cloud account with billing enabled
- Google Cloud CLI installed and configured
- Firebase CLI installed and configured
- Node.js and npm installed
- Docker installed

## Project Structure

The FAIT Coop platform is organized as follows:

- **Main Site**: The main FAIT Coop website, deployed to the `fait-444705` Google Cloud project
- **GearGrab**: A separate component, deployed to the `fait-geargrab` Google Cloud project
- **Scrapers**: Various scrapers, deployed to the `fait-scrapers` Google Cloud project
- **Utilities**: Utility functions, deployed to the `fait-utilities` Google Cloud project

Each component is deployed as a separate Google Cloud project to ensure clean separation.

## Multi-Environment Support

The deployment is configured to support multiple environments:

- **Production**: Deployed from the `main` branch
- **Staging**: Deployed from the `staging` branch
- **Development**: Deployed from any other branch

Each environment has its own configuration file:

- `.env.production`: Production environment configuration
- `.env.staging`: Staging environment configuration

## Deployment Steps

### 1. Deploy the Main Site

The main site is deployed using GitHub Actions. When you push to the appropriate branch, the workflow in `.github/workflows/deploy-main-site.yml` will automatically deploy the site to Google Cloud Run.

- Pushing to `main` deploys to the production environment
- Pushing to `staging` deploys to the staging environment
- Pushing to any other branch deploys to the development environment

If you want to deploy manually, follow these steps:

```bash
# Set the environment
BUILD_ENV=production  # or staging or development

# Build the Docker image
docker build --build-arg BUILD_ENV=$BUILD_ENV -t gcr.io/fait-444705/fait-coop-main:latest .

# Push the Docker image to Google Container Registry
docker push gcr.io/fait-444705/fait-coop-main:latest

# Deploy to Cloud Run
gcloud run deploy fait-coop-main \
  --image gcr.io/fait-444705/fait-coop-main:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=80 \
  --timeout=300s \
  --set-env-vars="NODE_ENV=production" \
  --project fait-444705
```

### 2. Set Up Custom Domain

To set up a custom domain for your Cloud Run service, run the following script:

```bash
./scripts/setup-domain.sh
```

This script will create a domain mapping for your Cloud Run service and provide you with the DNS records that need to be created with your domain registrar.

### 3. Update Firebase Hosting

Firebase Hosting is configured to proxy requests to the Cloud Run service. To update the Firebase configuration:

```bash
# Deploy to Firebase Hosting
firebase use fait-444705
firebase deploy --only hosting:fait-coop-react
```

## Environment Variables

The application requires the following environment variables:

- `NODE_ENV`: Set to `production` for production deployments
- `SUPABASE_URL`: The URL of your Supabase instance
- `SUPABASE_KEY`: The API key for your Supabase instance

These can be set in the Cloud Run service configuration.

## Monitoring and Logging

You can monitor your Cloud Run service in the Google Cloud Console:

- **Logs**: https://console.cloud.google.com/logs/query?project=fait-444705
- **Monitoring**: https://console.cloud.google.com/monitoring?project=fait-444705
- **Cloud Run**: https://console.cloud.google.com/run?project=fait-444705

## Cleaning Up the Simple Site

After deploying the complex site, you can clean up the simple site using the provided script:

```bash
./scripts/cleanup-simple-site.sh
```

This script will:
1. Delete the simple site service from Cloud Run
2. Delete the old container images from Google Container Registry

## Troubleshooting

If you encounter issues with the deployment, check the following:

1. **Build Failures**: Check the build logs in GitHub Actions or Cloud Build
2. **Runtime Errors**: Check the Cloud Run logs
3. **Domain Issues**: Verify that the DNS records are correctly set up
4. **Environment Configuration**: Ensure the correct environment configuration is being used

## Advanced Deployment Features

### Continuous Integration

The project includes a CI workflow that runs tests and builds the application for different environments. The workflow is defined in `.github/workflows/ci.yml`.

### Canary Deployments

To perform a canary deployment (gradually rolling out changes), use the provided script:

```bash
./scripts/canary-deploy.sh <image-tag>
```

This script will:
1. Deploy a new version without sending any traffic to it
2. Gradually increase traffic to the new version (5%, 20%, 50%, 100%)
3. Monitor the deployment and allow you to control the rollout

### Rollback

If you need to rollback to a previous version, use the provided script:

```bash
./scripts/rollback.sh
```

This script will:
1. List all available revisions
2. Allow you to select a revision to rollback to
3. Update the traffic to direct 100% to the selected revision

### Security Scanning

To scan for security vulnerabilities, use the provided script:

```bash
./scripts/security-scan.sh
```

This script will:
1. Scan for npm vulnerabilities
2. Scan the Docker image for vulnerabilities
3. Display a summary of vulnerabilities
4. Save detailed results to a JSON file

### Monitoring

To monitor the deployed application, use the provided script:

```bash
./scripts/monitor-deployment.sh
```

This script will:
1. Check the health endpoint
2. Check the version endpoint
3. Get service metrics
4. Get recent logs
5. Check the domain mapping

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Supabase Documentation](https://supabase.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
