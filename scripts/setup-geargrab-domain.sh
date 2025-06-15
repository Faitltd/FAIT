#!/bin/bash

# Setup custom domain for GearGrab
# Domain: www.geargrab.co (hosted at GoDaddy)

echo "🌐 Setting up custom domain for GearGrab"
echo "========================================"

PROJECT_ID="fait-geargrab"
SERVICE_NAME="fait-geargrab"
REGION="us-central1"
DOMAIN="www.geargrab.co"

# Step 1: Verify service is deployed
echo "📋 Step 1: Verifying GearGrab service is deployed..."
if ! gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION >/dev/null 2>&1; then
    echo "❌ Error: GearGrab service not found!"
    echo "💡 Please ensure the service is deployed first."
    exit 1
fi

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION --format="value(status.url)")
echo "✅ Service found: $SERVICE_URL"

# Step 2: Add custom domain mapping
echo ""
echo "📋 Step 2: Adding custom domain mapping..."
echo "🔧 Mapping $DOMAIN to $SERVICE_NAME..."

gcloud run domain-mappings create \
    --service=$SERVICE_NAME \
    --domain=$DOMAIN \
    --region=$REGION \
    --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "✅ Domain mapping created successfully!"
else
    echo "❌ Failed to create domain mapping"
    echo "💡 You may need to verify domain ownership first"
fi

# Step 3: Get DNS configuration
echo ""
echo "📋 Step 3: Getting DNS configuration for GoDaddy..."
echo "🔍 Retrieving DNS records needed..."

# Get the DNS records
RECORDS=$(gcloud run domain-mappings describe $DOMAIN --region=$REGION --project=$PROJECT_ID --format="value(status.resourceRecords[].name,status.resourceRecords[].rrdata)" 2>/dev/null)

if [ -n "$RECORDS" ]; then
    echo ""
    echo "📝 DNS Records to configure in GoDaddy:"
    echo "======================================"
    echo "$RECORDS" | while read line; do
        if [ -n "$line" ]; then
            echo "Record: $line"
        fi
    done
    
    echo ""
    echo "🎯 GoDaddy Configuration Steps:"
    echo "1. Log into your GoDaddy account"
    echo "2. Go to DNS Management for geargrab.co"
    echo "3. Add the CNAME records shown above"
    echo "4. Wait for DNS propagation (5-30 minutes)"
    
else
    echo "⚠️  Could not retrieve DNS records yet"
    echo "💡 Try running this command again in a few minutes"
fi

# Step 4: Verification
echo ""
echo "📋 Step 4: Verification steps..."
echo "🔍 After configuring DNS in GoDaddy:"
echo ""
echo "1. Test DNS propagation:"
echo "   dig $DOMAIN"
echo ""
echo "2. Test HTTPS access:"
echo "   curl -I https://$DOMAIN/health"
echo ""
echo "3. Open in browser:"
echo "   https://$DOMAIN"
echo ""
echo "🎉 Once DNS propagates, GearGrab will be live at https://$DOMAIN!"
