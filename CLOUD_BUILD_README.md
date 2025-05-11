# Cloud Build Setup for FAIT Co-op Platform

This document explains how to use the Cloud Build trigger to automatically build and deploy the FAIT Co-op platform to Google Cloud Run.

## Overview

The Cloud Build trigger is configured to:
1. Build a Docker image using the `Dockerfile.cloudrun` file
2. Push the image to Google Container Registry
3. Deploy the image to Cloud Run

## Prerequisites

- Google Cloud project with Cloud Build, Container Registry, and Cloud Run APIs enabled
- GitHub repository connected to Cloud Build
- Service account with necessary permissions

## Substitution Variables

The following substitution variables are used in the Cloud Build trigger:

| Variable | Description |
|----------|-------------|
| `_VITE_SUPABASE_URL` | Supabase URL |
| `_VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `_VITE_GOOGLE_CLIENT_ID` | Google Client ID for authentication |
| `_VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `_VITE_STRIPE_PUBLIC_KEY` | Stripe public key |
| `_STRIPE_SECRET_KEY` | Stripe secret key |
| `_SUPABASE_SERVICE_KEY` | Supabase service key |
| `_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `_JWT_SECRET` | JWT secret for authentication |

## How It Works

1. When you push code to the configured branch (e.g., `main`), the trigger automatically starts a build.
2. The build process uses the `cloudbuild.yaml` file to define the build steps.
3. The Docker image is built with the environment variables passed as build arguments.
4. The image is pushed to Container Registry.
5. The image is deployed to Cloud Run.

## Security Considerations

- Sensitive values like API keys and secrets are stored as substitution variables in Cloud Build, not in the repository.
- The service account used for deployment has the minimum necessary permissions.
- The Docker build process is configured to handle environment variables securely.

## Troubleshooting

If the build fails, check the Cloud Build logs for error messages. Common issues include:

- Missing or incorrect substitution variables
- Permissions issues with the service account
- Errors in the Dockerfile or application code

## Updating the Trigger

To update the trigger configuration:

1. Go to the Cloud Build Triggers page in the Google Cloud Console
2. Find the trigger for the FAIT Co-op platform
3. Click "Edit" to modify the trigger settings
4. Update the substitution variables or other settings as needed
5. Click "Save" to apply the changes
