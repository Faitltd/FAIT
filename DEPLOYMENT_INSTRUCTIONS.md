# FAIT Co-op Deployment Instructions

This document provides instructions for deploying the FAIT Co-op platform to Google Cloud Run and setting up your custom domain.

## Prerequisites

- Google Cloud Platform account
- Google Cloud CLI installed and configured
- Docker installed locally
- A registered domain name
- Stripe account

## Option 1: Full Automated Deployment

You can use the full deployment script to automate all the steps:

```bash
./scripts/full-deployment.sh your-domain.com
```

This script will:
1. Run tests to ensure everything is working correctly
2. Deploy to Google Cloud Run
3. Map your domain to Cloud Run
4. Set up Stripe webhook
5. Guide you through final verification steps

## Option 2: Step-by-Step Deployment

If you prefer to deploy step by step, follow these instructions:

### Step 1: Run Tests

Before deploying, run the tests to ensure everything is working correctly:

```bash
./scripts/run-all-tests.sh
```

This will test the Stripe integration and provide instructions for testing authentication.

### Step 2: Deploy to Google Cloud Run

Use the deployment script to deploy the application to Google Cloud Run:

```bash
./scripts/deploy-to-cloudrun.sh
```

This script will:
- Build a Docker image with your environment variables
- Push the image to Google Container Registry
- Deploy the image to Cloud Run
- Set up environment variables in Cloud Run

### Step 3: Set Up Custom Domain

1. **Verify domain ownership in Google Cloud Console**
   - Go to Google Cloud Console > APIs & Services > Domain verification
   - Check if your domain is verified (you've already added the TXT record)

2. **Map your domain to Cloud Run**
   - Use the domain mapping script:
   ```bash
   ./scripts/map-domain-to-cloudrun.sh your-domain.com
   ```
   - This script will create the domain mapping and provide you with the DNS records to add

3. **Add DNS records for domain mapping**
   - Add the DNS records provided by the script to your domain's DNS settings

4. **Check domain status**
   - Use the domain status check script to verify your domain setup:
   ```bash
   ./scripts/check-domain-status.sh your-domain.com
   ```

### Step 4: Configure Stripe Webhook

1. **Create webhook endpoint programmatically**
   - Use the Stripe webhook setup script:
   ```bash
   node scripts/setup-stripe-webhook-cli.js your-domain.com
   ```
   - This script will create the webhook endpoints for both your domain and Supabase Functions

2. **Test payment processing**
   - Use the payment processing test script:
   ```bash
   node scripts/test-payment-processing.js
   ```
   - This script will create a test customer, payment method, and subscription/payment
   - It will also check if the webhook is receiving events

## Step 5: Final Verification

1. **Test authentication**
   - Use the authentication test script:
   ```bash
   node scripts/test-auth.js
   ```
   - Verify login, registration, and password reset flows

2. **Test critical user flows**
   - Registration
   - Login
   - Password reset
   - Subscription management
   - Profile management

3. **Check mobile responsiveness**
   - Test the application on different devices and browsers

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

### Authentication Issues

If authentication isn't working:

1. Verify that Supabase is properly configured
2. Check that the JWT_SECRET is correctly set
3. Ensure the SUPABASE_URL and SUPABASE_ANON_KEY are correct

### Stripe Integration Issues

If Stripe integration isn't working:

1. Verify that the webhook endpoint is correctly configured
2. Check that the webhook secret matches the one in your .env file
3. Ensure the Stripe API keys are correct

## Maintenance

### Regular Backups

Set up regular backups of your database:

```bash
npm run db:backup
```

### Monitoring

Use the monitoring script to check the status of your application:

```bash
./scripts/monitor-application.sh your-domain.com
```

This script provides a menu of options to check:
- Domain status
- Cloud Run service status
- Recent logs
- Error logs
- Domain health

You can also set up more advanced monitoring using Google Cloud Monitoring.

### Updates

When updating the application:

1. Make your changes
2. Run tests
3. Deploy using the deployment script
