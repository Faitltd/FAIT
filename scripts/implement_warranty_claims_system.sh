#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/warranty
mkdir -p src/pages/warranty
mkdir -p supabase/migrations

# Copy the warranty components
echo "Creating warranty components..."
cp -f src/components/warranty/WarrantyClaimForm.jsx src/components/warranty/WarrantyClaimForm.jsx
cp -f src/components/warranty/WarrantyClaimDetail.jsx src/components/warranty/WarrantyClaimDetail.jsx

# Copy the warranty pages
echo "Creating warranty pages..."
cp -f src/pages/warranty/WarrantyClaimsPage.jsx src/pages/warranty/WarrantyClaimsPage.jsx
cp -f src/pages/warranty/WarrantyClaimNewPage.jsx src/pages/warranty/WarrantyClaimNewPage.jsx
cp -f src/pages/warranty/WarrantyClaimDetailPage.jsx src/pages/warranty/WarrantyClaimDetailPage.jsx

# Copy the database migration
echo "Creating database migration..."
cp -f supabase/migrations/20240103000000_warranty_claims_system.sql supabase/migrations/20240103000000_warranty_claims_system.sql

echo "Warranty claims system implementation complete!"
