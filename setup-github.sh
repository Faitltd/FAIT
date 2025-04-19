#!/bin/bash

# This script helps you push your code to GitHub
# You'll need to have a GitHub account and a personal access token

echo "Setting up GitHub repository for FAIT Co-op Platform"
echo "===================================================="
echo ""

# Ask for GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Ask for repository name
read -p "Enter repository name (default: fait-coop-platform): " REPO_NAME
REPO_NAME=${REPO_NAME:-fait-coop-platform}

# Ask if the repository should be public or private
read -p "Should the repository be public? (y/n, default: y): " IS_PUBLIC
IS_PUBLIC=${IS_PUBLIC:-y}

if [[ $IS_PUBLIC == "y" ]]; then
  VISIBILITY="public"
else
  VISIBILITY="private"
fi

# Ask for personal access token
read -sp "Enter your GitHub personal access token (will not be displayed): " GITHUB_TOKEN
echo ""

echo "Creating GitHub repository: $REPO_NAME ($VISIBILITY)"

# Create the repository using GitHub API
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":$([ "$VISIBILITY" == "private" ] && echo "true" || echo "false"),\"description\":\"FAIT Co-op Platform - A cooperative marketplace connecting clients with service agents\"}")

# Check if repository was created successfully
if echo "$RESPONSE" | grep -q "\"name\":\"$REPO_NAME\""; then
  echo "Repository created successfully!"
else
  echo "Failed to create repository. Error:"
  echo "$RESPONSE"
  exit 1
fi

# Configure Git
echo "Configuring Git..."

# Check if we're on the main branch, if not create it
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Creating main branch..."
  git checkout -b main
fi

# Add all files
echo "Adding files to Git..."
git add .

# Commit
echo "Committing files..."
git commit -m "Initial commit"

# Add remote
echo "Adding GitHub remote..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push to GitHub
echo "Pushing to GitHub..."
echo "You'll be prompted for your GitHub username and password/token"
git push -u origin main

echo ""
echo "Setup complete! Your code is now on GitHub at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "Next steps:"
echo "1. Set up Vercel for deployment:"
echo "   - Go to https://vercel.com/"
echo "   - Sign up or log in"
echo "   - Import your GitHub repository"
echo "   - Configure environment variables"
echo "   - Deploy!"
echo ""
echo "2. Your site will be available at: https://$REPO_NAME-$GITHUB_USERNAME.vercel.app"
