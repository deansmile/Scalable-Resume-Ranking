# Resume Ranking Frontend

A modern React-based user interface for the Scalable Resume Ranking system.

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