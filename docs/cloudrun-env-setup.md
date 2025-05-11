# Setting Up Environment Variables for Google Cloud Run

This guide explains how to configure environment variables for your FAIT Co-op application running on Google Cloud Run.

## Environment Variables Needed

Based on your application, you'll need to set up the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Setting Environment Variables in Cloud Run

### Using Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Cloud Run
3. Select your FAIT Co-op service
4. Click on "Edit & Deploy New Revision"
5. Scroll down to the "Container, Variables & Secrets, Connections, Security" section
6. Expand the "Variables & Secrets" tab
7. Click "Add Variable"
8. Enter each environment variable name and value
9. Click "Deploy"

### Using Google Cloud CLI

You can also set environment variables using the gcloud command-line tool:

```bash
gcloud run services update fait-coop \
  --update-env-vars VITE_SUPABASE_URL=your_supabase_url,VITE_SUPABASE_ANON_KEY=your_supabase_anon_key,VITE_GOOGLE_CLIENT_ID=your_google_client_id,VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key \
  --region us-central1
```

## Using Secret Manager for Sensitive Variables

For sensitive information like API keys, it's better to use Secret Manager:

1. Create secrets in Secret Manager:
   ```bash
   echo -n "your_supabase_anon_key" | gcloud secrets create SUPABASE_ANON_KEY --data-file=-
   ```

2. Grant the Cloud Run service account access to the secret:
   ```bash
   gcloud secrets add-iam-policy-binding SUPABASE_ANON_KEY \
     --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. Reference the secret in your Cloud Run service:
   ```bash
   gcloud run services update fait-coop \
     --update-secrets=VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest \
     --region us-central1
   ```

## Environment Variables at Build Time vs. Runtime

For Vite applications, environment variables that need to be available at build time must be included in the Docker build process. Variables with the `VITE_` prefix are embedded in the application during build.

To include build-time environment variables:

1. Create a `.env.production` file with your environment variables
2. Use the `--build-arg` flag with Docker build:
   ```bash
   docker build -t gcr.io/your-project/fait-coop \
     --build-arg VITE_SUPABASE_URL=your_supabase_url \
     --build-arg VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
     -f Dockerfile.cloudrun .
   ```

3. Update the Dockerfile to use these build arguments:
   ```dockerfile
   ARG VITE_SUPABASE_URL
   ARG VITE_SUPABASE_ANON_KEY
   ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
   ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
   ```

## Testing Environment Variables

To verify that your environment variables are correctly set:

1. Deploy your service with the environment variables
2. Add a temporary endpoint or page that displays non-sensitive environment variables
3. Check the Cloud Run logs for any environment-related errors

## Troubleshooting

### Environment Variables Not Available

If your application can't access environment variables:

1. Verify that variables are correctly set in the Cloud Run configuration
2. For Vite variables, ensure they start with `VITE_` and are included at build time
3. Check that the application is correctly accessing the variables

### Secret Manager Issues

If you're having trouble with Secret Manager:

1. Verify that the service account has the correct permissions
2. Check that the secret exists and has the correct version
3. Ensure the secret is correctly referenced in the Cloud Run configuration

## Additional Resources

- [Cloud Run Environment Variables Documentation](https://cloud.google.com/run/docs/configuring/environment-variables)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
