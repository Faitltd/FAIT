# FAIT Co-op Deployment Guide

This guide provides step-by-step instructions to fix the build pipeline and deploy the FAIT Co-op application to Google Cloud Run.

## Prerequisites

- Docker installed locally
- Google Cloud SDK (gcloud) installed and configured
- Access to the Google Cloud project `fait-444705`
- Git repository cloned locally

## Step 1: Fix the Dockerfile

The current build is failing because of issues with the nginx configuration. We've created a simplified Dockerfile (`Dockerfile.simple`) that will work reliably.

## Step 2: Manual Build and Deployment

You can either use the provided `deploy.sh` script or follow these manual steps:

### Option 1: Using the deploy.sh script

1. Make the script executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the script:
   ```bash
   ./deploy.sh
   ```

### Option 2: Manual steps

1. Build the Docker image:
   ```bash
   docker build -t gcr.io/fait-444705/fait-coop:latest -f Dockerfile.simple .
   ```

2. Push the image to Google Container Registry:
   ```bash
   docker push gcr.io/fait-444705/fait-coop:latest
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy fait-coop \
     --image gcr.io/fait-444705/fait-coop:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. Map the domain using the beta command:
   ```bash
   gcloud beta run domain-mappings create \
     --service fait-coop \
     --domain app.itsfait.com \
     --platform managed \
     --region us-central1
   ```

5. Check domain mapping status:
   ```bash
   gcloud beta run domain-mappings list \
     --filter="DOMAIN=app.itsfait.com" \
     --format="json"
   ```

## Step 3: Verify Deployment

1. Check the Cloud Run service status:
   ```bash
   gcloud run services describe fait-coop --region us-central1
   ```

2. Once the domain mapping is complete and the SSL certificate is issued, your application should be accessible at:
   ```
   https://app.itsfait.com
   ```

## Troubleshooting

### If the build fails:
- Check the Docker build logs for specific errors
- Ensure all required files are present in the repository
- Verify that the environment variables are correctly set

### If the deployment fails:
- Check the Cloud Run deployment logs
- Ensure you have the necessary permissions in the Google Cloud project
- Verify that the container image was successfully pushed to the registry

### If the domain mapping fails:
- Ensure DNS records are correctly configured for your domain
- Verify that you're using the beta command for domain mapping
- Check if there are any existing domain mappings that need to be removed first

## Next Steps

After successful deployment, you should:

1. Set up continuous deployment using Cloud Build
2. Create a proper nginx.conf file for production use
3. Configure environment variables in Cloud Run instead of building them into the image
4. Set up monitoring and logging for the application
