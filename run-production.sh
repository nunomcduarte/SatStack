#!/bin/bash

# This script runs the SatStack application in production mode with the proper environment variables

# Define console colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting SatStack in production mode...${NC}"

# Check if .env.local file exists
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}Warning: .env.local file not found. Using example environment variables.${NC}"
  echo "Please create a .env.local file with proper configuration for production use."
  
  # Copy the example file if it exists
  if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example. Please update with your real configuration."
  fi
fi

# Set production environment
export NODE_ENV=production

# Build the application if it hasn't been built yet
if [ ! -d .next ]; then
  echo -e "${GREEN}Building the application...${NC}"
  npm run build
fi

# Start the application in production mode
echo -e "${GREEN}Starting the server...${NC}"
npm run start

echo -e "${GREEN}Server stopped.${NC}"

# Note: Make this script executable with: chmod +x run-production.sh 