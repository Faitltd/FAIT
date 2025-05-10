#!/bin/bash
set -e

# Configuration
PROJECT_ID="fait-444705"
SERVICE_NAME="stripe-webhook-service"

# Get environment variables from .env file
source .env

# Create secrets in Google Secret Manager
echo "Creating secrets in Google Secret Manager..."

# Create STRIPE_SECRET_KEY secret
echo "Creating STRIPE_SECRET_KEY secret..."
echo -n "$STRIPE_SECRET_KEY" | gcloud secrets create stripe-secret-key \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- || \
echo -n "$STRIPE_SECRET_KEY" | gcloud secrets versions add stripe-secret-key \
  --project=$PROJECT_ID \
  --data-file=-

# Create STRIPE_WEBHOOK_SECRET secret
echo "Creating STRIPE_WEBHOOK_SECRET secret..."
echo -n "$STRIPE_WEBHOOK_SECRET" | gcloud secrets create stripe-webhook-secret \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- || \
echo -n "$STRIPE_WEBHOOK_SECRET" | gcloud secrets versions add stripe-webhook-secret \
  --project=$PROJECT_ID \
  --data-file=-

# Create SUPABASE_URL secret
echo "Creating SUPABASE_URL secret..."
echo -n "$SUPABASE_URL" | gcloud secrets create supabase-url \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- || \
echo -n "$SUPABASE_URL" | gcloud secrets versions add supabase-url \
  --project=$PROJECT_ID \
  --data-file=-

# Create SUPABASE_SERVICE_ROLE_KEY secret
echo "Creating SUPABASE_SERVICE_ROLE_KEY secret..."
echo -n "$SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets create supabase-service-role-key \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- || \
echo -n "$SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets versions add supabase-service-role-key \
  --project=$PROJECT_ID \
  --data-file=-

# Grant access to the service account
echo "Granting access to the service account..."
SERVICE_ACCOUNT="$SERVICE_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Create service account if it doesn't exist
gcloud iam service-accounts create $SERVICE_NAME \
  --project=$PROJECT_ID \
  --display-name="$SERVICE_NAME service account" || true

# Grant access to secrets
for SECRET_NAME in stripe-secret-key stripe-webhook-secret supabase-url supabase-service-role-key; do
  gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --project=$PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
done

echo "✅ Secrets setup complete!"
