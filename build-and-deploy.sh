#!/bin/bash
set -e

# Build the enhanced version of the application
echo "Building the enhanced version of the application..."
npm run build:enhanced

# Create a temporary directory for Docker build
echo "Creating temporary directory for Docker build..."
mkdir -p docker-build
cp -r dist/* docker-build/

# Copy authentication fix files and service worker
echo "Copying authentication fix files and service worker..."
mkdir -p docker-build
cp public/auth-fix.js docker-build/
cp public/auth-fix.html docker-build/
cp public/service-worker-fixed.js docker-build/service-worker.js
cp public/offline.html docker-build/

# Create a Dockerfile in the temporary directory
echo "Creating Dockerfile..."
cat > docker-build/Dockerfile << 'EOF'
FROM nginx:alpine

# Copy the built application
COPY . /usr/share/nginx/html

# Create a default nginx config that listens on port 8080
RUN echo 'server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # Enable gzip compression for better performance \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    gzip_comp_level 6; \
    gzip_min_length 1000; \
}' > /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build the Docker image
echo "Building Docker image..."
cd docker-build
docker build --platform linux/amd64 -t gcr.io/fait-444705/fait-coop:latest .

# Push the Docker image to Google Container Registry
echo "Pushing Docker image to Google Container Registry..."
docker push gcr.io/fait-444705/fait-coop:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy fait-coop --image gcr.io/fait-444705/fait-coop:latest --platform managed --region us-central1 --allow-unauthenticated

# Clean up
echo "Cleaning up..."
cd ..
rm -rf docker-build

echo "Deployment complete!"
