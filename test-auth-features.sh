#!/bin/bash

# Test script for authentication features
# This script tests all authentication features including OAuth, MFA, and session management

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Authentication Features Test${NC}"
echo "========================================"

# Check if Supabase is running
echo -e "${YELLOW}Checking if Supabase is running...${NC}"
if curl -s http://localhost:54321/health > /dev/null; then
  echo -e "${GREEN}Supabase is running.${NC}"
else
  echo -e "${RED}Supabase is not running. Please start Supabase with 'npx supabase start' and try again.${NC}"
  exit 1
fi

# Check if development server is running
echo -e "${YELLOW}Checking if development server is running...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
  echo -e "${GREEN}Development server is running.${NC}"
else
  echo -e "${RED}Development server is not running. Please start the development server with 'npm run dev' and try again.${NC}"
  exit 1
fi

# Test basic authentication
echo -e "\n${YELLOW}Testing basic authentication...${NC}"
echo "----------------------------------------"
npx cypress run --spec "cypress/e2e/simple-login.cy.js"

# Test OAuth authentication
echo -e "\n${YELLOW}Testing OAuth authentication...${NC}"
echo "----------------------------------------"
npx cypress run --spec "cypress/e2e/auth/oauth-login.cy.js"

# Test MFA
echo -e "\n${YELLOW}Testing MFA...${NC}"
echo "----------------------------------------"
npx cypress run --spec "cypress/e2e/auth/mfa.cy.js"

# Test session management
echo -e "\n${YELLOW}Testing session management...${NC}"
echo "----------------------------------------"
npx cypress run --spec "cypress/e2e/auth/session-management.cy.js"

# Test login/logout button
echo -e "\n${YELLOW}Testing login/logout button...${NC}"
echo "----------------------------------------"
npx cypress run --spec "cypress/e2e/auth/login-logout-button.cy.js"

echo -e "\n${GREEN}Authentication Features Test Completed${NC}"
echo "========================================"
