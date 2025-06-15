#!/bin/bash

# This script sets up Firebase for deployment

# Authenticate with Firebase
echo "Authenticating with Firebase..."
firebase login --reauth

# Set the project
echo "Setting project to fait-444705..."
firebase use fait-444705

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting:fait-coop-react

echo "Firebase setup complete."
