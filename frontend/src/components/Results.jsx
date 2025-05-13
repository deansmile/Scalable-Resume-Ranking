import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  Text, 
  Progress, 
  List, 
  ListItem, 
  Heading,
  Flex,
  Badge,
  Spinner,
  HStack,
  Tag,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Divider,
  Select,
  ButtonGroup,
  IconButton,
  Tooltip,
  useToast,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { FaFilePdf, FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import config from '../config';
import axios from 'axios';
import apiClient from '../api-client';

const Results = ({ results, isLoading, handleSubmit, rankMode, candidateIds, jobDescriptionData }) => {
  const topRankBg = useColorModeValue('yellow.50', 'yellow.900');
  const rankBg = useColorModeValue('white', 'gray.800');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const [topFilter, setTopFilter] = useState('all'); // 'all', 'top3', 'top5', 'top10'
  const toast = useToast();
  const resultsRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedResumeUrl, setSelectedResumeUrl] = useState('');
  const [selectedResumeName, setSelectedResumeName] = useState('');
  const [jobTitles, setJobTitles] = useState({});
  const [jobRequirements, setJobRequirements] = useState([]);

  // Helper function to get the badge color based on similarity score
  const getBadgeColor = (score) => {
    if (score >= config.HIGH_SCORE_THRESHOLD) return "green";
    if (score >= 0.5) return "blue";
    return "gray";
  };

  // Helper to make sure results is always an array
  const normalizeResults = (data) => {
    // If results is null or undefined, return empty array
    if (!data) return [];
    
    // If data is a string, try to parse it
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse string data:', e);
      }
    }
    
    // If data has a body property that is a string, try to parse it
    if (data.body && typeof data.body === 'string') {
      try {
        const parsedBody = JSON.parse(data.body);
        // If the parsed body has a results array, use that
        if (parsedBody.results && Array.isArray(parsedBody.results)) {
          console.log('Found results array in parsed body', parsedBody.results.length);
          return parsedBody.results;
        }
        // Otherwise, use the parsed body as data
        data = parsedBody;
      } catch (e) {
        console.error('Failed to parse body string:', e);
      }
    }
    
    // If results is already an array, return it
    if (Array.isArray(data)) return data;
    
    // If results has a data property that is an array, return that
    if (data.data && Array.isArray(data.data)) return data.data;
    
    // If results is an object with results property, use that
    if (data.results && Array.isArray(data.results)) return data.results;
    
    // Last resort, convert to array if it's an object
    if (typeof data === 'object') {
      console.warn('Results data is not in expected format, attempting to convert:', data);
      return Object.values(data);
    }
    
    // If all else fails, return empty array
    console.error('Unable to process results data:', data);
    return [];
  };
  
  // Normalize the results to ensure we have an array
  const normalizedResults = normalizeResults(results);
  
  // Apply additional client-side filtering for "uploaded" mode
  const filteredResults = React.useMemo(() => {
    if (rankMode === 'uploaded' && candidateIds && candidateIds.length > 0 && normalizedResults.length > 0) {
      console.log('Results component: Applying additional filtering');
      console.log('Candidate IDs for filtering:', candidateIds);
      console.log('Before filtering - results count:', normalizedResults.length);
      
      const filtered = normalizedResults.filter(result => {
        const candidateId = result.candidate_id || result.candidateId;
        const isMatch = candidateId && candidateIds.includes(candidateId);
        console.log(`Result candidate ID ${candidateId}: ${isMatch ? 'KEEPS' : 'FILTERS OUT'}`);
        return isMatch;
      });
      
      console.log('After filtering - results count:', filtered.length);
      return filtered;
    }
    return normalizedResults;
  }, [normalizedResults, rankMode, candidateIds]);

  // Apply top N filtering
  const displayedResults = React.useMemo(() => {
    if (topFilter === 'all' || !filteredResults || filteredResults.length === 0) {
      return filteredResults;
    }
    
    const limit = topFilter === 'top3' ? 3 : topFilter === 'top5' ? 5 : 10;
    return filteredResults.slice(0, limit);
  }, [filteredResults, topFilter]);

  // Function to view resume PDF
  const viewResume = async (candidateId, candidateName) => {
    try {
      if (!candidateId) {
        throw new Error('Missing candidate ID');
      }
      
      console.log(`Fetching resume URL for candidate: ${candidateId}`);
      const response = await fetch(`${config.API_BASE_URL}/view-resume?candidate_id=${candidateId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching resume URL: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.view_url) {
        setSelectedResumeUrl(data.view_url);
        setSelectedResumeName(candidateName);
        onOpen();
      } else if (data && data.url) {
        setSelectedResumeUrl(data.url);
        setSelectedResumeName(candidateName);
        onOpen();
      } else {
        throw new Error('No valid URL returned');
      }
    } catch (error) {
      console.error("Error viewing resume:", error);
      toast({
        title: "Error",
        description: `Could not view resume: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Extract job requirements from job description data
  useEffect(() => {
    try {
      // Extract requirements from job description data if available
      if (jobDescriptionData) {
        let requirements = [];
        
        // Key phrases are usually the most important keywords from the job
        if (jobDescriptionData.key_phrases && Array.isArray(jobDescriptionData.key_phrases)) {
          requirements = requirements.concat(
            jobDescriptionData.key_phrases.filter(phrase => phrase && typeof phrase === 'string')
          );
        }
        
        // Entities are usually skills, technologies, etc.
        if (jobDescriptionData.entities && Array.isArray(jobDescriptionData.entities)) {
          const entityTexts = jobDescriptionData.entities
            .map(entity => {
              if (!entity) return null;
              if (typeof entity === 'string') return entity;
              return entity.Text || entity.text || null;
            })
            .filter(Boolean);
          
          requirements = requirements.concat(entityTexts);
        }
        
        // Deduplicate and set job requirements
        if (requirements.length > 0) {
          const uniqueRequirements = [...new Set(
            requirements
              .filter(Boolean)
              .map(r => typeof r === 'string' ? r.toLowerCase() : '')
              .filter(r => r.length > 0)
          )];
          
          console.log("Extracted job requirements:", uniqueRequirements);
          setJobRequirements(uniqueRequirements);
        } else {
          // No requirements found, set empty array
          setJobRequirements([]);
        }
      } else {
        // No job description data, set empty array
        setJobRequirements([]);
      }
    } catch (error) {
      console.error("Error extracting job requirements:", error);
      // Fail safely by setting empty requirements
      setJobRequirements([]);
    }
  }, [jobDescriptionData]);

  // Extract matched keywords that precisely match job requirements
  const getMatchedKeywords = (result) => {
    // Guard against missing result object
    if (!result) return [];
    
    // Log information to debug ranking vs. skills issue
    const candidateId = result.candidate_id || result.candidateId || 'unknown';
    const score = result.score || result.similarity || result.match_score || 0;
    console.log(`Extracting skills for candidate ${candidateId} with score ${score}`);
    
    // Store all potential matches for comprehensive matching
    const allPotentialMatches = new Set();
    
    // First try to get explicitly matched keywords from the API response
    if (result.matched_keywords && Array.isArray(result.matched_keywords) && result.matched_keywords.length > 0) {
      console.log(`Candidate ${candidateId} has ${result.matched_keywords.length} matched_keywords from API`);
      result.matched_keywords.filter(Boolean).forEach(kw => allPotentialMatches.add(kw));
    }

    // Without job description data, we can't match further
    if (!jobDescriptionData) {
      // Just return top entities if available
      if (result.entities && Array.isArray(result.entities) && result.entities.length > 0) {
        console.log(`Candidate ${candidateId} has ${result.entities.length} entities (no job description data)`);
        return deduplicateKeywords(result.entities.slice(0, 10));
      }
      return [];
    }

    // Create a set of normalized job requirement terms
    const jobRequirementTerms = new Set();
    
    // Define common business management terms that might not be explicitly tagged as skills
    const businessTerms = new Set([
      'management', 'leadership', 'strategy', 'strategic', 'planning', 'operations', 
      'business', 'development', 'sales', 'marketing', 'finance', 'accounting', 
      'hr', 'human resources', 'recruitment', 'project', 'budget', 'forecasting',
      'analytics', 'analysis', 'communication', 'negotiation', 'teamwork', 'team',
      'coordination', 'reporting', 'presentation', 'stakeholder', 'client', 'customer',
      'service', 'relationship', 'implementation', 'process', 'optimization', 'efficiency',
      'performance', 'kpi', 'metric', 'growth', 'revenue', 'profit', 'roi', 'market',
      'compliance', 'regulation', 'policy', 'governance', 'risk', 'quality', 'assurance',
      'training', 'mentoring', 'coaching', 'delegation', 'supervision', 'facilitation',
      'executive', 'director', 'manager', 'coordinator', 'administrator', 'specialist',
      'consultant', 'advisor', 'analyst', 'strategist', 'planner', 'supervisor'
    ]);

    // Add key phrases from job description
    if (jobDescriptionData.key_phrases && Array.isArray(jobDescriptionData.key_phrases)) {
      jobDescriptionData.key_phrases
        .filter(Boolean)
        .forEach(phrase => {
          if (typeof phrase === 'string') {
            jobRequirementTerms.add(phrase.toLowerCase());
            
            // Also add individual words for multi-word phrases
            phrase.toLowerCase().split(/\s+/).forEach(word => {
              if (word.length > 3) { // Only meaningful words
                jobRequirementTerms.add(word);
              }
            });
          }
        });
    }
    
    // Add entities from job description
    if (jobDescriptionData.entities && Array.isArray(jobDescriptionData.entities)) {
      jobDescriptionData.entities.forEach(entity => {
        if (!entity) return;
        
        const text = typeof entity === 'string' 
          ? entity 
          : (entity.Text || entity.text || '');
          
        if (text) {
          jobRequirementTerms.add(text.toLowerCase());
          
          // Also add individual words for multi-word entities
          text.toLowerCase().split(/\s+/).forEach(word => {
            if (word.length > 3) { // Only meaningful words
              jobRequirementTerms.add(word);
            }
          });
        }
      });
    }
    
    // Add any text from full description
    if (typeof jobDescriptionData.description === 'string') {
      const jobDescription = jobDescriptionData.description.toLowerCase();
      
      // Check if this is a business/management related job by looking for keywords
      const isBusinessJob = /business|management|marketing|operations|finance|sales|strategy|leadership/i.test(jobDescription);
      
      // If this is a business job, add common business terms to the requirements
      if (isBusinessJob) {
        businessTerms.forEach(term => jobRequirementTerms.add(term));
        console.log("Added business management terms to job requirements");
      }
      
      // Look for job title and add its components
      const titleMatch = jobDescription.match(/job title:\s*([^\n]+)/i);
      if (titleMatch && titleMatch[1]) {
        const titleWords = titleMatch[1].toLowerCase().split(/\s+/);
        titleWords.forEach(word => {
          if (word.length > 3) {
            jobRequirementTerms.add(word);
          }
        });
      }
      
      // Extract requirements section if possible
      const reqSection = jobDescription.match(/requirements?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
      if (reqSection && reqSection[1]) {
        // Split by bullet points or newlines and extract key terms
        reqSection[1].split(/[•\-\*\n]/).forEach(line => {
          line.split(/[,;:]/).forEach(term => {
            const cleanTerm = term.trim().toLowerCase();
            if (cleanTerm.length > 3 && cleanTerm.length < 30) {
              jobRequirementTerms.add(cleanTerm);
              
              // Add individual words as well
              cleanTerm.split(/\s+/).forEach(word => {
                if (word.length > 3) {
                  jobRequirementTerms.add(word);
                }
              });
            }
          });
        });
      }
      
      // Also extract responsibilities section, which often contains required skills
      const respSection = jobDescription.match(/responsibilities?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
      if (respSection && respSection[1]) {
        respSection[1].split(/[•\-\*\n]/).forEach(line => {
          line.split(/[,;:]/).forEach(term => {
            const cleanTerm = term.trim().toLowerCase();
            if (cleanTerm.length > 3 && cleanTerm.length < 30) {
              jobRequirementTerms.add(cleanTerm);
              
              // Extract key action verbs and nouns
              cleanTerm.split(/\s+/).forEach(word => {
                if (word.length > 4) { // Slightly higher threshold for responsibilities
                  jobRequirementTerms.add(word);
                }
              });
            }
          });
        });
      }
    }
    
    console.log(`Job requirement terms count: ${jobRequirementTerms.size}`);
    
    // Match resume content against job requirement terms
    const matches = new Set();
    
    // Try entities (skills) first - this is the most reliable
    if (result.entities && Array.isArray(result.entities)) {
      result.entities.forEach(entity => {
        if (!entity || typeof entity !== 'string') return;
        
        const normalizedEntity = entity.toLowerCase();
        allPotentialMatches.add(entity); // Add to potential matches set
        
        // Check exact matches
        if (jobRequirementTerms.has(normalizedEntity)) {
          matches.add(entity); // Use original case
          return;
        }
        
        // Check if any job requirement contains this entity or vice versa
        for (const reqTerm of jobRequirementTerms) {
          if (reqTerm.includes(normalizedEntity) || normalizedEntity.includes(reqTerm)) {
            matches.add(entity); // Use original case
            return;
          }
        }
      });
    }
    
    // Check all resume sections for business terms and job requirements
    if (result.sections && typeof result.sections === 'object') {
      // List of potentially relevant sections for skills
      const relevantSections = Object.entries(result.sections).filter(([name]) => {
        const lowerName = name.toLowerCase();
        return lowerName.includes('skill') || 
               lowerName.includes('experience') || 
               lowerName.includes('employment') ||
               lowerName.includes('qualification') ||
               lowerName.includes('summary') ||
               lowerName.includes('profile') ||
               lowerName.includes('objective');
      });
      
      // Process each relevant section
      relevantSections.forEach(([sectionName, content]) => {
        if (!content || typeof content !== 'string') return;
        
        const normalizedContent = content.toLowerCase();
        
        // Check each requirement term against the section content
        jobRequirementTerms.forEach(term => {
          if (term.length < 4) return; // Skip very short terms
          
          if (normalizedContent.includes(term)) {
            // Try to extract the original case of the term with some context
            const termIndex = normalizedContent.indexOf(term);
            const startIndex = Math.max(0, termIndex - 10);
            const endIndex = Math.min(normalizedContent.length, termIndex + term.length + 10);
            const context = content.substring(startIndex, endIndex);
            
            // Use regex to extract the term in original case
            const regex = new RegExp(`\\b${term}\\w*\\b`, 'i');
            const match = context.match(regex);
            
            if (match && match[0]) {
              matches.add(match[0]);
              allPotentialMatches.add(match[0]);
            } else {
              // If we can't find the original case, use the term as is
              matches.add(term);
              allPotentialMatches.add(term);
            }
          }
        });
        
        // Also extract phrases that might be skills
        const phrases = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
        phrases.forEach(phrase => {
          const normalizedPhrase = phrase.toLowerCase();
          allPotentialMatches.add(phrase);
          
          // Check if this phrase or any part of it is in job requirements
          let isRelevant = jobRequirementTerms.has(normalizedPhrase);
          
          // Check for partial matches
          if (!isRelevant) {
            const words = normalizedPhrase.split(/\s+/);
            isRelevant = words.some(word => 
              word.length > 3 && jobRequirementTerms.has(word)
            );
          }
          
          // If it's a business term, add it directly
          if (!isRelevant && businessTerms.has(normalizedPhrase)) {
            isRelevant = true;
          }
          
          if (isRelevant) {
            matches.add(phrase);
          }
        });
      });
    }
    
    // Implement stronger deduplication for keywords
    const deduplicateKeywords = (keywords) => {
      // First do exact deduplication with a Set
      const uniqueSet = new Set(keywords);
      
      // Then handle case-insensitive duplicates and similar terms
      const uniqueMap = new Map();
      Array.from(uniqueSet).forEach(keyword => {
        const normalized = keyword.toLowerCase().trim();
        
        // Skip very short terms as they're likely to create false duplicates
        if (normalized.length < 3) return;
        
        // If we already have this term in a different form, keep the better capitalization
        if (!uniqueMap.has(normalized) || uniqueMap.get(normalized).length < keyword.length) {
          uniqueMap.set(normalized, keyword);
        }
        
        // Also check for singular/plural variations
        const singularForm = normalized.endsWith('s') ? normalized.slice(0, -1) : normalized;
        const pluralForm = normalized.endsWith('s') ? normalized : normalized + 's';
        
        // If we have both singular and plural forms, keep just one (prefer plural)
        if (uniqueMap.has(singularForm) && pluralForm === normalized) {
          uniqueMap.delete(singularForm);
          uniqueMap.set(normalized, keyword);
        }
        
        // Check for related terms with common prefixes (8+ char terms only to avoid false matches)
        if (normalized.length >= 8) {
          const prefix = normalized.substring(0, 6); // Use a reasonable prefix length
          
          // Find and remove any shorter variations that are prefixes of this term
          for (const [existingKey, existingValue] of uniqueMap.entries()) {
            if (existingKey !== normalized && existingKey.startsWith(prefix) && 
                (normalized.includes(existingKey) || existingKey.includes(normalized))) {
              // Keep the longer, more specific term
              if (existingKey.length > normalized.length) {
                // Existing term is better, don't add current one
                return;
              } else {
                // Current term is better, remove the existing one
                uniqueMap.delete(existingKey);
              }
            }
          }
        }
      });
      
      return Array.from(uniqueMap.values());
    };

    // *** IMPORTANT CHANGE: Adjust the number of matched skills based on score ***
    // Higher ranked candidates (higher scores) should show more skills
    
    // Convert back to array and ensure reasonable length
    const matchArray = Array.from(matches);
    const allPotentialMatchesArray = deduplicateKeywords(Array.from(allPotentialMatches));
    
    // Log skill counts for debugging
    console.log(`Candidate ${candidateId} with score ${score}: ${matchArray.length} matched skills, ${allPotentialMatchesArray.length} potential skills`);
    
    // Apply more aggressive deduplication
    const dedupedMatches = deduplicateKeywords(matchArray);
    
    // If no matches but we have entities, return top entities
    if (dedupedMatches.length === 0 && result.entities && Array.isArray(result.entities) && result.entities.length > 0) {
      const entitySkills = deduplicateKeywords(result.entities.slice(0, 10));
      console.log(`Candidate ${candidateId} using ${entitySkills.length} entity skills`);
      return entitySkills;
    }
    
    // If this is a higher-ranked candidate (score >= 0.7), make sure they display more skills
    // by supplementing with potential matches if needed
    if (score >= 0.7 && dedupedMatches.length < 5 && allPotentialMatchesArray.length > dedupedMatches.length) {
      // Add more potential matches to ensure higher-ranked candidates show more skills
      const supplementalSkills = allPotentialMatchesArray
        .filter(skill => !dedupedMatches.includes(skill))
        .slice(0, 7 - dedupedMatches.length);
      
      const enhancedMatches = [...dedupedMatches, ...supplementalSkills];
      console.log(`Enhanced high-ranking candidate ${candidateId} skills from ${dedupedMatches.length} to ${enhancedMatches.length}`);
      return enhancedMatches;
    }
    
    // Return deduplicated keywords up to the limit (more for higher scores)
    const maxSkills = Math.min(15, Math.max(3, Math.floor(10 * score) + 5));
    console.log(`Returning ${Math.min(dedupedMatches.length, maxSkills)} skills for candidate ${candidateId}`);
    return dedupedMatches.slice(0, maxSkills);
  };

  // Function to fetch job title by job ID - UPDATED
  const fetchJobTitle = async (jobId) => {
    if (!jobId || jobId === 'no-title-job' || jobId === 'N/A') return null;
    
    try {
      console.log(`Fetching job title for job ID: ${jobId}`);
      
      // Use the API function to get job details
      const response = await apiClient.getJobDetails(jobId);
      
      if (response && response.description) {
        const description = response.description;
        const titleMatch = description.match(/Job Title:\s*([^\n]+)/i);
        if (titleMatch && titleMatch[1]) {
          console.log(`Found job title: "${titleMatch[1].trim()}" for job ID: ${jobId}`);
          return titleMatch[1].trim();
        }
      }
      
      console.log(`No job title found for job ID: ${jobId}`);
      return null;
    } catch (error) {
      console.error(`Error fetching job title for ${jobId}:`, error);
      return null;
    }
  };
  
  // Load job titles when results change
  useEffect(() => {
    if (!normalizedResults || normalizedResults.length === 0) return;
    
    const loadJobTitles = async () => {
      const newJobTitles = { ...jobTitles };
      let changed = false;
      
      console.log("Loading job titles for results...");
      
      // First, collect all unique job IDs from the results
      const uniqueJobIds = new Set();
      for (const result of normalizedResults) {
        const jobId = result.job_id || result.jobId || result.last_job_id || 
                     result.lastRankedJobId || result.last_ranked_job_id || 
                     result.job_description_id;
        
        if (jobId && jobId !== 'no-title-job' && jobId !== 'N/A') {
          uniqueJobIds.add(jobId);
        }
      }
      
      console.log(`Found ${uniqueJobIds.size} unique job IDs to lookup`);
      
      // Now fetch titles for all unique job IDs
      for (const jobId of uniqueJobIds) {
        if (!newJobTitles[jobId]) {
          console.log(`Fetching title for job ID: ${jobId}`);
          const title = await fetchJobTitle(jobId);
          if (title) {
            newJobTitles[jobId] = title;
            changed = true;
            console.log(`Added title "${title}" for job ID: ${jobId}`);
          } else {
            newJobTitles[jobId] = `Job ${jobId.substring(0,8)}...`;
            changed = true;
            console.log(`Using default title for job ID: ${jobId}`);
          }
        }
      }
      
      if (changed) {
        console.log("Updating job titles state:", newJobTitles);
        setJobTitles(newJobTitles);
      }
    };
    
    loadJobTitles();
  }, [normalizedResults]);
  
  // Function to get job title display
  const getJobTitleDisplay = (result) => {
    const jobId = result.job_id || result.jobId || result.last_job_id || 
                 result.lastRankedJobId || result.last_ranked_job_id || 
                 result.job_description_id || "N/A";
                 
    if (jobId === 'no-title-job' || jobId === 'N/A') {
      return "No Job ID Available";
    }
    
    if (jobTitles[jobId]) {
      return jobId; // Return the full job ID without abbreviation
    }
    
    return jobId; // Return the full job ID without abbreviation
  };
  
  // Debug function to show job IDs
  const getJobIdDebugInfo = (result) => {
    // Always return null to remove the debug section
    return null;
  };

  return (
    <Box>
      {isLoading && (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" mb={4} />
          <Text color="gray.600">Analyzing resumes against job description...</Text>
        </Box>
      )}

      {!isLoading && results && (
        <VStack spacing={6} align="stretch">
          <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
            <Heading as="h2" size="lg" mb={2}>Ranking Results</Heading>
            
            <Select 
              size="sm" 
              width="120px" 
              value={topFilter}
              onChange={(e) => setTopFilter(e.target.value)}
              borderRadius="md"
            >
              <option value="all">Show All</option>
              <option value="top3">Top 3</option>
              <option value="top5">Top 5</option>
              <option value="top10">Top 10</option>
            </Select>
          </Flex>
          
          {/* Display filtering mode information */}
          <Box p={3} bg="blue.50" borderRadius="md" mb={2}>
            <Text fontWeight="bold">
              Mode: {rankMode === 'uploaded' ? 'Ranking Uploaded Resumes Only' : 'Ranking All Resumes'}
              {rankMode === 'uploaded' && candidateIds && candidateIds.length > 0 && 
                ` (${candidateIds.length} ${candidateIds.length === 1 ? 'resume' : 'resumes'} uploaded)`}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {rankMode === 'uploaded' ? 
                'Only showing results for resumes you uploaded' : 
                'Showing results for all resumes in the database'}
            </Text>
            {rankMode === 'uploaded' && candidateIds && candidateIds.length > 0 && (
              <Text fontSize="sm" mt={2} fontWeight="bold">
                Filtered: {filteredResults.length} of {normalizedResults.length} results shown
                {topFilter !== 'all' && ` (displaying ${displayedResults.length} from top ${topFilter.replace('top', '')})`}
              </Text>
            )}
          </Box>
          
          {displayedResults.length > 0 ? (
            <Accordion allowMultiple>
              {displayedResults.map((result, index) => {
                // Ensure we have a similarity score (adapt to API response format)
                // The API might return score as a number (0-100) or similarity as decimal (0-1)
                let score = 0;
                if (result.score !== undefined) {
                  // Check if score is already normalized (less than or equal to 1)
                  score = result.score <= 1 ? result.score : result.score / 100;
                  console.log(`Processing score for ${result.candidate_id}: original=${result.score}, normalized=${score}`);
                } else if (result.similarity !== undefined) {
                  score = result.similarity;
                } else if (result.match_score !== undefined) {
                  score = result.match_score <= 1 ? result.match_score : result.match_score / 100;
                }
                
                // Handle invalid scores
                if (isNaN(score) || score === undefined) {
                  score = 0.5; // Default to middle score
                }
                
                // Use a minimum of 0.1 to always show visible progress bars  
                score = Math.max(0.1, score);
                
                // Cap score at 1.0 for safety
                score = Math.min(1.0, score);
                
                // Get name from the result, might be stored in different fields depending on API
                const name = result.name || result.filename || result.resume_name || 
                            (result.candidate_id ? `Candidate ${result.candidate_id}` : `Result ${index + 1}`);
                
                // Format name to be more readable (remove underscores, extension)
                const formattedName = name
                  .replace(/[_-]/g, ' ')
                  .replace(/\.(pdf|txt|docx?)$/i, '')
                  .replace(/resume/i, '')
                  .trim()
                  .toUpperCase();
                
                // Extract candidate ID for viewing resume
                const candidateId = result.candidate_id || result.candidateId;

                // Based on the logs, we can see that we're getting candidate names, not filenames
                // Let's create a synthetic filename using the candidate ID
                const syntheticFileName = candidateId 
                  ? `resume_${candidateId.substring(0, 8)}.pdf`
                  : `resume_${index + 1}.pdf`;

                // Debug the response structure to find where the filename is stored
                console.log(`Result for candidate ${candidateId}:`, {
                  name: result.name,
                  filename: result.filename,
                  resume_name: result.resume_name,
                  s3_key: result.s3_key,
                  key: result.key,
                  original_filename: result.original_filename,
                  file_path: result.file_path,
                  source: result.source,
                  upload_info: result.upload_info,
                  metadata: result.metadata
                });

                // Enhanced logic to extract the original filename
                let fileName = "";
                
                // Check for direct filename fields
                if (result.original_filename) {
                  fileName = result.original_filename;
                } else if (result.filename) {
                  fileName = result.filename;
                } else if (result.resume_name) {
                  fileName = result.resume_name;
                }
                // If we have metadata that contains filename
                else if (result.metadata && result.metadata.filename) {
                  fileName = result.metadata.filename;
                }
                // If we have upload_info that contains filename
                else if (result.upload_info && result.upload_info.filename) {
                  fileName = result.upload_info.filename;
                }
                // Try to extract from s3_key
                else if (result.s3_key) {
                  const keyParts = result.s3_key.split('/');
                  fileName = keyParts[keyParts.length - 1]; // Get the last part of the path
                  // Remove any URL parameters
                  fileName = fileName.split('?')[0];
                  // URL decode in case it's encoded
                  try {
                    fileName = decodeURIComponent(fileName);
                  } catch (e) {
                    console.warn("Failed to decode filename:", e);
                  }
                } 
                // Try to extract from key
                else if (result.key) {
                  const keyParts = result.key.split('/');
                  fileName = keyParts[keyParts.length - 1];
                  // Remove any URL parameters
                  fileName = fileName.split('?')[0];
                  // URL decode in case it's encoded
                  try {
                    fileName = decodeURIComponent(fileName);
                  } catch (e) {
                    console.warn("Failed to decode filename:", e);
                  }
                } 
                // Try to extract from file_path
                else if (result.file_path) {
                  const pathParts = result.file_path.split('/');
                  fileName = pathParts[pathParts.length - 1];
                } 
                // Fall back to raw name as last resort
                else {
                  fileName = name;
                }

                // Make sure we're not using the date string as filename
                if (fileName && /^\d{4}-\d{2}-\d{2}/.test(fileName)) {
                  console.log("Filename appears to be a date, trying to find better option");
                  
                  // If it looks like a date string, check if name has a better value
                  if (result.name && !/^\d{4}-\d{2}-\d{2}/.test(result.name)) {
                    fileName = result.name;
                  } 
                  // Last resort: use candidate ID
                  else if (candidateId) {
                    fileName = `Resume-${candidateId}.pdf`;
                  }
                }

                console.log(`Final filename for candidate ${candidateId}:`, fileName);
                
                // Get resume sections
                const sections = result.parsed_sections || result.sections || {};
                
                // Get matched keywords
                const matchedKeywords = getMatchedKeywords(result);

                // Check if this resume was uploaded in the current session
                const wasUploaded = result.was_uploaded === true;

                return (
                  <AccordionItem 
                    key={index}
                    border="none"
                    mb={4}
                  >
                    <Box 
                      borderWidth="1px" 
                      borderRadius="lg"
                      borderLeftWidth="4px"
                      borderLeftColor={
                        wasUploaded
                          ? "orange.400" 
                          : score >= config.HIGH_SCORE_THRESHOLD 
                            ? "green.400" 
                            : (index === 0 ? "yellow.400" : "blue.400")
                      }
                      bg={index === 0 ? topRankBg : rankBg}
                      shadow="md"
                      transition="transform 0.2s"
                      _hover={{
                        transform: "translateY(-2px)",
                        shadow: "lg"
                      }}
                      overflow="hidden"
                      position="relative"
                    >
                      {wasUploaded && (
                        <Box 
                          position="absolute" 
                          top={1} 
                          right={1} 
                          px={2}
                          py={0.5}
                          bg="orange.100"
                          fontSize="xs"
                          fontWeight="bold"
                          color="orange.700"
                          borderRadius="sm"
                          zIndex={1}
                        >
                          UPLOADED
                        </Box>
                      )}
                      
                      {/* Collapsed View (Always Visible) */}
                      <AccordionButton p={0}>
                        <Box width="100%" p={4}>
                          <Flex direction="column" gap={2} width="100%">
                            <Flex align="center" justify="space-between">
                              <HStack>
                                <Heading as="h3" size="md">
                                  {index === 0 && filteredResults.length > 1 && "👑 "}
                                  {formattedName}
                                </Heading>
                                <Badge colorScheme={getBadgeColor(score)}>
                                  {score >= config.HIGH_SCORE_THRESHOLD ? "Strong Match" : `Rank #${index + 1}`}
                                </Badge>
                                {candidateId && (
                                  <Button
                                    leftIcon={<FaEye />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="solid"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      viewResume(candidateId, formattedName);
                                    }}
                                    ml={1}
                                    boxShadow="sm"
                                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                    aria-label="View Resume"
                                  >
                                    View PDF
                                  </Button>
                                )}
                              </HStack>
                              <AccordionIcon />
                            </Flex>
                            
                            <Progress 
                              value={score * 100} 
                              colorScheme={getBadgeColor(score)} 
                              height="8px"
                              borderRadius="full" 
                              mb={2}
                            />
                            
                            <SimpleGrid columns={[1, 2, 3]} spacing={4} width="100%">
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Score:</Text>
                                <Text fontWeight="medium" fontSize="md">{(score * 100).toFixed(1)} / 100</Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Email:</Text>
                                <Text fontWeight="medium" fontSize="md" color="blue.600">{result.email || result.contact_email || "N/A"}</Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Phone:</Text>
                                <Text fontWeight="medium" fontSize="md">{result.phone || result.contact_phone || "N/A"}</Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Candidate Name:</Text>
                                <Text fontWeight="medium" fontSize="md" noOfLines={1} title={name}>{name}</Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.500">Job ID:</Text>
                                <Text fontWeight="medium" fontSize="md" noOfLines={1}>{getJobTitleDisplay(result)}</Text>
                              </Box>
                            </SimpleGrid>
                            
                            {/* Job ID debug information */}
                            {config.DEBUG && getJobIdDebugInfo(result)}
                          </Flex>
                        </Box>
                      </AccordionButton>
                      
                      {/* Expanded View (Visible on Click) */}
                      <AccordionPanel pb={4} bg={sectionBg}>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="sm" mb={2}>Resume Content</Heading>
                          
                          {result.parsed_sections || result.sections ? (
                            Object.entries(result.parsed_sections || result.sections)
                              .filter(([section]) => section.toLowerCase() !== 'unknown')
                              .map(([section, content], i) => (
                                <Box key={i} p={3} borderWidth="1px" borderRadius="md" bg="white" shadow="sm">
                                  <Heading as="h4" size="sm" mb={2} color="blue.600">{section}</Heading>
                                  <Text whiteSpace="pre-wrap" fontSize="sm">{content}</Text>
                                </Box>
                              ))
                          ) : (
                            <Text>No parsed sections available</Text>
                          )}
                          
                          {result.entities && result.entities.length > 0 && (
                            <Box>
                              <Heading as="h4" size="sm" mb={2} color="blue.600">Key Skills:</Heading>
                              <Flex flexWrap="wrap" gap={2}>
                                {result.entities.map((skill, i) => (
                                  <Tag key={i} size="md" colorScheme="blue" variant="subtle" fontWeight="medium">
                                    {skill}
                                  </Tag>
                                ))}
                              </Flex>
                            </Box>
                          )}
                          
                          {result.candidate_id && (
                            <Box>
                              <Divider my={2} />
                              <Text fontSize="sm" color="gray.500">
                                Candidate ID: {result.candidate_id}
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </AccordionPanel>
                    </Box>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Box textAlign="center" py={10}>
              <Text color="gray.600">No results found. Try adjusting your search criteria.</Text>
            </Box>
          )}
        </VStack>
      )}
      
      {/* Modal for viewing resume */}
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent h="90vh">
          <ModalHeader>
            {selectedResumeName}
            <Tooltip label="Open in new tab">
              <IconButton 
                icon={<FaExternalLinkAlt />} 
                size="sm" 
                ml={2}
                onClick={() => window.open(selectedResumeUrl, '_blank')}
                aria-label="Open in new tab"
              />
            </Tooltip>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} h="calc(100% - 60px)">
              <iframe 
                src={selectedResumeUrl}
                width="100%" 
                height="100%" 
                style={{ border: "none" }}
                title="Resume Preview"
              />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Results; 