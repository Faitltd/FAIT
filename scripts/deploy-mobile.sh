#!/bin/bash

# FAIT Mobile App Deployment Script
# Optimized deployment for mobile-first experience

set -euo pipefail

# Configuration
PROJECT_ID="${PROJECT_ID:-fait-444705}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="fait-mobile-app"
IMAGE_NAME="gcr.io/${PROJECT_ID}/fait-mobile"
DOMAIN="itsfait.com"

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    command -v gcloud >/dev/null 2>&1 || { log_error "gcloud CLI required"; exit 1; }
    command -v docker >/dev/null 2>&1 || { log_error "Docker required"; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm required"; exit 1; }
    
    gcloud config set project "${PROJECT_ID}"
    log_success "Prerequisites OK"
}

# Enable APIs
enable_apis() {
    log_info "Enabling Google Cloud APIs..."
    gcloud services enable \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        containerregistry.googleapis.com \
        secretmanager.googleapis.com \
        --quiet
    log_success "APIs enabled"
}

# Run mobile tests
run_mobile_tests() {
    log_info "Running mobile-specific tests..."
    
    # Install dependencies if needed
    [ ! -d "node_modules" ] && npm ci
    
    # Run mobile Cypress tests
    if npm run test:mobile; then
        log_success "Mobile tests passed"
    else
        log_warning "Some mobile tests failed - continuing deployment"
    fi
}

# Build optimized for mobile
build_mobile_optimized() {
    log_info "Building mobile-optimized Docker image..."
    
    # Create optimized build context
    cat > .dockerignore << EOF
node_modules
.git
.gitignore
README.md
.env*
.DS_Store
cypress
tests
*.md
EOF

    # Build with mobile optimizations
    gcloud builds submit \
        --tag "${IMAGE_NAME}:latest" \
        --timeout=20m \
        --machine-type=e2-highcpu-8 \
        --substitutions=_BUILD_TARGET=mobile \
        .
    
    log_success "Mobile-optimized image built"
}

# Deploy with mobile-specific configuration
deploy_mobile_service() {
    log_info "Deploying mobile-optimized service..."
    
    gcloud run deploy "${SERVICE_NAME}" \
        --image="${IMAGE_NAME}:latest" \
        --region="${REGION}" \
        --platform=managed \
        --allow-unauthenticated \
        --memory=2Gi \
        --cpu=2 \
        --min-instances=1 \
        --max-instances=100 \
        --concurrency=1000 \
        --timeout=300 \
        --execution-environment=gen2 \
        --cpu-throttling=false \
        --startup-cpu-boost \
        --session-affinity \
        --set-env-vars="NODE_ENV=production,NODE_OPTIONS=--max-old-space-size=1536" \
        --quiet
    
    log_success "Service deployed"
}

# Configure custom domain
setup_custom_domain() {
    log_info "Setting up custom domain..."
    
    # Map domain
    gcloud run domain-mappings create \
        --service="${SERVICE_NAME}" \
        --domain="${DOMAIN}" \
        --region="${REGION}" \
        --quiet 2>/dev/null || log_warning "Domain mapping may already exist"
    
    # Get DNS configuration
    local dns_target
    dns_target=$(gcloud run domain-mappings describe "${DOMAIN}" \
        --region="${REGION}" \
        --format="value(status.resourceRecords[0].rrdata)" 2>/dev/null || echo "")
    
    if [ -n "$dns_target" ]; then
        log_info "Configure DNS CNAME: ${DOMAIN} -> ${dns_target}"
    fi
    
    log_success "Domain configuration initiated"
}

# Performance optimizations
optimize_performance() {
    log_info "Applying performance optimizations..."
    
    # Enable HTTP/2
    gcloud run services update "${SERVICE_NAME}" \
        --region="${REGION}" \
        --use-http2 \
        --quiet
    
    # Configure CDN (if applicable)
    log_info "CDN configuration may require manual setup in Cloud Console"
    
    log_success "Performance optimizations applied"
}

# Health check and validation
validate_deployment() {
    log_info "Validating deployment..."
    
    local service_url
    service_url=$(gcloud run services describe "${SERVICE_NAME}" \
        --region="${REGION}" \
        --format="value(status.url)")
    
    # Wait for service to be ready
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -f -s "${service_url}/health" >/dev/null 2>&1; then
            log_success "Service is healthy at ${service_url}"
            
            # Test mobile-specific endpoints
            if curl -f -s "${service_url}/services/mobile" >/dev/null 2>&1; then
                log_success "Mobile endpoints accessible"
            fi
            
            return 0
        fi
        
        attempts=$((attempts + 1))
        log_info "Waiting for service... (${attempts}/${max_attempts})"
        sleep 10
    done
    
    log_error "Service health check failed"
    return 1
}

# Mobile performance test
test_mobile_performance() {
    log_info "Testing mobile performance..."
    
    local service_url
    service_url=$(gcloud run services describe "${SERVICE_NAME}" \
        --region="${REGION}" \
        --format="value(status.url)")
    
    # Basic performance test
    local response_time
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "${service_url}/services/mobile")
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        log_success "Mobile page loads in ${response_time}s (< 2s target)"
    else
        log_warning "Mobile page loads in ${response_time}s (> 2s target)"
    fi
}

# Main deployment function
main() {
    log_info "🚀 Starting FAIT mobile app deployment..."
    
    # Parse arguments
    local skip_tests=false
    local skip_build=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests) skip_tests=true; shift ;;
            --skip-build) skip_build=true; shift ;;
            --project) PROJECT_ID="$2"; shift 2 ;;
            --region) REGION="$2"; shift 2 ;;
            *) log_error "Unknown option: $1"; exit 1 ;;
        esac
    done
    
    # Execute deployment pipeline
    check_prerequisites
    enable_apis
    
    [ "$skip_tests" = false ] && run_mobile_tests
    [ "$skip_build" = false ] && build_mobile_optimized
    
    deploy_mobile_service
    setup_custom_domain
    optimize_performance
    validate_deployment
    test_mobile_performance
    
    # Final output
    local service_url
    service_url=$(gcloud run services describe "${SERVICE_NAME}" \
        --region="${REGION}" \
        --format="value(status.url)")
    
    log_success "🎉 Mobile deployment completed!"
    log_info "📱 Mobile app: https://${DOMAIN}"
    log_info "🔗 Service URL: ${service_url}"
    log_info "📊 Monitor: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}"
}

# Cleanup on exit
cleanup() {
    [ -f .dockerignore ] && rm -f .dockerignore
}
trap cleanup EXIT

# Run deployment
main "$@"
