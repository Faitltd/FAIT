#!/bin/bash

# This script helps migrate projects into the FAIT monorepo

# Create directories for each project
mkdir -p apps/fait-coop
mkdir -p apps/offershield
mkdir -p apps/home-health-score
mkdir -p apps/handyman-calculator
mkdir -p apps/flippercalc
mkdir -p apps/remodeling-calculator
mkdir -p tools/home-depot-scraper

# Copy projects to their respective directories
echo "Copying FAIT Coop Vue Conversion..."
cp -r ../fait-coop-vue-conversion/* apps/fait-coop/

echo "Copying OfferShield..."
cp -r ../OfferShield/* apps/offershield/

echo "Copying HomeHealthScore..."
cp -r ../HomeHealthScore/frontend/* apps/home-health-score/
cp -r ../HomeHealthScore/backend apps/home-health-score/backend

echo "Copying While-You're-Here Calculator..."
cp -r "../While-You're-Here-Calculator"/* apps/handyman-calculator/

echo "Copying FlipperCalc..."
cp -r ../FlipperCalc/temp-flipper-calc/* apps/flippercalc/

echo "Copying Remodeling Calculator..."
cp -r ../remodeling-calculator/* apps/remodeling-calculator/

echo "Copying Home Depot Scraper..."
cp -r ../Home-Depot-Scraper-main/* tools/home-depot-scraper/

echo "Migration complete!"
echo "Please check each project and update its configuration to work within the monorepo."
