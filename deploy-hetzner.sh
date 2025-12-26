#!/bin/bash
# FAIT Hetzner VPS Deployment Script
# Deploy FAIT application to Hetzner Cloud server

set -e

# Configuration
SERVER_USER="root"
SERVER_HOST="65.21.246.15"
REPO_PATH="/srv/itsfait.com"
REPO_URL="https://github.com/Faitltd/FAIT.git"
BRANCH="main"
CONTAINER_NAME="fait-frontend"
IMAGE_NAME="fait-frontend:latest"
APP_PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🚀 FAIT Hetzner Deployment Script"
echo "=================================="
echo ""

# Check SSH connection
print_status "Checking SSH connection to $SERVER_HOST..."
if ! ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'" > /dev/null 2>&1; then
    print_error "Cannot connect to server. Please check:"
    echo "  1. Server IP: $SERVER_HOST"
    echo "  2. SSH key is configured"
    echo "  3. Server is running"
    exit 1
fi
print_success "SSH connection verified"

# Deploy function
deploy_to_server() {
    print_status "Deploying to Hetzner server..."
    
    ssh "$SERVER_USER@$SERVER_HOST" bash -s <<'EOF'
set -e

echo "📦 Setting up repository..."

# Install dependencies if needed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    apt-get update
    apt-get install -y git
fi

# Create repo directory if it doesn't exist
if [ ! -d "/srv/itsfait.com" ]; then
    echo "Cloning repository..."
    mkdir -p "/srv/itsfait.com"
    git clone https://github.com/Faitltd/FAIT.git /srv/itsfait.com
    cd /srv/itsfait.com
    git checkout main
else
    echo "Updating repository..."
    cd /srv/itsfait.com
    git fetch origin
    git checkout main
    git pull origin main
fi

echo "✅ Repository updated"

echo "🐳 Building Docker image..."

# Stop and remove existing container if it exists
if docker ps -a | grep -q fait-frontend; then
    echo "Stopping existing container..."
    docker stop fait-frontend || true
    docker rm fait-frontend || true
fi

# Remove old image if exists
if docker images | grep -q fait-frontend; then
    echo "Removing old image..."
    docker rmi fait-frontend:latest || true
fi

# Build new image
echo "Building new Docker image..."
cd /srv/itsfait.com
docker build -f docker/frontend/Dockerfile -t fait-frontend:latest .

echo "✅ Docker image built"

echo "🚀 Starting container..."

# Check if .env file exists
if [ ! -f "/srv/itsfait.com/.env" ]; then
    echo "⚠️  WARNING: .env file not found at /srv/itsfait.com/.env"
    echo "Please create it with required environment variables"
    echo "You can use .env.example as a template"
fi

# Run container
docker run -d \
    --name fait-frontend \
    -p 3000:3000 \
    --restart unless-stopped \
    --env-file /srv/itsfait.com/.env \
    fait-frontend:latest

echo "✅ Container started"

# Show container status
echo ""
echo "📊 Container Status:"
docker ps | grep fait-frontend

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Application should be available at: http://65.21.246.15:3000"
echo ""
echo "📝 Useful commands:"
echo "  View logs: docker logs -f fait-frontend"
echo "  Restart: docker restart fait-frontend"
echo "  Stop: docker stop fait-frontend"
EOF

    if [ $? -eq 0 ]; then
        print_success "Deployment completed successfully!"
        echo ""
        echo "🌐 Application URL: http://$SERVER_HOST:$APP_PORT"
        echo ""
        echo "Next steps:"
        echo "  1. Ensure .env file is configured on server at: $REPO_PATH/.env"
        echo "  2. Run Supabase migrations (see DEPLOYMENT-HETZNER.md)"
        echo "  3. Set up Caddy/Nginx for HTTPS (optional)"
        echo "  4. Configure domain DNS to point to $SERVER_HOST"
    else
        print_error "Deployment failed. Check the logs above for details."
        exit 1
    fi
}

# View logs function
view_logs() {
    print_status "Viewing container logs..."
    ssh "$SERVER_USER@$SERVER_HOST" "docker logs -f $CONTAINER_NAME"
}

# Status function
check_status() {
    print_status "Checking deployment status..."
    ssh "$SERVER_USER@$SERVER_HOST" bash -s <<'EOF'
echo "📊 Container Status:"
if docker ps | grep -q fait-frontend; then
    docker ps | grep fait-frontend
    echo ""
    echo "✅ Container is running"
    echo "🌐 Application URL: http://65.21.246.15:3000"
else
    echo "❌ Container is not running"
    echo ""
    echo "Recent logs:"
    docker logs --tail 50 fait-frontend 2>&1 || echo "No logs available"
fi
EOF
}

# Main menu
echo "Choose an action:"
echo "1. Deploy/Update application"
echo "2. View logs"
echo "3. Check status"
echo "4. Exit"
echo ""
read -p "Enter your choice (1-4): " CHOICE

case $CHOICE in
    1)
        deploy_to_server
        ;;
    2)
        view_logs
        ;;
    3)
        check_status
        ;;
    4)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac
