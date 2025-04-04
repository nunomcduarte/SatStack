#!/bin/bash

# Initialize the Git repository
echo "Initializing Git repository..."
git init

# Add all files to Git
echo "Adding files to Git..."
git add .

# Create an initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: SatStack Bitcoin transaction tracking and tax reporting application"

# Instructions for setting up GitHub repository
echo ""
echo "✅ Git repository initialized successfully!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Connect your local repository to GitHub:"
echo "   git remote add origin https://github.com/yourusername/satstack.git"
echo "3. Push your code to GitHub:"
echo "   git push -u origin main"
echo ""
echo "Happy coding! 🚀"

# Note: Make this script executable with: chmod +x setup-git.sh 