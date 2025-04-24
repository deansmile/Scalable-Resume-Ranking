import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  Heading, 
  Text, 
  useToast
} from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import Results from './components/Results';
import ErrorDisplay from './components/ErrorDisplay';
import { submitResumes } from './api';
import config from './config';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one resume');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await submitResumes(jobDescription, files);
      setResults(data);
      toast({
        title: 'Ranking completed',
        description: `Successfully ranked ${files.length} resume(s)`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while processing your request. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to rank resumes. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Header />
      
      <Container maxW="container.lg" flex="1" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={4}>
            <Heading as="h1" size="xl" mb={2} color="blue.600">
              {config.APP_NAME}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Upload resumes and a job description to find the best matches
            </Text>
          </Box>

          <JobDescription 
            jobDescription={jobDescription} 
            setJobDescription={setJobDescription} 
          />
          
          <ResumeUpload 
            files={files} 
            setFiles={setFiles} 
          />
          
          {error && (
            <ErrorDisplay 
              error={error} 
              onClose={() => setError(null)} 
            />
          )}
          
          <Results 
            results={results} 
            isLoading={isLoading} 
            handleSubmit={handleSubmit} 
          />
        </VStack>
      </Container>
      
      <Footer />
    </Box>
  );
}

export default App; 