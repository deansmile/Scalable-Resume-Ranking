import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box
} from '@chakra-ui/react';

const ErrorDisplay = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Alert status="error" variant="solid" borderRadius="md">
      <AlertIcon />
      <Box flex="1">
        <AlertTitle mr={2}>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Box>
      {onClose && (
        <CloseButton 
          position="absolute" 
          right="8px" 
          top="8px" 
          onClick={onClose} 
        />
      )}
    </Alert>
  );
};

export default ErrorDisplay; 