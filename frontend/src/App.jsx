import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  Heading, 
  Text, 
  useToast,
  RadioGroup,
  Radio,
  HStack,
  FormControl,
  FormLabel,
  Switch,
  Flex,
  Button
} from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import Results from './components/Results';
import ErrorDisplay from './components/ErrorDisplay';
import CandidateSearch from './components/CandidateSearch';
import apiClient from './api-client';
import config from './config';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rankMode, setRankMode] = useState('uploaded'); // 'uploaded' or 'all'
  const [jobId, setJobId] = useState(null);
  const [candidateIds, setCandidateIds] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [uploadServiceAvailable, setUploadServiceAvailable] = useState(true); // Track if upload service is working
  const [lastAnalyzedJobDescription, setLastAnalyzedJobDescription] = useState('');
  const [jobDescriptionData, setJobDescriptionData] = useState(null); // Store job description analysis data
  // Keeping track of original results to preserve ranking order
  const [originalResults, setOriginalResults] = useState(null);
  // Visible results after filtering
  const [filteredResults, setFilteredResults] = useState(null);
  const toast = useToast();

  React.useEffect(() => {
    // Log whenever candidateIds changes
    console.log("CandidateIds updated:", candidateIds);
  }, [candidateIds]);

  // If upload service is unavailable and rankMode is 'uploaded', show warning and offer fallback
  useEffect(() => {
    if (!uploadServiceAvailable && rankMode === 'uploaded') {
      toast({
        title: 'Upload Service Unavailable',
        description: 'The resume upload service is currently unavailable. You can still use "Rank All Resumes" mode.',
        status: 'warning',
        duration: 8000,
        isClosable: true,
      });
    }
  }, [uploadServiceAvailable, rankMode, toast]);

  // Function to handle the full resume ranking process
  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    // Only require file uploads if in 'uploaded' mode
    if (rankMode === 'uploaded' && files.length === 0) {
      setError('Please upload at least one resume');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Use mock data if in debug mode
      if (debugMode) {
        console.log("DEBUG MODE: Using mock data instead of API calls");
        const mockResults = [
          { candidate_id: "mock-1", name: "John_Smith_Resume.pdf", score: 85, sections: { "Education": "...", "Experience": "..." }, entities: ["Python", "JavaScript", "React", "AWS"] },
          { candidate_id: "mock-2", name: "Jane_Doe_Resume.pdf", score: 78, sections: { "Skills": "...", "Projects": "..." }, entities: ["Machine Learning", "Data Analysis", "SQL"] },
          { candidate_id: "mock-3", name: "Alex_Johnson_Resume.pdf", score: 63, sections: { "Experience": "...", "Education": "..." }, entities: ["Product Management", "Agile", "Scrum"] }
        ];
        
        setResults(mockResults);
        toast({
          title: 'Ranking completed (DEBUG MODE)',
          description: 'Using mock data for testing',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      console.log(`---- Starting resume ranking flow (${rankMode} mode) ----`);
      
      // Keep track of whether this is a new job description or just new uploads
      const isNewJobDescription = !jobId || jobDescription !== lastAnalyzedJobDescription;
      
      // Step 1: Upload resumes if in 'uploaded' mode
      // This step generates candidate IDs and uploads files to S3
      let candidateIdsArray = [];
      if (rankMode === 'uploaded' && files.length > 0) {
        console.log(`Uploading ${files.length} resumes...`);
        
        // Process one file at a time to simplify debugging
        for (const file of files) {
          try {
            // STEP 1: Test upload endpoint with different approaches
            console.log(`Testing upload approaches for file: ${file.name}`);
            const testResult = await apiClient.testUploadEndpoint(file.name);
            
            if (!testResult.success) {
              throw new Error('All upload approaches failed. Please try a different file or contact support.');
            }
            
            console.log("Upload test successful with approach:", testResult.approach);
            
            // Extract response data based on the structure from the successful approach
            let responseData = testResult.response;
            if (responseData.body && typeof responseData.body === 'string') {
              try {
                responseData.body = JSON.parse(responseData.body);
              } catch (e) {
                console.warn('Failed to parse response body:', e);
              }
            }
            
            // Extract candidate ID and upload URL
            const candidateId = responseData.body?.candidate_id;
            const uploadUrl = responseData.body?.upload_url;
            
            if (!candidateId || !uploadUrl) {
              throw new Error('Missing candidate ID or upload URL in response');
            }
            
            console.log(`Got presigned URL for candidate ID: ${candidateId}`);
            
            // STEP 2: Upload file to S3
            console.log(`Uploading file to S3 for candidate ID: ${candidateId}`);
            
            // Check if this is test mode
            if (testResult.isTest) {
              console.log('⚠️ RUNNING IN TEST MODE - Simulating S3 upload');
              // In test mode we skip the actual S3 upload and simulate success
              
              // If we have sample resume data, use it for display
              if (testResult.sampleResumeData) {
                console.log('Test mode with sample resume data:', testResult.sampleResumeData.candidate_id);
                // The sample data is already stored in apiClient.testSampleData
              }
              
              console.log(`Successfully simulated upload of ${file.name} for test candidate ID: ${candidateId}`);
            } else {
              // Real upload to S3
              await apiClient.uploadFileToS3(uploadUrl, file);
              console.log(`Successfully uploaded ${file.name} for candidate ID: ${candidateId}`);
            }
            
            candidateIdsArray.push(candidateId);
            
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            toast({
              title: 'Upload Error',
              description: `Failed to upload ${file.name}: ${error.message}`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        }
        
        // Update candidateIds with our results
        if (candidateIdsArray.length > 0) {
          console.log(`Successfully uploaded ${candidateIdsArray.length} files`);
          setCandidateIds(candidateIdsArray);
          
          toast({
            title: 'Upload Success',
            description: `Successfully uploaded ${candidateIdsArray.length} of ${files.length} files`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          setError('Failed to upload any files. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Step 2: Analyze job description - only if it's changed
      let currentJobId = jobId;
      if (isNewJobDescription) {
        console.log("Step 2: Analyzing job description");
        const jobDescResponse = await apiClient.analyzeJobDescription(jobDescription);
        console.log("Job description analysis response:", jobDescResponse);
        
        // IMPORTANT: Get the job_id from the response and store it
        currentJobId = jobDescResponse.job_id;
        
        // Store the full job description analysis data
        setJobDescriptionData(jobDescResponse);
        
        // Update the job ID in the application state
        setJobId(currentJobId);
        // Store this job description to avoid repeated analysis
        setLastAnalyzedJobDescription(jobDescription);
        console.log(`Received job ID: ${currentJobId}`);
        
        // Add a small delay to ensure job description analysis is fully processed
        console.log("Waiting for job description analysis to complete...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`Using existing job ID: ${currentJobId}`);
      }

      // Step 3: Rank resumes
      console.log(`Step 3: Ranking resumes with job ID: ${currentJobId}`);

      let rankingPayload;
      if (rankMode === 'uploaded' && candidateIdsArray.length > 0) {
        // Since we're using direct upload which generates client-side IDs,
        // those IDs don't exist in the backend database. So for "uploaded" mode,
        // we should actually use "all" mode behavior but track which files were uploaded.
        console.log("Using 'Rank All' approach since uploaded files won't be in backend yet");
        rankingPayload = await apiClient.rankResumes(currentJobId);
      } else {
        rankingPayload = await apiClient.rankResumes(currentJobId);
      }
      console.log("Ranking response:", rankingPayload);

      // Add a small delay to ensure ranking process is complete
      console.log("Waiting for ranking to complete...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Get full results
      console.log(`Step 4: Getting search results for job ID: ${currentJobId}`);
      let searchResults;
      
      if (rankMode === 'uploaded' && candidateIdsArray.length > 0) {
        // For 'uploaded' mode, we need to make sure we include test data if it exists
        console.log("Getting results for uploaded resumes with candidate IDs:", candidateIdsArray);
        try {
          // Get results with specific candidate IDs
          searchResults = await apiClient.searchResumes("", currentJobId, candidateIdsArray);
          
          // Make sure each result has correct metadata
          if (Array.isArray(searchResults)) {
            console.log(`Retrieved ${searchResults.length} results for uploaded resumes`);
            searchResults = searchResults.map(result => ({
              ...result,
              was_uploaded: true,  // All results should show as uploaded since we're in uploaded mode
              job_id: currentJobId,
              last_ranked_job_id: currentJobId
            }));
          }
        } catch (searchError) {
          console.error("Error searching uploaded resumes:", searchError);
          searchResults = [];
        }
      } else {
        // For 'all' mode, fetch all results
        console.log("Getting results for all resumes");
        try {
          searchResults = await apiClient.searchResumes("", currentJobId);
          
          // Ensure all results have the job_id set correctly
          if (Array.isArray(searchResults)) {
            searchResults = searchResults.map(result => ({
              ...result,
              job_id: currentJobId,
              last_ranked_job_id: currentJobId
            }));
          }
        } catch (searchError) {
          console.error("Error searching all resumes:", searchError);
          searchResults = [];
        }
      }
      console.log("Search results:", searchResults);
      
      // Final step: Apply the results with verified job IDs
      setResults(searchResults);
      // Store original results for filtering
      setOriginalResults(searchResults);
      // Initially filtered results are the same as original results
      setFilteredResults(searchResults);
      
      toast({
        title: 'Ranking completed',
        description: rankMode === 'all' 
          ? 'Successfully ranked all available resumes' 
          : `Successfully ranked ${files.length} uploaded resume(s)`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        console.error('API Error Response:', err.response.data);
      }
      setError(`An error occurred: ${err.message || 'Unknown error'}`);
      toast({
        title: 'Error',
        description: `Failed to rank resumes: ${err.message || 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset the form for a new ranking
  const handleClearForm = () => {
    setJobDescription('');
    setFiles([]);
    setResults(null);
    setJobId(null);
    setLastAnalyzedJobDescription('');
    setCandidateIds([]);
    setError(null);
    // Reset filtering-related states
    setOriginalResults(null);
    setFilteredResults(null);
    setJobDescriptionData(null);
    
    toast({
      title: 'Form cleared',
      description: 'You can now start a new ranking',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Function to handle filtering based on keywords
  const handleFilter = (filterKeywords) => {
    // If no filters, show original results
    if (!filterKeywords || filterKeywords.length === 0) {
      console.log("No filters, showing original results");
      setFilteredResults(originalResults);
      return;
    }

    // Make sure we have original results
    if (!originalResults || !Array.isArray(originalResults)) {
      console.warn("No original results to filter!");
      return;
    }

    console.log(`Filtering with ${filterKeywords.length} keywords:`, filterKeywords);

    // Filter using AND logic (must match ALL keywords)
    const filtered = originalResults.filter(resume => {
      // Create a searchable content string for each resume
      let content = '';

      // Add name/filename
      if (resume.name) content += ' ' + resume.name.toLowerCase();
      
      // Add email
      if (resume.email || resume.contact_email) {
        content += ' ' + (resume.email || resume.contact_email).toLowerCase();
      }

      // Add all skills and entities
      if (resume.entities && Array.isArray(resume.entities)) {
        content += ' ' + resume.entities.join(' ').toLowerCase();
      }

      // Add matched keywords
      if (resume.matched_keywords && Array.isArray(resume.matched_keywords)) {
        content += ' ' + resume.matched_keywords.join(' ').toLowerCase();
      }

      // Add all section content
      if (resume.sections && typeof resume.sections === 'object') {
        Object.values(resume.sections).forEach(section => {
          if (typeof section === 'string') {
            content += ' ' + section.toLowerCase();
          }
        });
      }

      // Check if resume matches ALL keywords (AND filter)
      return filterKeywords.every(keyword => 
        content.includes(keyword.toLowerCase())
      );
    });

    console.log(`Filtered from ${originalResults.length} to ${filtered.length} results`);
    setFilteredResults(filtered);
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Header />
      
      <Container maxW="container.lg" flex="1" py={8}>
        <Flex justify="flex-end" mb={2}>
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="debug-mode" mb="0" mr={2} fontSize="sm">
              Debug Mode
            </FormLabel>
            <Switch id="debug-mode" isChecked={debugMode} onChange={(e) => setDebugMode(e.target.checked)} />
          </FormControl>
        </Flex>
        
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
          
          <FormControl as={Box} p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
            <FormLabel fontWeight="bold">Ranking Mode</FormLabel>
            <RadioGroup 
              onChange={(newMode) => {
                if (newMode === 'uploaded' && !uploadServiceAvailable) {
                  toast({
                    title: 'Upload Service Unavailable',
                    description: 'The resume upload service is currently unavailable. Please use "Rank All Resumes" mode.',
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                  });
                  return; // Don't change the mode
                }
                setRankMode(newMode);
              }} 
              value={rankMode} 
              colorScheme="blue"
            >
              <HStack spacing={6}>
                <Radio 
                  value="uploaded" 
                  isDisabled={!uploadServiceAvailable}
                  _disabled={{ 
                    opacity: 0.6, 
                    cursor: "not-allowed",
                    textDecoration: "line-through" 
                  }}
                >
                  Rank Uploaded Resumes Only
                  {!uploadServiceAvailable && (
                    <Text fontSize="xs" color="red.500" fontWeight="normal">
                      (Service unavailable)
                    </Text>
                  )}
                </Radio>
                <Radio value="all">Rank All Resumes (from Database)</Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
          
          {/* Always show resume upload component */}
          <ResumeUpload 
            files={files} 
            setFiles={setFiles} 
            isLoading={isLoading}
            isDisabled={rankMode === 'uploaded' && !uploadServiceAvailable}
          />
          
          {/* Only show search when results are available */}
          {results && (
            <CandidateSearch onFilter={handleFilter} />
          )}
          
          {error && (
            <ErrorDisplay 
              error={error} 
              onClose={() => setError(null)} 
            />
          )}
          
          <VStack spacing={4} mt={6}>
            <Button 
              onClick={handleSubmit}
              colorScheme="blue"
              size="lg"
              width="300px"
              isLoading={isLoading}
              loadingText="Ranking..."
              disabled={isLoading || (rankMode === 'uploaded' && files.length === 0 && !results)}
              height="60px"
              fontSize="md"
              shadow="md"
            >
              Rank Resumes
            </Button>
            
            <Button
              onClick={handleClearForm}
              colorScheme="gray"
              size="md"
              width="200px"
              disabled={isLoading}
            >
              Clear Form
            </Button>
          </VStack>
          
          <Results 
            results={filteredResults || results} 
            isLoading={isLoading} 
            handleSubmit={handleSubmit} 
            rankMode={rankMode}
            candidateIds={candidateIds}
            jobDescriptionData={jobDescriptionData}
          />
        </VStack>
      </Container>
      
      <Footer />
    </Box>
  );
}

export default App; 
