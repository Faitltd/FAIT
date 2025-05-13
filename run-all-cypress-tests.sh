#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Create results directory
RESULTS_DIR="cypress/results"
mkdir -p $RESULTS_DIR

# Function to print section headers
print_header() {
  echo -e "\n${BLUE}======================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}======================================${NC}\n"
}

# Function to print status messages
print_status() {
  echo -e "${YELLOW}$1${NC}"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}$1${NC}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}$1${NC}"
}

# Function to run tests for a specific project
run_project_tests() {
  local project_name=$1
  local project_path=$2
  local spec_pattern=$3
  local port=$4
  local start_command=$5

  print_header "Running tests for $project_name"

  # Check if we need to start a server
  local server_pid=""
  if [ ! -z "$start_command" ]; then
    print_status "Starting server with command: $start_command"
    eval "$start_command" &
    server_pid=$!
    print_status "Server started with PID: $server_pid"

    # Wait for server to be ready
    print_status "Waiting for server to be ready..."
    sleep 5
  fi

  # Run the tests
  print_status "Running Cypress tests..."

  if [ -z "$spec_pattern" ]; then
    # Run all tests in the project
    npx cypress run --project $project_path --config baseUrl=http://localhost:$port
  else
    # Run specific tests
    npx cypress run --project $project_path --config baseUrl=http://localhost:$port --spec "$spec_pattern"
  fi

  # Store the exit code
  local exit_code=$?

  # Kill the server if we started one
  if [ ! -z "$server_pid" ]; then
    print_status "Stopping server (PID: $server_pid)..."
    kill $server_pid
    wait $server_pid 2>/dev/null
    print_status "Server stopped."
  fi

  # Return the exit code
  return $exit_code
}

# Main test execution
print_header "FAIT Monorepo Cypress Tests"

# Track overall success
OVERALL_SUCCESS=true

# Run root-level tests
print_header "Running root-level tests"

# Start the main app
print_status "Starting the main app..."
cd fait-mono
npm run dev &
MAIN_APP_PID=$!
print_status "Main app started with PID: $MAIN_APP_PID"

# Wait for the app to be ready
print_status "Waiting for main app to be ready..."
sleep 10

# Run the tests
npx cypress run --spec "cypress/e2e/**/*.cy.js"
if [ $? -ne 0 ]; then
  print_error "Root-level tests failed!"
  OVERALL_SUCCESS=false
else
  print_success "Root-level tests passed!"
fi

# Kill the main app
print_status "Stopping main app (PID: $MAIN_APP_PID)..."
kill $MAIN_APP_PID
wait $MAIN_APP_PID 2>/dev/null
print_status "Main app stopped."

cd ..

# Run Home Depot Scraper tests
print_status "Setting up Home Depot Scraper..."
cd fait-mono/tools/home-depot-scraper
python3 -m pip install -r requirements.txt > /dev/null 2>&1
run_project_tests "Home Depot Scraper" "." "cypress/e2e/**/*.cy.js" 5000 "python3 app.py"
if [ $? -ne 0 ]; then
  print_error "Home Depot Scraper tests failed!"
  OVERALL_SUCCESS=false
else
  print_success "Home Depot Scraper tests passed!"
fi
cd ../../..

# Run Handyman Calculator tests
print_status "Setting up Handyman Calculator..."
cd fait-mono/apps/handyman-calculator
npm install > /dev/null 2>&1
run_project_tests "Handyman Calculator" "." "cypress/e2e/**/*.cy.js" 8082 "npm run start"
if [ $? -ne 0 ]; then
  print_error "Handyman Calculator tests failed!"
  OVERALL_SUCCESS=false
else
  print_success "Handyman Calculator tests passed!"
fi
cd ../../..

# Print final results
print_header "Test Results Summary"
if [ "$OVERALL_SUCCESS" = true ]; then
  print_success "All tests passed successfully!"
else
  print_error "Some tests failed. Check the logs above for details."
  exit 1
fi

print_status "Testing completed!"
exit 0
