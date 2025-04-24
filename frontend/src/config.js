// Configuration file for API URLs and other constants

// API URLs
const config = {
  // API configuration - update these values based on your deployment
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || '/resume',
  
  // Maximum file upload size (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Maximum number of files that can be uploaded at once
  MAX_FILES: 10,
  
  // Application name
  APP_NAME: process.env.REACT_APP_TITLE || 'Resume Ranking System',
};

export default config; 