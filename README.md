# Scalable Resume Ranking System

A web application that uses AWS services to rank resumes against job descriptions, helping recruiters find the best candidates.

## Project Structure

The project is organized into these main components:

### Frontend

The frontend is a React application that allows users to:
- Upload resumes
- Enter job descriptions
- View ranked results
- Filter candidates

**Key directories and files:**
- `frontend/src/` - React source code
- `frontend/public/` - Static files
- `frontend/package.json` - Dependencies and scripts

### Lambda Functions

AWS Lambda functions that power the backend:
- `lambda_view_resume/` - Function for viewing resume files

## Required Files for GitHub

Only the following files and directories should be committed to GitHub:

### Frontend
- `frontend/src/`
- `frontend/public/`
- `frontend/package.json`
- `frontend/README.md`
- `frontend/pre-deploy.js`
- `frontend/troubleshooting.md`

### Lambda Functions
- `lambda_view_resume/index.js`
- `lambda_view_resume/package.json`

### Project Root
- `.gitignore`
- `README.md`
- `Dockerfile` and `Dockerfile.aws.lambda`
- `docker-compose.yml`

## Installation and Setup

1. Clone the repository
2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
3. Start the frontend development server:
   ```
   npm start
   ```

## Deployment

The frontend is deployed to an AWS S3 bucket:
```
cd frontend
npm run build
npm run deploy
```

See `frontend/troubleshooting.md` for common issues and solutions. 