# FAIT Deployment Guide

This guide will help you deploy the FAIT professional services platform to GitHub and Google Cloud Run.

## Prerequisites

Before deploying, ensure you have:

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Docker](https://www.docker.com/) installed (for Cloud Run deployment)
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed (for Cloud Run deployment)
- A Google Cloud Project with billing enabled
- A GitHub account

## Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

1. Run the deployment script:
```bash
./deploy.sh
```

2. Follow the interactive prompts to:
   - Choose deployment target (GitHub, Cloud Run, or both)
   - Enter repository details
   - Configure Google Cloud settings

### Option 2: Manual Deployment

#### Deploy to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Repository name: `fait-site`
   - Description: `FAIT - Professional Services Platform`
   - Choose public or private
   - Do NOT initialize with README

2. Add the remote and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/fait-site.git
git push -u origin master
```

#### Deploy to Google Cloud Run

1. Set up Google Cloud:
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

2. Build and deploy:
```bash
# Build the application
npm run build

# Submit build to Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/fait-site

# Deploy to Cloud Run
gcloud run deploy fait-site \
  --image gcr.io/YOUR_PROJECT_ID/fait-site \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production
```

## Environment Variables

For production deployment, you may want to set these environment variables:

```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

## Custom Domain Setup

To use a custom domain with Cloud Run:

1. Map your domain:
```bash
gcloud run domain-mappings create \
  --service fait-site \
  --domain your-domain.com \
  --region us-central1
```

2. Update your DNS records as instructed by the command output.

## GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated deployment.

### Required Secrets

Add these secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `GCP_SA_KEY`: Service Account JSON key with the following roles:
  - Cloud Build Editor
  - Cloud Run Admin
  - Storage Admin

### Creating a Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --description="Service account for GitHub Actions" \
  --display-name="GitHub Actions"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Monitoring and Maintenance

### Health Checks

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "FAIT",
  "version": "1.0.0"
}
```

### Logs

View application logs:

```bash
# Cloud Run logs
gcloud logs read --service=fait-site --region=us-central1

# Follow logs in real-time
gcloud logs tail --service=fait-site --region=us-central1
```

### Scaling

Cloud Run automatically scales based on traffic. You can adjust scaling settings:

```bash
gcloud run services update fait-site \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 20 \
  --concurrency 100
```

## Troubleshooting

### Common Issues

1. **Build failures**: Check that all dependencies are properly installed
2. **Permission errors**: Ensure service account has proper IAM roles
3. **Memory issues**: Increase memory allocation in Cloud Run
4. **Cold starts**: Set minimum instances to 1 for better performance

### Getting Help

- Check the [Cloud Run documentation](https://cloud.google.com/run/docs)
- Review [SvelteKit deployment guide](https://kit.svelte.dev/docs/adapters)
- Open an issue in the GitHub repository

## Security Considerations

- Always use HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use environment variables for sensitive data
- Enable Cloud Run security features

## Cost Optimization

- Use minimum instances = 0 for development
- Set appropriate CPU and memory limits
- Monitor usage with Cloud Monitoring
- Consider using Cloud Run jobs for batch processing

---

For more detailed information, refer to the main [README.md](README.md) file.
