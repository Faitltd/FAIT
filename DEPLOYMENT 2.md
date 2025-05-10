# Automatic Deployment with Cloud Build

This document explains how to set up automatic deployment to Cloud Run using Cloud Build triggers.

## Prerequisites

1. A Google Cloud Platform account with billing enabled
2. A GitHub repository connected to Cloud Build
3. The `gcloud` CLI installed and configured

## Deployment Lifecycle

```
DEV → git push main
    ↓
Cloud Build → Docker Build & Push
    ↓
Cloud Run → Auto Deploy → Live App
```

## Setup Instructions

### 1. Connect your GitHub Repository to Cloud Build

If you haven't already connected your GitHub repository to Cloud Build:

1. Go to the [Cloud Build Triggers page](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Connect Repository"
3. Select "GitHub (Cloud Build GitHub App)"
4. Follow the prompts to authenticate and select your repository

### 2. Configure Environment Variables

Make sure your `.env` file contains all the required environment variables:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_CLIENT_ID=...
VITE_STRIPE_PUBLIC_KEY=...
SUPABASE_SERVICE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

**Important**: Ensure your `.env` file is valid:
- No spaces around = signs
- No quotes unless required
- No trailing whitespace

### 3. Run the Setup Script

Edit the `setup-cloud-build-trigger.sh` script to set your:
- `PROJECT_ID`: Your Google Cloud project ID
- `REPO_NAME`: Your GitHub repository name
- `BRANCH`: The branch to trigger builds from (usually "main")

Then run the script:

```bash
chmod +x setup-cloud-build-trigger.sh
./setup-cloud-build-trigger.sh
```

This script will:
1. Enable Cloud Build and Artifact Registry APIs
2. Create your trigger
3. Inject all needed env vars from your .env

### 4. Test the Trigger

Make a change to your code, commit it, and push to your branch:

```bash
git add .
git commit -m "Activate Cloud Build deployment"
git push origin main
```

Then:
1. Watch Cloud Build pipeline run (Cloud Console > Cloud Build > Builds)
2. Cloud Run will deploy latest image
3. Your app will go live

## Testing Locally

To test your build locally before pushing:

```bash
# Build the Docker image
docker build -t gcr.io/[YOUR_PROJECT_ID]/[SERVICE_NAME] .

# Run the container locally
docker run -p 8080:8080 --env-file .env gcr.io/[YOUR_PROJECT_ID]/[SERVICE_NAME]
```

## Monitoring Builds

You can monitor your builds in the [Cloud Build History page](https://console.cloud.google.com/cloud-build/builds).

## Troubleshooting

If your build fails, check:

1. The Cloud Build logs for error messages
2. That all environment variables are correctly set in the trigger
3. That your `cloudbuild.yaml` file is correctly formatted
4. That your Dockerfile builds successfully

## Security Considerations

**Important**: Don't expose Service Role Key or JWT_SECRET in front-end code.

The environment variables are stored as substitution variables in your Cloud Build trigger. These are encrypted at rest in Google Cloud, but be aware that:

1. Anyone with access to your Google Cloud project can view these values
2. The values may appear in build logs

### Secrets Management

Consider migrating to Secret Manager for SUPABASE_SERVICE_KEY, JWT_SECRET, and STRIPE_SECRET_KEY long term.

Cloud Build supports:

```yaml
--set-secrets=SUPABASE_SERVICE_KEY=projects/.../secrets/supabase-service-key:latest
```

That keeps secrets out of source control and scripts.
