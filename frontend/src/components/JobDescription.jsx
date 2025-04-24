import React from 'react';
import { Box, Textarea, FormControl, FormLabel, Text, Flex, Icon, HStack } from '@chakra-ui/react';
import { FiBriefcase } from 'react-icons/fi';
import SampleJobDescriptions from './SampleJobDescriptions';

const JobDescription = ({ jobDescription, setJobDescription }) => {
  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
      <FormControl>
        <Flex align="center" justify="space-between" mb={2}>
          <Flex align="center">
            <Icon as={FiBriefcase} mr={2} color="blue.500" />
            <FormLabel fontWeight="bold" mb={0}>
              Job Description
            </FormLabel>
          </Flex>
          <SampleJobDescriptions setJobDescription={setJobDescription} />
        </Flex>
        <Text mb={4} fontSize="sm" color="gray.600">
          Enter the job description or requirements for the position
        </Text>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter job title, responsibilities, required skills, and other relevant information..."
          size="md"
          rows={8}
          resize="vertical"
          borderColor="gray.300"
          _hover={{ borderColor: 'gray.400' }}
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
        />
      </FormControl>
    </Box>
  );
};

export default JobDescription; 