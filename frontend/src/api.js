import axios from 'axios';
import config from './config';

// Full API URL
const API_URL = `${config.API_BASE_URL}${config.API_ENDPOINT}`;

export const submitResumes = async (jobDescription, files) => {
  const formData = new FormData();
  formData.append('job_description', jobDescription);
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error submitting resumes:', error);
    throw error;
  }
}; 