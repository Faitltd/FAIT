#!/bin/bash

# Monitor GearGrab deployment status

echo "🔧 Monitoring GearGrab Deployment..."
echo "=================================="

PROJECT_ID="fait-geargrab"
SERVICE_NAME="fait-geargrab"
REGION="us-central1"

# Function to check service status
check_service() {
    echo "⏳ Checking deployment status..."
    
    # Check if service exists
    if gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION --format="value(status.url)" 2>/dev/null; then
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION --format="value(status.url)")
        echo "✅ GearGrab deployed successfully!"
        echo "🌐 Service URL: $SERVICE_URL"
        
        # Test health endpoint
        echo "🏥 Testing health endpoint..."
        if curl -s "$SERVICE_URL/health" | grep -q "GearGrab"; then
            echo "✅ Health check passed!"
            echo "🎉 GearGrab is live and working!"
        else
            echo "⚠️  Health check failed or service not ready yet"
        fi
        
        return 0
    else
        echo "⏳ Service not yet deployed..."
        return 1
    fi
}

# Monitor deployment
echo "Starting monitoring (will check every 30 seconds for up to 10 minutes)..."
for i in {1..20}; do
    echo ""
    echo "Check #$i ($(date))"
    
    if check_service; then
        echo ""
        echo "🎯 Deployment monitoring complete!"
        echo "📱 You can now access GearGrab at the URL above"
        exit 0
    fi
    
    if [ $i -lt 20 ]; then
        echo "⏰ Waiting 30 seconds before next check..."
        sleep 30
    fi
done

echo ""
echo "⚠️  Deployment is taking longer than expected."
echo "💡 Check GitHub Actions for deployment status:"
echo "   https://github.com/Faitltd/fait-coop-platform/actions"
echo ""
echo "🔍 Manual check command:"
echo "   gcloud run services list --project=$PROJECT_ID --region=$REGION"
