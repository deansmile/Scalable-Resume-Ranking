# Troubleshooting CORS and API Gateway Issues

## Issue Summary

The frontend application was experiencing CORS errors when attempting to access the AWS API Gateway endpoints. The specific errors included:

```
[Error] TypeError: undefined is not an object (evaluating 'window.wb_async_messenger.handleMessage')
[Error] A server with the specified hostname could not be found.
[Error] XMLHttpRequest cannot load https://bf138rwrwj.execute-api.us-east-1.amazonaws.com/prod/analyze-jd due to access control checks.
[Error] Error analyzing job description
[Error] Failed to load resource: A server with the specified hostname could not be found. (analyze-jd, line 0)
[Error] Failed to load resource: You do not have permission to access the requested resource.
```

## Resolution Steps

The issues were resolved through the following steps:

### 1. API Gateway URL Configuration

1. **Identified Old API Gateway ID**: The application was still using an old API Gateway ID (`bf138rwrwj`) instead of the new one (`xosmeb3ly7`).

2. **Updated Source Code**: Changed the API Gateway URL in the config.js file to use the correct ID.

### 2. Built JavaScript File Fix

The built JavaScript bundle still contained references to the old API Gateway ID even after rebuilding. This was fixed by:

1. **Direct Edit of Built JavaScript**: Downloaded the built JavaScript file from S3, used `sed` to replace all instances of the old API Gateway ID, and uploaded the fixed file back to S3.

```bash
# Download file from S3
aws s3 cp s3://resume-ranking-frontend/static/js/main.68c60c26.js ./main.js --profile resume-ranking

# Replace old API Gateway ID with new one
sed -i '' 's/bf138rwrwj/xosmeb3ly7/g' main.js

# Upload fixed file back to S3
aws s3 cp main.js s3://resume-ranking-frontend/static/js/main.68c60c26.js --profile resume-ranking
```

### 3. CORS Configuration

1. **Created CORS Update Scripts**: Developed scripts to update CORS settings on API Gateway resources:
   - `update-cors.js`: For updating all resources
   - `update-root-cors.js`: For the root resource
   - `update-integration.js`: For updating integration responses
   - `update-method-responses.js`: For updating method responses

2. **Applied CORS Headers**: Added proper CORS headers to all API Gateway resources, including:
   - Access-Control-Allow-Origin: '*'
   - Access-Control-Allow-Methods: 'GET, POST, PUT, DELETE, OPTIONS'
   - Access-Control-Allow-Headers: 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Requested-With'

### 4. Cache Invalidation

1. **Updated Index.html**: Uploaded a new index.html with cache control headers to force browser cache invalidation.

```bash
aws s3 cp index.html s3://resume-ranking-frontend/index.html --profile resume-ranking --cache-control "no-cache, no-store, must-revalidate"
```

### 5. Fixed Persistent Issues

When the bug reappeared with a new compiled JavaScript file (main.a6c8c4b6.js), we repeated the same fix:

1. **Direct Edit of Built JavaScript**: Downloaded the new JavaScript file from S3, used `sed` to replace all instances of the old API Gateway ID, and uploaded the fixed file back to S3.

```bash
# Download file from S3
aws s3 cp s3://resume-ranking-frontend/static/js/main.a6c8c4b6.js ./main.js --profile resume-ranking

# Replace old API Gateway ID with new one
sed -i '' 's/bf138rwrwj/xosmeb3ly7/g' main.js

# Upload fixed file back to S3
aws s3 cp main.js s3://resume-ranking-frontend/static/js/main.a6c8c4b6.js --profile resume-ranking
```

## Future Recommendations

1. **Build Process Improvement**: Investigate why the build process isn't correctly using the updated API Gateway URL from config.js. Consider environment variables or a more reliable configuration system.

2. **CI/CD Pipeline**: Consider implementing a CI/CD pipeline that includes proper build and deployment steps.

3. **API Gateway Management**: Use infrastructure as code (e.g., AWS CloudFormation or Terraform) to manage API Gateway configurations and prevent manual configuration errors.

## Job Title Display Fix

### Issue
When viewing resume results, all candidates showed "no-title-job" for the last ranked job ID field, which was not informative.

### Resolution Steps
1. **Updated the Results.jsx Component:**
   - Added functionality to fetch job titles from the JobDescriptions table using job IDs
   - Created a caching system to store job titles after they're retrieved
   - Updated the UI to display job titles instead of job IDs

2. **Enhanced the Lambda Function:**
   - Updated lambda_analyze_jd to handle GET requests for job title lookups
   - Added support for retrieving job description data using a job_id query parameter

3. **Updated API Gateway:**
   - Ensured the analyze-jd endpoint supports GET method for job title lookups
   - Deployed changes to production

4. **Steps to implement the fix:**
   ```bash
   # Updated the Lambda function
   aws lambda update-function-code --function-name lambda_analyze_jd --zip-file fileb://lambda_analyze_jd_updated.zip --profile resume-ranking
   
   # Deployed the API with updated configuration
   aws apigateway create-deployment --rest-api-id xosmeb3ly7 --stage-name prod --profile resume-ranking
   
   # Built and deployed the updated frontend
   npm run build
   aws s3 sync build/ s3://resume-ranking-frontend --profile resume-ranking
   ```

The fix now displays job titles in the format "Job Title (job_id)" instead of just showing "no-title-job" or the raw job ID, making it easier for users to understand which job each resume was ranked against.

## Job Description Matching Issue

### Issue
The application was not properly matching resumes against the current job description. When a new job description was entered, the application would still show ranking results based on previous job descriptions. This happened because:

1. Each resume in the database has a `last_ranked_job_id` field showing the last job it was ranked against
2. The search results weren't being filtered based on the current job ID
3. Results from different job descriptions were being mixed together

### Resolution Steps

1. **Updated the Lambda Search Function:**
   - Modified `lambda_search_resume` to filter results by the specified job_id
   - Added explicit filtering in the OpenSearch query to only return resumes ranked against the current job
   - Added additional logging to track job ID filtering

2. **Enhanced Frontend Job ID Handling:**
   - Modified `api.js` to ensure it always passes the job ID parameter in search requests
   - Added better error handling for missing job IDs
   - Added client-side filtering as a backup to ensure results match the current job

3. **Added Additional Filtering in App.jsx:**
   - Implemented the `ensureCurrentJobResults` function to verify results match the current job
   - Added validation to prevent searches without a valid job ID
   - Improved error messaging to guide users when job ID isn't available

4. **Deployment:**
   ```bash
   # Updated the Lambda search function
   zip -r lambda_search_resume_updated.zip lambda_function.py
   aws lambda update-function-code --function-name lambda_search_resume --zip-file fileb://lambda_search_resume_updated.zip --profile resume-ranking
   
   # Built and deployed the updated frontend
   npm run build
   aws s3 sync build/ s3://resume-ranking-frontend --profile resume-ranking
   ```

These changes ensure that resume rankings are always shown in the context of the current job description, providing more accurate and relevant results. The application now properly compares resumes against the specific job description the user has entered.

## API Gateway ID Reference Fix

### Issue

The application was repeatedly making calls to an old, non-existent API Gateway endpoint (`bf138rwrwj`) even though the source code had been updated to reference the new endpoint (`xosmeb3ly7`). This was causing CORS errors and network failures:

```
[Error] A server with the specified hostname could not be found.
[Error] XMLHttpRequest cannot load https://bf138rwrwj.execute-api.us-east-1.amazonaws.com/prod/analyze-jd due to access control checks.
[Error] Failed to load resource: A server with the specified hostname could not be found.
```

### Root Cause Analysis

After investigation, we discovered that:

1. The built JavaScript files in the S3 bucket still contained hardcoded references to the old API Gateway ID (`bf138rwrwj`)
2. Even after rebuilding the application with the updated config.js (which had the correct API Gateway ID), the built JavaScript files would somehow still contain references to the old API Gateway ID
3. This issue was persisting across multiple builds and deployments

### Comprehensive Solution

We implemented a multi-layered approach to fix this issue:

1. **Immediate Fix:**
   - Created a script (`fix-api-gateway-id.sh`) to scan all JavaScript files in the S3 bucket
   - Replaced all occurrences of the old API Gateway ID with the new one
   - Updated the index.html file with cache-control headers to force a refresh

2. **Prevention Measures:**
   - Added a runtime safety check in `config.js` to detect and replace any references to the old API Gateway ID
   - Created a pre-deployment script (`pre-deploy.js`) that scans built JavaScript files before they are uploaded to S3
   - Added npm scripts for a safer deployment process:
     - `npm run pre-deploy`: Runs the pre-deployment checks
     - `npm run deploy`: Builds, checks, and deploys the application to S3

3. **Deployment Workflow:**
   - Now when deploying, use `npm run deploy` instead of manually running build and sync commands
   - This ensures that any references to the old API Gateway ID are caught and fixed before reaching production

### Verification

After implementing these fixes:
- All JavaScript files in the S3 bucket now reference the correct API Gateway ID
- The application no longer shows CORS errors related to the old API Gateway
- Even if a build somehow contains references to the old API Gateway ID, our safeguards will prevent it from causing issues 