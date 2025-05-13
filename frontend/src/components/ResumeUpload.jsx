import React, { useRef } from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  FormControl, 
  FormLabel,
  Icon,
  List,
  ListItem,
  CloseButton,
  Flex,
  useColorModeValue,
  HStack,
  useToast
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiAlertCircle } from 'react-icons/fi';
import config from '../config';

const ResumeUpload = ({ files, setFiles, isDisabled = false }) => {
  const fileInputRef = useRef(null);
  const toast = useToast();
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const validateFile = (file) => {
    // Check file size
    if (file.size > config.MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: `${file.name} exceeds the maximum file size of ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    // Check file type
    if (!file.type.includes('pdf') && !file.type.includes('text/plain')) {
      toast({
        title: 'Invalid file type',
        description: `${file.name} is not a PDF or TXT file`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate maximum number of files
    if (files.length + selectedFiles.length > config.MAX_FILES) {
      toast({
        title: 'Too many files',
        description: `You can upload a maximum of ${config.MAX_FILES} files`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Filter out invalid files
    const validFiles = selectedFiles.filter(validateFile);
    setFiles([...files, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Validate maximum number of files
      if (files.length + droppedFiles.length > config.MAX_FILES) {
        toast({
          title: 'Too many files',
          description: `You can upload a maximum of ${config.MAX_FILES} files`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Filter out invalid files
      const validFiles = droppedFiles.filter(validateFile);
      setFiles([...files, ...validFiles]);
    }
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md" position="relative">
      <FormControl isDisabled={isDisabled}>
        <Flex align="center" mb={2}>
          <Icon as={FiFile} mr={2} color={isDisabled ? "gray.400" : "blue.500"} />
          <FormLabel fontWeight="bold" mb={0}>
            Resume Upload
          </FormLabel>
        </Flex>
        <Text mb={4} fontSize="sm" color="gray.600">
          Upload up to {config.MAX_FILES} resumes in PDF or TXT format (max {config.MAX_FILE_SIZE / (1024 * 1024)}MB each)
        </Text>
        
        <VStack spacing={4} align="stretch">
          <Box
            border="2px dashed"
            borderColor={isDisabled ? "gray.200" : borderColor}
            borderRadius="md"
            p={6}
            textAlign="center"
            bg={isDisabled ? "gray.100" : "gray.50"}
            opacity={isDisabled ? 0.6 : 1}
            _hover={{ 
              bg: !isDisabled && hoverBg, 
              cursor: isDisabled ? "not-allowed" : "pointer" 
            }}
            onClick={() => !isDisabled && fileInputRef.current.click()}
            onDragOver={!isDisabled ? handleDragOver : undefined}
            onDrop={!isDisabled ? handleDrop : undefined}
            transition="all 0.2s"
          >
            <input
              type="file"
              multiple
              accept=".pdf,.txt"
              onChange={!isDisabled ? handleFileChange : undefined}
              style={{ display: 'none' }}
              ref={fileInputRef}
              disabled={isDisabled}
            />
            
            <Icon as={FiUpload} w={10} h={10} color="gray.400" mb={2} />
            <Text fontWeight="medium">
              {isDisabled ? "Upload service unavailable" : "Click to upload or drag and drop"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {isDisabled ? "Please try again later" : `PDF or TXT files (up to ${config.MAX_FILES})`}
            </Text>
          </Box>
          
          {files.length > 0 && (
            <List spacing={2} mt={4}>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <Flex 
                    p={2} 
                    bg="gray.50" 
                    borderRadius="md" 
                    alignItems="center"
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack flex="1">
                      <Icon as={FiFile} color="blue.500" />
                      <Text isTruncated>{file.name}</Text>
                    </HStack>
                    <CloseButton 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        !isDisabled && handleRemoveFile(index);
                      }} 
                      isDisabled={isDisabled}
                    />
                  </Flex>
                </ListItem>
              ))}
            </List>
          )}
        </VStack>
      </FormControl>
    </Box>
  );
};

export default ResumeUpload; 