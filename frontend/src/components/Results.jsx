import React from 'react';
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
  useColorModeValue
} from '@chakra-ui/react';
import SaveResults from './SaveResults';

const Results = ({ results, isLoading, handleSubmit }) => {
  const topRankBg = useColorModeValue('yellow.50', 'yellow.900');
  const rankBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Button
        colorScheme="blue"
        size="lg"
        width="full"
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Processing Resumes"
        mb={8}
        height="60px"
        fontSize="md"
        shadow="md"
      >
        Rank Resumes
      </Button>

      {isLoading && (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" mb={4} />
          <Text color="gray.600">Analyzing resumes against job description...</Text>
        </Box>
      )}

      {!isLoading && results && (
        <VStack spacing={6} align="stretch">
          <Flex align="center" justify="space-between">
            <Heading as="h2" size="lg" mb={2}>Ranking Results</Heading>
            <SaveResults results={results} />
          </Flex>
          
          <List spacing={4}>
            {results.map((result, index) => (
              <ListItem 
                key={index}
                p={4} 
                borderWidth="1px" 
                borderRadius="lg"
                borderLeftWidth="4px"
                borderLeftColor={index === 0 ? "yellow.400" : "blue.400"}
                bg={index === 0 ? topRankBg : rankBg}
                shadow="md"
                transition="transform 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "lg"
                }}
              >
                <Flex direction="column" gap={2}>
                  <Flex align="center" justify="space-between">
                    <HStack>
                      <Heading as="h3" size="md">
                        {index === 0 && "👑 "}
                        {result.name}
                      </Heading>
                      <Badge colorScheme={index === 0 ? "yellow" : "blue"}>
                        Rank #{result.rank + 1}
                      </Badge>
                    </HStack>
                    <Text fontWeight="bold">
                      {(result.similarity * 100).toFixed(1)}%
                    </Text>
                  </Flex>
                  
                  <Progress 
                    value={result.similarity * 100} 
                    colorScheme={index === 0 ? "yellow" : "blue"} 
                    height="8px"
                    borderRadius="full" 
                  />
                  
                  {result.entities && result.entities.length > 0 && (
                    <Box mt={2}>
                      <Text fontWeight="medium" mb={1}>Key Skills:</Text>
                      <Flex flexWrap="wrap" gap={2}>
                        {result.entities.slice(0, 8).map((skill, i) => (
                          <Tag key={i} size="sm" colorScheme="green" variant="subtle">
                            {skill}
                          </Tag>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </ListItem>
            ))}
          </List>
        </VStack>
      )}
    </Box>
  );
};

export default Results; 