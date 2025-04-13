# Database Schema Updates

This directory contains the database migration files for the FAIT Co-Op platform. The migrations are applied in order based on their timestamp prefixes.

## Recent Updates

### 20250401020000_rename_contractor_tables.sql
- Renames all "contractor" tables and references to "service_agent" to align with the new terminology
- Updates user_type in profiles table from 'contractor' to 'service_agent'
- Updates RLS policies to use the new table and column names

### 20250401010000_platform_updates.sql
- Adds messaging system tables and functionality
- Adds portfolio management for service agents
- Updates warranty claims to support photo uploads
- Adds notification triggers for messages and warranty claims

## Schema Overview

The database schema includes the following main tables:

### User Management
- `profiles`: User profiles with personal information and user type (client/service_agent)
- `service_agent_verifications`: Verification status and documents for service agents
- `service_agent_service_areas`: Geographic service areas for service agents
- `service_agent_portfolio_items`: Portfolio items showcasing service agent work
- `service_agent_work_history`: Work history for service agents
- `service_agent_references`: References for service agents

### Services and Bookings
- `service_packages`: Service offerings created by service agents
- `bookings`: Service bookings made by clients
- `reviews`: Client reviews of completed services
- `external_reviews`: Links to reviews on external platforms

### Communication
- `messages`: Direct messages between clients and service agents
- `notifications`: System notifications for users

### Warranty and Support
- `warranty_claims`: Warranty claims filed by clients
- `admin_audit_logs`: Audit logs for admin actions

### Rewards and Governance
- `points_transactions`: Point earnings and spending
- `rewards`: Available rewards for point redemption
- `reward_redemptions`: Redeemed rewards
- `governance_proposals`: Community governance proposals
- `governance_votes`: Votes on governance proposals

## Security

The database uses Row Level Security (RLS) to ensure that users can only access data they are authorized to see. Each table has specific policies that control access based on user roles and ownership.

## Migrations

To apply these migrations to your local development environment, run:

```bash
npx supabase migration up
```

To create a new migration, run:

```bash
npx supabase migration new <migration_name>
```
