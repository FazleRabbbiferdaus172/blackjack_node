#!/bin/bash

# Blackjack Backend Deployment Script
set -e

echo "🚀 Starting deployment of Blackjack backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
rm -rf lambda-package
mkdir -p lambda-package

# Copy built files and dependencies
cp -r dist/* lambda-package/
cp -r node_modules lambda-package/
cp package.json lambda-package/

# Create zip file
cd lambda-package
zip -r ../lambda-deployment.zip . > /dev/null
cd ..

echo "📊 Package size: $(du -h lambda-deployment.zip | cut -f1)"

# Update Lambda function
echo "☁️ Updating Lambda function..."
aws lambda update-function-code \
    --function-name blackjack-node-app \
    --zip-file fileb://lambda-deployment.zip \
    --region us-east-2

echo "✅ Deployment completed successfully!"
echo "🎯 Function: blackjack-node-app"
echo "�� Region: us-east-2" 