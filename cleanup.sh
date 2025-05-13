#!/bin/bash

# Cleanup script for Scalable Resume Ranking project
# This script prepares the project for GitHub by removing unnecessary files

echo "Cleaning up project for GitHub..."

# Remove unnecessary directories
echo "Removing unnecessary directories..."
rm -rf frontend/build
rm -rf frontend/node_modules
rm -rf frontend/archive
rm -rf frontend/backup
rm -rf frontend-demo
rm -rf archive

# Remove unnecessary files
echo "Removing unnecessary files..."
rm -f frontend/.DS_Store
rm -f .DS_Store
rm -f **/.DS_Store
rm -f response.json response2.json
rm -f output.json output2.json
rm -f jd-response.json
rm -f frontend/main.js frontend/main_latest.js
rm -f main.js
rm -f lambda_view_resume.zip
rm -f frontend/api-client.js.backup frontend/api.js.old

# Remove temporary and debug files
echo "Removing temporary and debug files..."
find . -name "*.log" -type f -delete
find . -name "*.tmp" -type f -delete

# Create a list of necessary files for GitHub
echo "Creating list of necessary files for GitHub..."
cat > necessary_files.txt << EOL
# Necessary files for GitHub

## Frontend Core
frontend/src/
frontend/public/
frontend/package.json
frontend/README.md
frontend/pre-deploy.js
frontend/troubleshooting.md

## Lambda Function
lambda_view_resume/

## Project Root
.gitignore
README.md
Dockerfile
Dockerfile.aws.lambda
docker-compose.yml
EOL

echo "Cleanup complete!"
echo "See necessary_files.txt for a list of files that should be committed to GitHub."
echo "Run 'git add [files]' to stage the necessary files for commit." 