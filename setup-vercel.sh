#!/bin/bash

# This script helps you deploy your project to Vercel
# You'll need to have the Vercel CLI installed

echo "Setting up Vercel deployment for FAIT Co-op Platform"
echo "==================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI is not installed. Installing now..."
  npm install -g vercel
fi

# Ask for environment variables
echo "Please provide the following environment variables for your Vercel deployment:"
echo ""

read -p "VITE_SUPABASE_URL: " SUPABASE_URL
read -p "VITE_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "VITE_GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "VITE_STRIPE_PUBLIC_KEY: " STRIPE_PUBLIC_KEY

# Create .vercel directory if it doesn't exist
mkdir -p .vercel

# Create project.json file
cat > .vercel/project.json << EOF
{
  "projectId": "fait-coop-platform",
  "orgId": "personal",
  "settings": {
    "framework": "vite",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "devCommand": "npm run dev",
    "installCommand": "npm install"
  }
}
EOF

# Create .env.production file for Vercel
cat > .env.production << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
VITE_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
EOF

echo ""
echo "Environment variables set up successfully!"
echo ""
echo "To deploy to Vercel, run:"
echo "vercel"
echo ""
echo "This will guide you through the deployment process."
echo "When asked, choose to link to an existing project and select your GitHub repository."
echo ""
echo "After deployment, your site will be available at the URL provided by Vercel."
