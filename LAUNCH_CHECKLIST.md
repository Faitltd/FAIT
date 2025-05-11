# FAIT Co-op Launch Checklist

This document provides a checklist of tasks to complete before launching the FAIT Co-op platform.

## Authentication

- [x] Switch from local auth to Supabase auth (updated `src/lib/supabase.ts`)
- [ ] Test login functionality with real credentials (use `scripts/test-auth.js`)
- [ ] Verify JWT authentication is working properly
- [ ] Test registration and password reset flows

## Custom Domain Setup

- [x] Add TXT record to domain DNS for verification with Google Cloud
- [ ] Verify domain ownership in Google Cloud Console
  - Go to Google Cloud Console > APIs & Services > Domain verification
  - Check if your domain is now verified
- [ ] Map your domain to Cloud Run
  - Go to Cloud Run in the Google Cloud Console
  - Select your service (fait-coop)
  - Click on the "Domain mappings" tab
  - Click "Add mapping"
  - Enter your domain name
  - Follow the prompts to complete the mapping
- [ ] Add DNS records for domain mapping
  - Google will provide you with specific DNS records (A records for apex domain, CNAME for subdomains)
  - Add these records to your domain's DNS settings
- [ ] Wait for DNS propagation and SSL certificate provisioning
  - Use `scripts/check-domain-status.sh your-domain.com` to check status

## Stripe Integration

- [x] Generate webhook secret (added to `.env` file)
- [x] Set up Stripe products and plans (added to `.env` file)
- [ ] Create webhook endpoint in Stripe dashboard
  - Go to https://dashboard.stripe.com/webhooks
  - Add a new endpoint with URL: https://ydisdyadjupyswcpbxzu.supabase.co/functions/v1/stripe-webhook
  - Use the webhook secret from your `.env` file
  - Select these events:
    - checkout.session.completed
    - invoice.payment_succeeded
    - invoice.payment_failed
    - customer.subscription.updated
    - customer.subscription.deleted
- [ ] Test payment processing with test cards

## Deployment

- [x] Create deployment script (`scripts/deploy-to-cloudrun.sh`)
- [ ] Deploy to Google Cloud Run
  - Run `./scripts/deploy-to-cloudrun.sh`
- [ ] Verify deployment is working correctly
  - Check that the application loads correctly
  - Test authentication
  - Test payment processing

## Environment Variables

- [x] Set up all required environment variables in `.env` file
- [ ] Ensure environment variables are properly set in Cloud Run
  - This is handled by the deployment script

## Final Checks

- [ ] Test all critical user flows
  - Registration
  - Login
  - Password reset
  - Subscription management
  - Profile management
- [ ] Verify error handling is working correctly
- [ ] Check mobile responsiveness
- [ ] Ensure all links and navigation work correctly

## Useful Scripts

- `scripts/test-auth.js` - Test authentication with Supabase
- `scripts/test-stripe.js` - Test Stripe integration
- `scripts/test-payment-processing.js` - Test payment processing with Stripe
- `scripts/check-domain-status.sh` - Check custom domain status
- `scripts/map-domain-to-cloudrun.sh` - Map your domain to Cloud Run
- `scripts/deploy-to-cloudrun.sh` - Deploy to Google Cloud Run
- `scripts/full-deployment.sh` - Perform a full deployment (all steps)
- `scripts/monitor-application.sh` - Monitor the application after deployment
- `scripts/setup-stripe-webhook-cli.js` - Set up Stripe webhook programmatically

## Next Steps After Launch

1. Set up monitoring and alerts
2. Implement analytics tracking
3. Create backup and disaster recovery plan
4. Establish regular maintenance schedule
5. Plan for future feature development
