# FAIT Co-Op Platform API Documentation

This document provides an overview of the FAIT Co-Op Platform API endpoints and their usage.

## Authentication

All API requests require authentication using a Supabase JWT token.

### Headers

```
Authorization: Bearer <token>
```

## Endpoints

### Profiles

#### Get Current User Profile

```
GET /rest/v1/profiles?id=eq.<user_id>
```

**Response**

```json
[
  {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "avatar_url": "string",
    "user_type": "client | service_agent | admin",
    "zip_code": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

#### Update User Profile

```
PATCH /rest/v1/profiles?id=eq.<user_id>
```

**Request Body**

```json
{
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "avatar_url": "string",
  "zip_code": "string"
}
```

### Services

#### Get Services

```
GET /rest/v1/service_packages
```

**Query Parameters**

- `is_active`: Filter by active status
- `service_agent_id`: Filter by service agent ID
- `trade`: Filter by trade category

**Response**

```json
[
  {
    "id": "uuid",
    "service_agent_id": "uuid",
    "title": "string",
    "description": "string",
    "price": "number",
    "duration": "number",
    "duration_unit": "string",
    "trade": "string",
    "is_active": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

#### Create Service

```
POST /rest/v1/service_packages
```

**Request Body**

```json
{
  "service_agent_id": "uuid",
  "title": "string",
  "description": "string",
  "price": "number",
  "duration": "number",
  "duration_unit": "string",
  "trade": "string",
  "is_active": "boolean"
}
```

#### Update Service

```
PATCH /rest/v1/service_packages?id=eq.<service_id>
```

**Request Body**

```json
{
  "title": "string",
  "description": "string",
  "price": "number",
  "duration": "number",
  "duration_unit": "string",
  "trade": "string",
  "is_active": "boolean"
}
```

### Bookings

#### Get Bookings

```
GET /rest/v1/bookings
```

**Query Parameters**

- `client_id`: Filter by client ID
- `service_agent_id`: Filter by service agent ID
- `status`: Filter by status

**Response**

```json
[
  {
    "id": "uuid",
    "client_id": "uuid",
    "service_agent_id": "uuid",
    "service_package_id": "uuid",
    "booking_date": "date",
    "booking_time": "time",
    "status": "string",
    "price": "number",
    "payment_status": "string",
    "payment_intent_id": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

#### Create Booking

```
POST /rest/v1/bookings
```

**Request Body**

```json
{
  "client_id": "uuid",
  "service_agent_id": "uuid",
  "service_package_id": "uuid",
  "booking_date": "date",
  "booking_time": "time",
  "price": "number"
}
```

#### Update Booking Status

```
PATCH /rest/v1/bookings?id=eq.<booking_id>
```

**Request Body**

```json
{
  "status": "string"
}
```

### Messages

#### Get Conversations

```
GET /rest/v1/conversations
```

**Query Parameters**

- `participant_id`: Filter by participant ID

**Response**

```json
[
  {
    "id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "participants": ["uuid"]
  }
]
```

#### Get Messages

```
GET /rest/v1/messages
```

**Query Parameters**

- `conversation_id`: Filter by conversation ID

**Response**

```json
[
  {
    "id": "uuid",
    "conversation_id": "uuid",
    "sender_id": "uuid",
    "content": "string",
    "is_read": "boolean",
    "created_at": "timestamp"
  }
]
```

#### Send Message

```
POST /rest/v1/messages
```

**Request Body**

```json
{
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "content": "string"
}
```

### Subscriptions

#### Get User Subscription

```
GET /rest/v1/subscriptions?user_id=eq.<user_id>
```

**Response**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "stripe_subscription_id": "string",
    "plan_id": "string",
    "status": "string",
    "current_period_start": "timestamp",
    "current_period_end": "timestamp",
    "cancel_at_period_end": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

## Edge Functions

### Create Subscription

```
POST /functions/v1/create-subscription
```

**Request Body**

```json
{
  "priceId": "string",
  "successUrl": "string",
  "cancelUrl": "string",
  "planName": "string",
  "billingCycle": "string"
}
```

**Response**

```json
{
  "success": true,
  "sessionId": "string",
  "checkoutUrl": "string"
}
```

### Process Payment

```
POST /functions/v1/process-payment
```

**Request Body**

```json
{
  "bookingId": "uuid",
  "paymentMethodId": "string"
}
```

**Response**

```json
{
  "success": true,
  "paymentIntent": {
    "id": "string",
    "status": "string"
  }
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication is required
- `403 Forbidden`: The authenticated user does not have permission
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

Error responses include a JSON body with an error message:

```json
{
  "error": "Error message"
}
```

## Rate Limiting

API requests are subject to rate limiting. The current limits are:

- 100 requests per minute per user
- 1000 requests per hour per user

When a rate limit is exceeded, the API returns a `429 Too Many Requests` status code.

## Webhooks

The platform supports webhooks for the following events:

- Subscription created/updated/cancelled
- Payment succeeded/failed
- Booking created/updated/cancelled

Webhook endpoints must be configured in the Supabase dashboard.
