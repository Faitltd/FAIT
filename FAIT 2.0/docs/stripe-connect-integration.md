# Stripe Connect Integration for FAIT 2.0

This document provides an overview of the Stripe Connect integration in the FAIT 2.0 platform, which enables contractors to receive payments directly to their bank accounts.

## Overview

The Stripe Connect integration allows FAIT to:

1. Create Stripe Connect accounts for contractors
2. Onboard contractors to Stripe Connect
3. Process payouts to contractors
4. Track payment history

## Architecture

The integration consists of the following components:

1. **Database Tables**:
   - `profiles` table with `stripe_connect_id` and `stripe_connect_status` columns
   - `payouts` table to track all payouts made to contractors

2. **Supabase Edge Function**:
   - `stripe-connect` function that handles all Stripe Connect operations
   - Uses the Stripe Master API key for platform operations

3. **Frontend Components**:
   - `StripeConnectDashboard` for contractors to manage their Connect accounts
   - `AdminPayoutManager` for admins to manage payouts to contractors

4. **Routes**:
   - `/dashboard/payments` for contractors to access their payment dashboard
   - `/admin/payouts` for admins to manage payouts
   - `/admin/stripe-connect` for admins to manage Stripe Connect accounts

## Setup

The integration requires the following environment variables:

```
STRIPE_SECRET_KEY=sk_test_51RFha1BXhGFYU3zX4h9LnmB3xt4GYN23OBapKfhgRzuD6jfdrThOS72POKjH2iIqxn8hq2GHpgaopNhS5OJBMdlf00ghjOwdV9
STRIPE_MASTER_API_KEY=rk_test_51RFhZeBoixZxzpJPDWjYMsj2QlMsRYWHAi8WTaseH32MnStmwE0LUumTxQjWYvq8kTL9TCGyHBVEtzzeYVGSwn5p009q1xXYnJ
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

## Workflow

### Contractor Onboarding

1. Contractor visits the Payments page in their dashboard
2. Contractor clicks "Set Up Stripe Connect"
3. System creates a Stripe Connect Express account for the contractor
4. Contractor is redirected to Stripe's onboarding flow
5. After completing onboarding, contractor is redirected back to the FAIT platform
6. Contractor can now receive payments through Stripe Connect

### Admin Payout Process

1. Admin visits the Payouts page in the admin dashboard
2. Admin selects a contractor and enters the payout amount
3. Admin confirms the payout
4. System creates a transfer to the contractor's Stripe Connect account
5. System records the payout in the database
6. Contractor receives the funds in their bank account (typically within 2-3 business days)

## API Endpoints

The `stripe-connect` Edge Function provides the following endpoints:

1. `create_connect_account`: Creates a new Stripe Connect account for a contractor
2. `create_account_link`: Creates an account link for onboarding or updating a Stripe Connect account
3. `get_account_balance`: Gets the balance for a Stripe Connect account
4. `create_payout`: Creates a payout for a Stripe Connect account
5. `get_account_details`: Gets details for a Stripe Connect account

## Security Considerations

1. The Stripe Master API key is stored securely in environment variables
2. Only admins can create payouts
3. Contractors can only view their own Connect account details
4. All API calls are authenticated using Supabase Auth

## Testing

To test the integration:

1. Create a test contractor account
2. Set up Stripe Connect for the contractor using Stripe's test mode
3. Make a test payout to the contractor
4. Verify that the payout appears in the contractor's dashboard
5. Verify that the payout appears in the admin dashboard

## Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Connect Express Dashboard](https://dashboard.stripe.com/connect/accounts)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
