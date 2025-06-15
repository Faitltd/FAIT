#!/bin/bash

# FAIT Environment Setup Script
# This script helps configure environment variables for production deployment

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

# Configuration
PROJECT_ID="${PROJECT_ID:-fait-444705}"
REGION="${REGION:-us-central1}"

log_info "🔧 Setting up FAIT environment variables..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    log_info "Creating .env.production from template..."
    cp .env.example .env.production
fi

# Function to update environment variable
update_env_var() {
    local key=$1
    local value=$2
    local file=${3:-.env.production}
    
    if grep -q "^${key}=" "$file"; then
        # Update existing variable
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=${value}|" "$file"
        else
            sed -i "s|^${key}=.*|${key}=${value}|" "$file"
        fi
    else
        # Add new variable
        echo "${key}=${value}" >> "$file"
    fi
}

# Function to prompt for environment variable
prompt_env_var() {
    local key=$1
    local description=$2
    local current_value=$3
    local is_secret=${4:-false}
    
    echo
    log_info "Setting up: $description"
    
    if [ -n "$current_value" ] && [ "$current_value" != "your_${key,,}" ]; then
        log_success "Current value found: ${current_value:0:20}..."
        read -p "Keep current value? (y/n): " keep_current
        if [[ $keep_current =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    if [ "$is_secret" = true ]; then
        read -s -p "Enter $description: " new_value
        echo
    else
        read -p "Enter $description: " new_value
    fi
    
    if [ -n "$new_value" ]; then
        update_env_var "$key" "$new_value"
        log_success "$key updated"
    else
        log_warning "$key skipped"
    fi
}

# Load current environment
if [ -f ".env.production" ]; then
    source .env.production 2>/dev/null || true
fi

log_info "📋 Configuring environment variables..."

# Supabase Configuration
echo
log_info "=== Supabase Configuration ==="
prompt_env_var "VITE_SUPABASE_URL" "Supabase Project URL (https://xxx.supabase.co)" "${VITE_SUPABASE_URL:-}"
prompt_env_var "VITE_SUPABASE_ANON_KEY" "Supabase Anon Key" "${VITE_SUPABASE_ANON_KEY:-}" true
prompt_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Role Key" "${SUPABASE_SERVICE_ROLE_KEY:-}" true

# Stripe Configuration
echo
log_info "=== Stripe Configuration ==="
prompt_env_var "VITE_STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key (pk_live_...)" "${VITE_STRIPE_PUBLISHABLE_KEY:-}"
prompt_env_var "STRIPE_SECRET_KEY" "Stripe Secret Key" "${STRIPE_SECRET_KEY:-}" true
prompt_env_var "STRIPE_WEBHOOK_SECRET" "Stripe Webhook Secret" "${STRIPE_WEBHOOK_SECRET:-}" true

# Google Maps Configuration
echo
log_info "=== Google Maps Configuration ==="
prompt_env_var "VITE_GOOGLE_MAPS_API_KEY" "Google Maps API Key" "${VITE_GOOGLE_MAPS_API_KEY:-}" true

# Email Configuration
echo
log_info "=== Email Configuration ==="
prompt_env_var "RESEND_API_KEY" "Resend API Key (re_...)" "${RESEND_API_KEY:-}" true

# Google Cloud Configuration
echo
log_info "=== Google Cloud Configuration ==="
update_env_var "GCP_PROJECT_ID" "$PROJECT_ID"
update_env_var "GCP_REGION" "$REGION"
log_success "Google Cloud configuration updated"

# Site Configuration
echo
log_info "=== Site Configuration ==="
update_env_var "VITE_SITE_URL" "https://itsfait.com"
update_env_var "VITE_SITE_NAME" "FAIT"
update_env_var "VITE_FROM_EMAIL" "noreply@itsfait.com"

# Production optimizations
echo
log_info "=== Production Optimizations ==="
update_env_var "NODE_ENV" "production"
update_env_var "VITE_BUILD_TARGET" "mobile"
update_env_var "VITE_OPTIMIZE_DEPS" "true"
update_env_var "VITE_MINIFY" "true"
update_env_var "VITE_MOBILE_FIRST" "true"

log_success "Environment configuration completed!"

# Create Google Cloud secrets
echo
log_info "🔐 Creating Google Cloud secrets..."

create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -n "$secret_value" ] && [ "$secret_value" != "your_${secret_name,,}" ]; then
        if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1; then
            log_info "Updating secret: $secret_name"
            echo "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=- --project="$PROJECT_ID"
        else
            log_info "Creating secret: $secret_name"
            echo "$secret_value" | gcloud secrets create "$secret_name" --data-file=- --project="$PROJECT_ID"
        fi
        log_success "Secret $secret_name configured"
    else
        log_warning "Skipping secret $secret_name (no value provided)"
    fi
}

# Source the updated environment
source .env.production

# Create secrets in Google Cloud Secret Manager
create_secret "supabase-url" "${VITE_SUPABASE_URL:-}"
create_secret "supabase-anon-key" "${VITE_SUPABASE_ANON_KEY:-}"
create_secret "supabase-service-role-key" "${SUPABASE_SERVICE_ROLE_KEY:-}"
create_secret "stripe-publishable-key" "${VITE_STRIPE_PUBLISHABLE_KEY:-}"
create_secret "stripe-secret-key" "${STRIPE_SECRET_KEY:-}"
create_secret "stripe-webhook-secret" "${STRIPE_WEBHOOK_SECRET:-}"
create_secret "google-maps-api-key" "${VITE_GOOGLE_MAPS_API_KEY:-}"
create_secret "resend-api-key" "${RESEND_API_KEY:-}"

# Validate configuration
echo
log_info "🔍 Validating configuration..."

validate_url() {
    local url=$1
    local name=$2
    
    if [[ $url =~ ^https?:// ]]; then
        log_success "$name URL format is valid"
    else
        log_error "$name URL format is invalid: $url"
    fi
}

validate_key() {
    local key=$1
    local name=$2
    local prefix=$3
    
    if [[ $key == $prefix* ]] && [ ${#key} -gt 20 ]; then
        log_success "$name key format is valid"
    else
        log_error "$name key format is invalid or too short"
    fi
}

# Validate Supabase
if [ -n "${VITE_SUPABASE_URL:-}" ]; then
    validate_url "$VITE_SUPABASE_URL" "Supabase"
fi

# Validate Stripe
if [ -n "${VITE_STRIPE_PUBLISHABLE_KEY:-}" ]; then
    validate_key "$VITE_STRIPE_PUBLISHABLE_KEY" "Stripe Publishable" "pk_"
fi

if [ -n "${STRIPE_SECRET_KEY:-}" ]; then
    validate_key "$STRIPE_SECRET_KEY" "Stripe Secret" "sk_"
fi

# Display summary
echo
log_info "📋 Configuration Summary:"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Site URL: https://itsfait.com"
echo "Environment file: .env.production"

echo
log_success "🎉 Environment setup completed!"
log_info "Next steps:"
echo "1. Review .env.production file"
echo "2. Deploy Supabase Edge Functions"
echo "3. Run mobile tests"
echo "4. Deploy to Google Cloud Run"
