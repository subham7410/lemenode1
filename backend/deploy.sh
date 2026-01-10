#!/bin/bash
# deploy.sh - One-command deployment

set -e

# Configuration
SERVICE_NAME="lemenode-backend"
REGION="asia-south1"

# Load API key from .env if exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check for API key
if [ -z "$GEMINI_API_KEY" ]; then
    echo "ERROR: GEMINI_API_KEY not set"
    echo "Set it in .env file or export GEMINI_API_KEY=your-key"
    exit 1
fi

echo "🚀 Deploying $SERVICE_NAME to $REGION..."

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 3 \
    --concurrency 80 \
    --timeout 30s \
    --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,CORS_ORIGINS=*"

echo "✅ Deployment complete!"
echo "🔗 Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
