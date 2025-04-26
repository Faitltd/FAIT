# Deploying FAIT Co-op to Google Cloud Run

This guide provides instructions for deploying the FAIT Co-op platform to Google Cloud Run and setting up your custom domain.

## Prerequisites

- Google Cloud Platform account
- Google Cloud CLI installed and configured
- Docker installed locally
- A registered domain name
- Supabase account and project set up

## Deployment Steps

### 1. Configure Environment Variables

Edit the `deploy-to-cloudrun.sh` script and update the following variables:

```bash
# Configuration
PROJECT_ID="your-gcp-project-id"  # Replace with your actual GCP project ID
SERVICE_NAME="fait-coop"
REGION="us-central1"  # Change to your preferred region

# Environment variables - replace with your actual values
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
VITE_STRIPE_PUBLIC_KEY="your_stripe_public_key"
```

### 2. Make the Deployment Script Executable

```bash
chmod +x deploy-to-cloudrun.sh
```

### 3. Run the Deployment Script

```bash
./deploy-to-cloudrun.sh
```

This script will:
- Build a Docker image using the Cloud Run-specific Dockerfile
- Push the image to Google Container Registry
- Deploy the image to Cloud Run
- Output the URL where your service is available

### 4. Set Up Your Custom Domain

Follow the instructions in the `docs/cloudrun-domain-setup.md` file to map your custom domain to your Cloud Run service.

## Architecture

When deployed to Google Cloud Run, the FAIT Co-op platform uses the following architecture:

- **Frontend**: Static files served by Nginx
- **Backend**: Supabase for database, authentication, and storage
- **Hosting**: Google Cloud Run for containerized deployment
- **Domain**: Your custom domain with SSL provided by Google

## Important Notes

### Environment Variables

The build-time environment variables (those with the `VITE_` prefix) are embedded in the application during the Docker build process. If you need to change these variables, you'll need to rebuild and redeploy the application.

### Database Connection

This deployment assumes you're using Supabase for your database and backend services. Make sure your Supabase project is properly configured and accessible from your Cloud Run service.

### Scaling

Google Cloud Run automatically scales based on traffic. You can configure the minimum and maximum number of instances in the Google Cloud Console.

## Troubleshooting

### Deployment Issues

If you encounter issues during deployment:

1. Check the Google Cloud Build logs
2. Verify that your Docker image builds successfully locally
3. Ensure your Google Cloud account has the necessary permissions

### Domain Mapping Issues

If your custom domain isn't working:

1. Verify that your DNS records are correctly configured
2. Check the status of your SSL certificate in the Google Cloud Console
3. Ensure your domain verification is complete

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Domain Mapping](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Supabase Documentation](https://supabase.com/docs)
- [Nginx Configuration](https://nginx.org/en/docs/)

## Support

If you need additional help, please:

1. Check the documentation in the `docs/` directory
2. Review the Google Cloud Run documentation
3. Contact your system administrator or DevOps team
