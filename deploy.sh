#!/bin/bash

# FAIT Deployment Script
# This script helps deploy the FAIT site to GitHub and Google Cloud Run

set -e

echo "🚀 FAIT Deployment Script"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        print_warning "Google Cloud CLI is not installed. Cloud Run deployment will be skipped."
        SKIP_CLOUD_RUN=true
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Local Docker build will be skipped."
        SKIP_DOCKER=true
    fi
    
    print_success "Dependencies checked"
}

# Build the application
build_app() {
    print_status "Building the application..."
    npm run build
    print_success "Application built successfully"
}

# GitHub deployment
deploy_to_github() {
    print_status "Preparing GitHub deployment..."
    
    echo "Please create a new repository on GitHub for FAIT:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: fait-site"
    echo "3. Description: FAIT - Professional Services Platform"
    echo "4. Make it public or private as needed"
    echo "5. Do NOT initialize with README, .gitignore, or license"
    echo ""
    read -p "Enter the GitHub repository URL (e.g., https://github.com/username/fait-site.git): " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        print_error "Repository URL is required"
        exit 1
    fi
    
    print_status "Adding GitHub remote..."
    git remote add origin "$REPO_URL"
    
    print_status "Pushing to GitHub..."
    git push -u origin master
    
    print_success "Successfully deployed to GitHub: $REPO_URL"
}

# Docker build
build_docker() {
    if [ "$SKIP_DOCKER" = true ]; then
        print_warning "Skipping Docker build (Docker not installed)"
        return
    fi
    
    print_status "Building Docker image..."
    docker build -t fait-site:latest .
    print_success "Docker image built successfully"
}

# Cloud Run deployment
deploy_to_cloud_run() {
    if [ "$SKIP_CLOUD_RUN" = true ]; then
        print_warning "Skipping Cloud Run deployment (gcloud not installed)"
        return
    fi
    
    print_status "Preparing Cloud Run deployment..."
    
    # Check if user is logged in to gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_status "Please log in to Google Cloud..."
        gcloud auth login
    fi
    
    # Get project ID
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        read -p "Enter your Google Cloud Project ID: " PROJECT_ID
        gcloud config set project "$PROJECT_ID"
    fi
    
    print_status "Using project: $PROJECT_ID"
    
    # Enable required APIs
    print_status "Enabling required APIs..."
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    # Build and deploy
    print_status "Building and deploying to Cloud Run..."
    gcloud builds submit --tag gcr.io/$PROJECT_ID/fait-site
    
    gcloud run deploy fait-site \
        --image gcr.io/$PROJECT_ID/fait-site \
        --region us-central1 \
        --platform managed \
        --allow-unauthenticated \
        --port 3000 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe fait-site --region us-central1 --format 'value(status.url)')
    print_success "Successfully deployed to Cloud Run: $SERVICE_URL"
}

# Clean up old versions
cleanup_old_versions() {
    print_status "Cleaning up old versions..."
    
    # Remove any old build artifacts
    rm -rf .svelte-kit/output
    rm -rf build
    
    print_success "Cleanup completed"
}

# Main deployment flow
main() {
    echo "Starting FAIT deployment process..."
    echo ""
    
    check_dependencies
    cleanup_old_versions
    build_app
    
    echo ""
    echo "Choose deployment options:"
    echo "1. Deploy to GitHub only"
    echo "2. Deploy to Cloud Run only"
    echo "3. Deploy to both GitHub and Cloud Run"
    echo "4. Build Docker image only"
    echo ""
    read -p "Enter your choice (1-4): " CHOICE
    
    case $CHOICE in
        1)
            deploy_to_github
            ;;
        2)
            build_docker
            deploy_to_cloud_run
            ;;
        3)
            deploy_to_github
            build_docker
            deploy_to_cloud_run
            ;;
        4)
            build_docker
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 FAIT deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "- Set up custom domain (if using Cloud Run)"
    echo "- Configure environment variables"
    echo "- Set up monitoring and logging"
    echo "- Configure GitHub Actions secrets for CI/CD"
}

# Run main function
main "$@"
