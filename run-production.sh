#!/bin/bash

# Stop any running processes on port 3000
echo "Checking for processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Build the Next.js application
echo "Building the application..."
npm run build

# Set environment to production and start
echo "Starting the application in production mode..."
NODE_ENV=production npm run start

# Note: Make this script executable with: chmod +x run-production.sh 