#!/bin/bash

# Update all Suspense fallbacks in App.tsx
sed -i '' 's/<Suspense fallback={<div>Loading...<\/div>}>/<Suspense fallback={<LoadingSpinner \/>}>/g' src/App.tsx

echo "Updated all Suspense fallbacks in App.tsx"
