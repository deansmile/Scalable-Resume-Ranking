# Resume Ranking Frontend

This is the frontend application for the Resume Ranking System.

## Deployment Instructions

### Standard Deployment

To deploy the application to AWS S3, use the new deployment script:

```bash
npm run deploy
```

This will:
1. Build the application
2. Check for any references to the old API Gateway ID
3. Fix any issues found
4. Upload the fixed files to S3

### Manual Deployment (Not Recommended)

If you need to manually deploy, follow these steps:

```bash
# Build the application
npm run build

# Run pre-deployment checks
npm run pre-deploy

# Deploy to S3
aws s3 sync build/ s3://resume-ranking-frontend --profile resume-ranking
```

## API Gateway ID Issues

The application previously had issues with hardcoded references to an outdated API Gateway ID (`bf138rwrwj`). These have been fixed, and measures have been put in place to prevent this from happening again:

1. A runtime check in `config.js` that will detect and replace the old ID
2. A pre-deployment script that checks built files before they reach production
3. A deployment script that automatically applies these checks

If you encounter any API Gateway ID issues, you can run the fix script:

```bash
./fix-api-gateway-id.sh
```

This will scan all JavaScript files in the S3 bucket and fix any references to the old API Gateway ID.

## Development

To start the development server:

```bash
npm start
```

To run the CORS proxy server (for local development):

```bash
npm run serve
```

## Features

- Upload multiple resumes (PDF/TXT)
- Input job descriptions
- View ranked results with matching scores
- See extracted key skills from resumes

## Setup and Installation

1. Make sure you have Node.js installed (v14+)
2. Navigate to the frontend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

## Integration with Backend

The frontend expects the backend API to be available at `http://localhost:8000/resume` by default. If your API is hosted elsewhere, update the `API_URL` in `src/api.js`.

## Technologies Used

- React
- Chakra UI for components and styling
- Axios for API communication 