import React from 'react';
import { Box, Flex, Heading, Spacer, HStack, Text } from '@chakra-ui/react';

const Header = () => {
  return (
    <Box as="header" bg="blue.600" color="white" py={4} px={6} shadow="md">
      <Flex align="center" maxW="container.xl" mx="auto">
        <Heading as="h1" size="lg">Resume Ranking System</Heading>
        <Spacer />
        <HStack spacing={4}>
          <Text fontSize="sm">Powered by AWS</Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header; 