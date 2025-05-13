// Configuration file for API URLs and other constants

// API URLs
const config = {
  // API configuration - update these values based on your deployment
  // Replace [your-api-id] and [stage] with your actual API Gateway ID and stage name
  // Example: https://abc123def4.execute-api.us-east-1.amazonaws.com/prod
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://xosmeb3ly7.execute-api.us-east-1.amazonaws.com/prod',
  
  // Maximum file upload size (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Maximum number of files that can be uploaded at once
  MAX_FILES: 10,
  
  // Application name
  APP_NAME: process.env.REACT_APP_TITLE || 'Resume Ranking System',
  
  // Score threshold for highlighting good matches
  HIGH_SCORE_THRESHOLD: 85,
  MEDIUM_SCORE_THRESHOLD: 70,
  
  // Keywords to highlight in resume text
  HIGHLIGHT_WORDS: true,
  
  // Debug mode - set to true to enable console logging
  DEBUG: true,
};

// Log the API Base URL when in debug mode
if (config.DEBUG) {
  console.log('API_BASE_URL:', config.API_BASE_URL);
}

export default config; 