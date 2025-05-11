#!/bin/bash

# Directory paths (edit if your structure changes)
ROOT_DIR="$(cd "$(dirname "$0")"; pwd)"
WEBHOOK_DIR="$ROOT_DIR/stripe-webhook-service"
API_DIR="$ROOT_DIR/api"

# Detect OS for opening new terminal tabs
open_new_tab_mac() {
  osascript &>/dev/null <<EOF
tell application "Terminal"
  activate
  do script "$1"
end tell
EOF
}

open_new_tab_linux() {
  gnome-terminal -- bash -c "$1; exec bash"
}

start_service() {
  local dir="$1"
  local cmd="$2"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open_new_tab_mac "cd \"$dir\" && $cmd"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    open_new_tab_linux "cd \"$dir\" && $cmd"
  else
    echo "Unsupported OS. Open a new terminal and run: cd \"$dir\" && $cmd"
  fi
}

echo "Launching FAIT 2.0 platform services..."

# Start Frontend (Vite)
start_service "$ROOT_DIR" "npm run dev"

# Start Stripe Webhook Service
start_service "$WEBHOOK_DIR" "npm run dev"

# Start API Backend (if present)
if [ -d "$API_DIR" ] && [ -f "$API_DIR/package.json" ]; then
  start_service "$API_DIR" "npm run dev"
else
  echo "API directory not found; skipping API startup."
fi

echo "All services launch scripts have been issued."
echo "If you don't see a tab open, run each command manually in a new terminal:
  cd \"$ROOT_DIR\" && npm run dev
  cd \"$WEBHOOK_DIR\" && npm run dev
  cd \"$API_DIR\" && npm run dev (if applicable)"