#!/bin/bash

# GitHub preparation script for Scalable Resume Ranking project
# This script adds only the necessary files to git for GitHub

echo "Preparing project for GitHub..."

# Make sure we're in the project root directory
cd "$(dirname "$0")"

# Remove all files from git tracking (but keep them on disk)
echo "Resetting git tracking..."
git rm -r --cached .

# Add only necessary files to git
echo "Adding necessary files to git..."

# Frontend core files
git add frontend/src/
git add frontend/public/
git add frontend/package.json
git add frontend/README.md
git add frontend/pre-deploy.js
git add frontend/troubleshooting.md

# Lambda function
git add lambda_view_resume/

# Project root files
git add .gitignore
git add README.md
git add Dockerfile
git add Dockerfile.aws.lambda
git add docker-compose.yml
git add github-prepare.sh

# Show git status
echo "Current git status:"
git status

echo ""
echo "Project is now ready for GitHub!"
echo "Review the changes with 'git status' and then commit with:"
echo "git commit -m \"Clean project for GitHub\""
echo "git push origin main" 