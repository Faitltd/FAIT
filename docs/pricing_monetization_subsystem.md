# FAIT Cooperative Platform - Pricing and Monetization Subsystem

This document provides an overview of the Pricing and Monetization Subsystem for the FAIT Cooperative Platform.

## Overview

The Pricing and Monetization Subsystem handles subscription billing, feature unlocks based on tier, supplier commission tracking, warranty registration based on subscription, and admin panel for pricing control.

## Architecture

The subsystem consists of the following components:

1. **Database Schema**: Tables and relationships for storing subscription data, supplier orders, commissions, and warranties.
2. **Edge Functions**: Serverless functions for handling Stripe webhooks, subscription management, and feature access control.
3. **Frontend Components**: React components for subscription management and admin panels.
4. **Stripe Integration**: Integration with Stripe for subscription billing and payment processing.

## Database Schema

### Tables

- **subscriptions**: Stores subscription data for users
- **supplier_orders**: Tracks orders placed with suppliers
- **warranties**: Stores warranty information for projects
- **commission_transactions**: Tracks commission transactions for supplier orders
- **subscription_features**: Stores feature flags for subscription tiers

### Relationships

- A user can have multiple subscriptions (but only one active)
- A user can have multiple supplier orders
- A project can have one warranty
- A supplier order can have one commission transaction

## Subscription Tiers

### Contractors

- **Free Tier**: Limited Leads, No discount access
- **Pro ($75/mo or $750/yr)**: Material sourcing, ROI data, Pricing templates, Lead allotment
- **Business ($200/mo or $2,000/yr)**: All Pro features, Multi-user, Priority leads, Premium discounts

### Homeowners

- **Free**: Basic project posting
- **FAIT Plus ($4.99/mo or $49/yr)**: ROI Reports, Extended Warranty, Discounts, Priority Support

### Cooperative Membership

- **Membership Fee**: $100/year if not bundled into Contractor plan

## Feature Gating

Feature access is controlled through the `subscription_features` table and the `has_feature` function. The frontend uses the `checkFeatureAccess` function to determine if a user has access to a specific feature.

## Warranty Extension

Warranties are automatically extended for FAIT Plus subscribers:
- 1yr warranty → 2yr warranty
- 2yr warranty → 3yr-extended warranty

This is implemented using a database trigger on the `warranties` table.

## Commission Tracking

Supplier orders are tracked in the `supplier_orders` table, and commissions are calculated based on the commission rate for each supplier. Commission transactions are stored in the `commission_transactions` table.

## Admin Panel

The admin panel provides the following functionality:

1. **Subscriptions Management**: View and manage user subscriptions
2. **Commissions Management**: Track supplier orders and commission payouts
3. **Pricing Controls**: Configure subscription tiers and pricing

## Setup Instructions

### Prerequisites

- Node.js
- Stripe CLI
- Supabase CLI

### Database Setup

1. Run the database migration:
   ```
   supabase migration up
   ```

### Stripe Setup

1. Set up Stripe products and plans:
   ```
   export STRIPE_SECRET_KEY=sk_test_your_key
   node scripts/setup_stripe_products.js
   ```

2. Set up Stripe webhook:
   ```
   export STRIPE_SECRET_KEY=sk_test_your_key
   ./scripts/setup_stripe_webhook.sh
   ```

3. Set the environment variables in your Supabase project:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: The webhook secret from the setup script
   - `STRIPE_PRICE_*`: The price IDs for each subscription tier

### Test Data

1. Insert fake data for testing:
   ```
   ./scripts/insert_fake_data.sh
   ```

## API Reference

### Edge Functions

- `stripe-webhook`: Handles Stripe events (checkout, invoices, subscription changes)
- `create-subscription`: Creates subscriptions in Stripe and Supabase
- `check-feature-access`: Checks if user has access to specific features
- `record-supplier-order`: Records supplier orders and calculates commissions
- `register-warranty`: Registers warranties with automatic extension for premium users

### Database Functions

- `has_feature(user_id, feature_key)`: Checks if a user has access to a specific feature
- `extend_warranty_if_eligible()`: Extends warranty based on subscription tier

## Frontend Components

- `SubscriptionContext`: React context for subscription management
- `SubscriptionManagement`: User-facing subscription management page
- `SubscriptionsManagement`: Admin interface for managing user subscriptions
- `CommissionsManagement`: Admin interface for tracking supplier commissions
- `PricingControls`: Admin interface for configuring subscription tiers and pricing

## Troubleshooting

### Common Issues

1. **Stripe webhook not receiving events**:
   - Check that the webhook URL is correct
   - Check that the webhook secret is set correctly
   - Check that the events are configured correctly

2. **Subscription not being created**:
   - Check that the Stripe API key is set correctly
   - Check that the price IDs are set correctly
   - Check the Stripe dashboard for errors

3. **Feature access not working**:
   - Check that the subscription is active
   - Check that the feature is defined in the `subscription_features` table
   - Check that the user type matches the feature's user type

## Maintenance

### Adding a New Subscription Tier

1. Add the tier to the `setup_stripe_products.js` script
2. Run the script to create the tier in Stripe
3. Add the tier's features to the `subscription_features` table
4. Update the frontend to display the new tier

### Modifying Feature Access

1. Update the `subscription_features` table with the new feature access
2. No code changes are required as the feature access is controlled through the database
