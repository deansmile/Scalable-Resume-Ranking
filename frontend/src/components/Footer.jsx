import React from 'react';
import { Box, Text, Center, HStack, Icon } from '@chakra-ui/react';
import { FaAws, FaReact } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box as="footer" bg="gray.100" py={4}>
      <Center>
        <HStack spacing={1}>
          <Text fontSize="sm" color="gray.600">
            © {new Date().getFullYear()} Resume Ranking System
          </Text>
          <HStack spacing={2} ml={2}>
            <Icon as={FaAws} color="orange.500" />
            <Icon as={FaReact} color="blue.400" />
          </HStack>
        </HStack>
      </Center>
    </Box>
  );
};

export default Footer; 