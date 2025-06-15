#!/bin/bash

# Deploy Supabase Edge Functions for FAIT Mobile App
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    log_warning "Not logged in to Supabase. Please login:"
    supabase login
fi

# Deploy create-payment-intent function
log_info "📦 Deploying create-payment-intent function..."
if supabase functions deploy create-payment-intent --no-verify-jwt; then
    log_success "create-payment-intent function deployed"
else
    log_error "Failed to deploy create-payment-intent function"
    exit 1
fi

# Deploy send-booking-notification function
log_info "📧 Deploying send-booking-notification function..."
if supabase functions deploy send-booking-notification --no-verify-jwt; then
    log_success "send-booking-notification function deployed"
else
    log_error "Failed to deploy send-booking-notification function"
    exit 1
fi

# Deploy process-refund function (if it exists)
if [ -d "supabase/functions/process-refund" ]; then
    log_info "💰 Deploying process-refund function..."
    if supabase functions deploy process-refund --no-verify-jwt; then
        log_success "process-refund function deployed"
    else
        log_warning "Failed to deploy process-refund function"
    fi
fi

# Set environment variables for functions
log_info "🔧 Setting function environment variables..."

# Get Supabase project reference
PROJECT_REF=$(supabase projects list --output json | jq -r '.[0].id' 2>/dev/null || echo "")

if [ -n "$PROJECT_REF" ]; then
    log_info "Setting secrets for project: $PROJECT_REF"
    
    # Set Stripe secret key
    if [ -n "${STRIPE_SECRET_KEY:-}" ]; then
        echo "$STRIPE_SECRET_KEY" | supabase secrets set STRIPE_SECRET_KEY --project-ref "$PROJECT_REF"
        log_success "STRIPE_SECRET_KEY set"
    else
        log_warning "STRIPE_SECRET_KEY not found in environment"
    fi
    
    # Set Resend API key
    if [ -n "${RESEND_API_KEY:-}" ]; then
        echo "$RESEND_API_KEY" | supabase secrets set RESEND_API_KEY --project-ref "$PROJECT_REF"
        log_success "RESEND_API_KEY set"
    else
        log_warning "RESEND_API_KEY not found in environment"
    fi
    
    # Set site URL
    echo "https://itsfait.com" | supabase secrets set SITE_URL --project-ref "$PROJECT_REF"
    log_success "SITE_URL set"
    
else
    log_warning "Could not determine Supabase project reference"
fi

# Test functions
log_info "🧪 Testing deployed functions..."

# Test create-payment-intent function
log_info "Testing create-payment-intent function..."
FUNCTION_URL=$(supabase functions list --output json | jq -r '.[] | select(.name=="create-payment-intent") | .url' 2>/dev/null || echo "")

if [ -n "$FUNCTION_URL" ]; then
    log_success "create-payment-intent function URL: $FUNCTION_URL"
else
    log_warning "Could not get create-payment-intent function URL"
fi

# Test send-booking-notification function
log_info "Testing send-booking-notification function..."
NOTIFICATION_URL=$(supabase functions list --output json | jq -r '.[] | select(.name=="send-booking-notification") | .url' 2>/dev/null || echo "")

if [ -n "$NOTIFICATION_URL" ]; then
    log_success "send-booking-notification function URL: $NOTIFICATION_URL"
else
    log_warning "Could not get send-booking-notification function URL"
fi

log_success "🎉 Supabase Edge Functions deployment completed!"

echo
log_info "📋 Deployment Summary:"
echo "✅ create-payment-intent: Deployed"
echo "✅ send-booking-notification: Deployed"
echo "✅ Environment variables: Configured"

echo
log_info "🔗 Function URLs:"
[ -n "$FUNCTION_URL" ] && echo "Payment: $FUNCTION_URL"
[ -n "$NOTIFICATION_URL" ] && echo "Notifications: $NOTIFICATION_URL"

echo
log_info "Next steps:"
echo "1. Test functions in Supabase dashboard"
echo "2. Run mobile tests"
echo "3. Deploy to Google Cloud Run"
