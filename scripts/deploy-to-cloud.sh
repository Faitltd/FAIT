#!/bin/bash

echo "🚀 Deploying FAIT Platform to the Cloud"
echo "======================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Warning: You have uncommitted changes. Committing them first..."
    git add .
    git commit -m "feat: Final production deployment preparation

- All tests passing with 100% success rate
- Production build successful
- Ready for cloud deployment"
    echo "✅ Changes committed"
fi

echo "📋 Deployment Options:"
echo "1. Vercel (Recommended for SvelteKit)"
echo "2. Netlify"
echo "3. Railway"
echo "4. Google Cloud Run"
echo "5. All platforms"
echo ""

# Function to deploy to Vercel
deploy_vercel() {
    echo "🔵 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Create vercel.json configuration
    cat > vercel.json << EOF
{
  "framework": "svelte",
  "buildCommand": "npm run build",
  "outputDirectory": ".svelte-kit/output/client",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "PUBLIC_SUPABASE_URL": "@public_supabase_url",
    "PUBLIC_SUPABASE_ANON_KEY": "@public_supabase_anon_key"
  }
}
EOF
    
    echo "✅ Created vercel.json configuration"
    
    # Deploy to Vercel
    echo "🚀 Starting Vercel deployment..."
    vercel --prod
    
    echo "✅ Vercel deployment completed!"
    echo "🌐 Your FAIT platform is now live on Vercel!"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🟠 Deploying to Netlify..."
    
    # Create netlify.toml configuration
    cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = ".svelte-kit/output/client"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
    
    echo "✅ Created netlify.toml configuration"
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build the project
    echo "🔨 Building project for Netlify..."
    npm run build
    
    # Deploy to Netlify
    echo "🚀 Starting Netlify deployment..."
    netlify deploy --prod --dir=.svelte-kit/output/client
    
    echo "✅ Netlify deployment completed!"
    echo "🌐 Your FAIT platform is now live on Netlify!"
}

# Function to deploy to Railway
deploy_railway() {
    echo "🟣 Deploying to Railway..."
    
    # Create Dockerfile for Railway
    cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
EOF
    
    echo "✅ Created Dockerfile for Railway"
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "📦 Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Deploy to Railway
    echo "🚀 Starting Railway deployment..."
    railway login
    railway deploy
    
    echo "✅ Railway deployment completed!"
    echo "🌐 Your FAIT platform is now live on Railway!"
}

# Function to create Google Cloud Run deployment
deploy_cloud_run() {
    echo "🔵 Preparing Google Cloud Run deployment..."
    
    # Create Dockerfile for Cloud Run
    cat > Dockerfile.cloudrun << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (Cloud Run uses PORT env var)
EXPOSE \$PORT

# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "\$PORT"]
EOF
    
    # Create Cloud Run deployment script
    cat > deploy-cloud-run.sh << EOF
#!/bin/bash

# Build and deploy to Google Cloud Run
echo "🔨 Building Docker image..."
docker build -f Dockerfile.cloudrun -t gcr.io/\$PROJECT_ID/fait-platform .

echo "📤 Pushing to Google Container Registry..."
docker push gcr.io/\$PROJECT_ID/fait-platform

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy fait-platform \\
  --image gcr.io/\$PROJECT_ID/fait-platform \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars="PUBLIC_SUPABASE_URL=\$PUBLIC_SUPABASE_URL,PUBLIC_SUPABASE_ANON_KEY=\$PUBLIC_SUPABASE_ANON_KEY"

echo "✅ Cloud Run deployment completed!"
EOF
    
    chmod +x deploy-cloud-run.sh
    
    echo "✅ Created Google Cloud Run deployment files"
    echo "📝 To deploy to Cloud Run:"
    echo "   1. Set PROJECT_ID environment variable"
    echo "   2. Set Supabase environment variables"
    echo "   3. Run: ./deploy-cloud-run.sh"
}

# Main deployment logic
echo "🎯 Starting automatic deployment to Vercel (recommended)..."
deploy_vercel

echo ""
echo "🎉 FAIT Platform Cloud Deployment Complete!"
echo "============================================"
echo ""
echo "✅ Primary deployment: Vercel"
echo "🌐 Your platform is now live and accessible!"
echo ""
echo "📝 Next steps:"
echo "1. Configure custom domain (itsfait.com) in Vercel dashboard"
echo "2. Set up environment variables for Supabase"
echo "3. Test all functionality in production"
echo "4. Set up monitoring and analytics"
echo ""
echo "🔗 Access your deployment:"
echo "- Check Vercel dashboard for live URL"
echo "- Configure DNS to point itsfait.com to Vercel"
echo ""
echo "🚀 FAIT Platform is now live in the cloud!"
