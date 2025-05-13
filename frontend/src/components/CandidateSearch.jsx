import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  Button
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const CandidateSearch = ({ onFilter }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const tagBg = useColorModeValue('blue.50', 'blue.900');
  const tagColor = useColorModeValue('blue.500', 'blue.200');

  // Add a filter keyword
  const addFilter = (keyword) => {
    if (!keyword || keyword.trim() === '') return;
    
    const trimmedKeyword = keyword.trim().toLowerCase();
    
    // Don't add duplicates
    if (activeFilters.some(filter => filter.toLowerCase() === trimmedKeyword)) {
      return;
    }
    
    const newFilters = [...activeFilters, trimmedKeyword];
    setActiveFilters(newFilters);
    
    // Call the parent filter function
    if (onFilter) {
      onFilter(newFilters);
    }
    
    // Clear input
    setInputValue('');
  };

  // Remove a filter keyword
  const removeFilter = (indexToRemove) => {
    const newFilters = activeFilters.filter((_, index) => index !== indexToRemove);
    setActiveFilters(newFilters);
    
    // Call the parent filter function
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    
    // Call the parent filter function with empty array
    if (onFilter) {
      onFilter([]);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addFilter(inputValue);
    }
  };

  // Handle paste of multiple keywords
  const handlePaste = (e) => {
    if (!inputValue.includes(',')) return; // Only handle multi-keyword paste
    
    e.preventDefault();
    
    // Split by commas and filter out empties
    const keywords = inputValue.split(',').map(k => k.trim()).filter(Boolean);
    
    // Add all keywords as separate filters
    let newFilters = [...activeFilters];
    
    keywords.forEach(keyword => {
      if (!newFilters.some(filter => filter.toLowerCase() === keyword.toLowerCase())) {
        newFilters.push(keyword.toLowerCase());
      }
    });
    
    setActiveFilters(newFilters);
    
    // Call the parent filter function
    if (onFilter) {
      onFilter(newFilters);
    }
    
    // Clear input
    setInputValue('');
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
      <FormControl>
        <Flex justify="space-between" align="center" mb={2}>
          <FormLabel fontWeight="bold" mb={0}>Filter Candidates by Skills & Keywords</FormLabel>
          {activeFilters.length > 0 && (
            <Button 
              size="xs" 
              colorScheme="red" 
              variant="outline" 
              leftIcon={<FiX />}
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          )}
        </Flex>
        
        <Text fontSize="sm" color="gray.600" mb={3}>
          Enter skills or keywords to filter candidates. Only candidates matching ALL filters will be shown.
        </Text>
        
        <InputGroup mb={3}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.500" />
          </InputLeftElement>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) {
                addFilter(inputValue);
              }
            }}
            placeholder="Type a skill or keyword and press Enter..."
            variant="filled"
          />
          <Button 
            ml={2} 
            colorScheme="blue"
            isDisabled={!inputValue.trim()}
            onClick={() => addFilter(inputValue)}
          >
            Add Filter
          </Button>
        </InputGroup>
        
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <Box mb={2}>
            <Flex align="center" mb={2}>
              <Icon as={FiFilter} color="blue.500" mr={2} />
              <Text fontWeight="medium" color="blue.600">Active Filters:</Text>
            </Flex>
            <Flex flexWrap="wrap" gap={2}>
              {activeFilters.map((filter, index) => (
                <Tag 
                  key={index} 
                  size="md" 
                  borderRadius="full" 
                  variant="solid" 
                  colorScheme="blue"
                >
                  <TagLabel>{filter}</TagLabel>
                  <TagCloseButton onClick={() => removeFilter(index)} />
                </Tag>
              ))}
            </Flex>
          </Box>
        )}
        
        <Text fontSize="xs" color="gray.500" mt={1}>
          Only candidates matching ALL of the above filters will be displayed. Original ranking order is maintained.
        </Text>
      </FormControl>
    </Box>
  );
};

export default CandidateSearch; 