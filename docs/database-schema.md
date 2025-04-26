# FAIT Co-Op Platform Database Schema

This document provides an overview of the FAIT Co-Op Platform database schema.

## Tables

### profiles

Stores user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, references auth.users.id |
| first_name | text | User's first name |
| last_name | text | User's last name |
| email | text | User's email address |
| phone | text | User's phone number |
| avatar_url | text | URL to user's avatar image |
| user_type | text | User type: 'client', 'service_agent', or 'admin' |
| zip_code | text | User's zip code |
| stripe_customer_id | text | Stripe customer ID |
| subscription_plan | text | Current subscription plan |
| service_limit | integer | Number of services allowed (for service agents) |
| featured_listing | boolean | Whether the user has featured listings |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### service_agent_verifications

Stores verification information for service agents.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| service_agent_id | uuid | References profiles.id |
| license_number | text | Service agent's license number |
| license_type | text | Type of license |
| license_expiry | date | License expiration date |
| insurance_provider | text | Insurance provider name |
| insurance_policy_number | text | Insurance policy number |
| insurance_expiry | date | Insurance expiration date |
| verification_status | text | Status: 'pending', 'approved', 'rejected' |
| verification_date | timestamptz | Date of verification |
| verified_by | uuid | References profiles.id of admin who verified |
| document_urls | text[] | Array of document URLs |
| notes | text | Verification notes |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### service_packages

Stores service offerings created by service agents.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| service_agent_id | uuid | References profiles.id |
| title | text | Service title |
| description | text | Service description |
| price | numeric | Service price |
| duration | integer | Service duration |
| duration_unit | text | Duration unit: 'minutes', 'hours', 'days' |
| trade | text | Service trade category |
| is_active | boolean | Whether the service is active |
| image_urls | text[] | Array of image URLs |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### bookings

Stores service bookings made by clients.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| client_id | uuid | References profiles.id |
| service_agent_id | uuid | References profiles.id |
| service_package_id | uuid | References service_packages.id |
| booking_date | date | Date of the booking |
| booking_time | time | Time of the booking |
| status | text | Status: 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled' |
| price | numeric | Booking price |
| payment_status | text | Payment status: 'pending', 'paid', 'refunded' |
| payment_intent_id | text | Payment intent ID |
| notes | text | Booking notes |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### reviews

Stores client reviews of completed services.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| booking_id | uuid | References bookings.id |
| client_id | uuid | References profiles.id |
| service_agent_id | uuid | References profiles.id |
| rating | integer | Rating (1-5) |
| comment | text | Review comment |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### external_reviews

Stores links to reviews on external platforms.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| service_agent_id | uuid | References profiles.id |
| platform | text | Platform: 'google', 'yelp', 'nextdoor' |
| url | text | URL to the review |
| rating | numeric | Rating |
| review_count | integer | Number of reviews |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### conversations

Stores messaging conversations between users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| participants | uuid[] | Array of participant IDs (references profiles.id) |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### messages

Stores messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| conversation_id | uuid | References conversations.id |
| sender_id | uuid | References profiles.id |
| content | text | Message content |
| is_read | boolean | Whether the message has been read |
| attachments | text[] | Array of attachment URLs |
| created_at | timestamptz | Record creation timestamp |

### notifications

Stores system notifications for users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References profiles.id |
| type | text | Notification type |
| title | text | Notification title |
| message | text | Notification message |
| is_read | boolean | Whether the notification has been read |
| data | jsonb | Additional notification data |
| created_at | timestamptz | Record creation timestamp |

### warranties

Stores warranty information for completed services.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | Project ID |
| homeowner_id | uuid | References profiles.id |
| service_agent_id | uuid | References profiles.id |
| warranty_type | text | Type: '1yr', '2yr', '3yr-extended' |
| start_date | date | Warranty start date |
| end_date | date | Warranty end date |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### warranty_claims

Stores warranty claims filed by clients.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| warranty_id | uuid | References warranties.id |
| booking_id | uuid | References bookings.id |
| client_id | uuid | References profiles.id |
| service_agent_id | uuid | References profiles.id |
| description | text | Claim description |
| photo_urls | text[] | Array of photo URLs |
| status | text | Status: 'pending', 'in_progress', 'approved', 'rejected', 'resolved' |
| resolution | text | Claim resolution |
| resolved_at | timestamptz | Resolution timestamp |
| resolved_by | uuid | References profiles.id |
| admin_notes | text | Admin notes |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### subscriptions

Stores user subscription information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References profiles.id |
| stripe_subscription_id | text | Stripe subscription ID |
| stripe_customer_id | text | Stripe customer ID |
| plan_id | text | Subscription plan ID |
| status | text | Status: 'active', 'canceled', 'past_due', 'unpaid' |
| current_period_start | timestamptz | Current period start date |
| current_period_end | timestamptz | Current period end date |
| cancel_at_period_end | boolean | Whether to cancel at period end |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### supplier_orders

Stores supplier orders for commission tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References profiles.id |
| supplier_id | uuid | Supplier ID |
| order_number | text | Order number |
| order_date | date | Order date |
| order_amount | numeric | Order amount |
| commission_rate | numeric | Commission rate |
| commission_amount | numeric | Commission amount |
| status | text | Status: 'pending', 'processed', 'paid' |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### commission_transactions

Stores commission transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| supplier_order_id | uuid | References supplier_orders.id |
| user_id | uuid | References profiles.id |
| amount | numeric | Commission amount |
| status | text | Status: 'pending', 'processed', 'paid' |
| transaction_date | date | Transaction date |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

### estimates

Stores service estimates created by service agents.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| booking_id | uuid | References bookings.id |
| service_agent_id | uuid | References profiles.id |
| client_id | uuid | References profiles.id |
| title | text | Estimate title |
| description | text | Estimate description |
| total_amount | numeric | Total estimate amount |
| status | text | Status: 'draft', 'sent', 'accepted', 'rejected', 'expired' |
| valid_until | date | Expiration date |
| line_items | jsonb | Line items |
| notes | text | Estimate notes |
| terms | text | Estimate terms |
| created_at | timestamptz | Record creation timestamp |
| updated_at | timestamptz | Record update timestamp |

## Row Level Security (RLS) Policies

The database uses Row Level Security (RLS) to ensure that users can only access data they are authorized to see. Each table has specific policies that control access based on user roles and ownership.

### profiles

- Users can view their own profile
- Users can update their own profile
- Admins can view all profiles
- Admins can update all profiles

### service_agent_verifications

- Service agents can view their own verification
- Admins can view all verifications
- Admins can update all verifications

### service_packages

- Anyone can view active service packages
- Service agents can create/update/delete their own service packages
- Admins can view/update/delete all service packages

### bookings

- Clients can view their own bookings
- Service agents can view bookings assigned to them
- Clients can create bookings
- Clients can update their own bookings (with restrictions)
- Service agents can update bookings assigned to them (with restrictions)
- Admins can view/update all bookings

### reviews

- Anyone can view reviews
- Clients can create reviews for their bookings
- Clients can update their own reviews
- Admins can view/update/delete all reviews

### conversations and messages

- Participants can view their own conversations and messages
- Participants can create messages in their conversations
- Admins can view all conversations and messages

### warranties and warranty_claims

- Involved parties can view their warranties and claims
- Clients can create warranty claims
- Service agents can update warranty claims assigned to them
- Admins can view/update all warranties and claims

### subscriptions

- Users can view their own subscriptions
- Admins can view all subscriptions
- System functions can update subscriptions

## Database Functions

### update_updated_at_column()

Trigger function to automatically update the `updated_at` column when a record is updated.

### has_feature(user_id, feature_key)

Checks if a user has access to a specific feature based on their subscription plan.

### extend_warranty_if_eligible()

Extends warranty based on subscription tier when a warranty is created or updated.

### get_unread_message_count(user_id)

Returns the count of unread messages for a user.

### get_available_time_slots(service_agent_id, date)

Returns available time slots for a service agent on a specific date.

### update_user_permissions()

Updates user permissions when their subscription changes.
