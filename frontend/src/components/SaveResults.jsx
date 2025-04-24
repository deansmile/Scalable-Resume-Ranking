import React from 'react';
import { Button, Icon, useToast } from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';

const SaveResults = ({ results }) => {
  const toast = useToast();

  const handleSaveResults = () => {
    if (!results || results.length === 0) {
      toast({
        title: 'No results to save',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Format the results as CSV
      const headers = ['Rank', 'Name', 'Score', 'Skills'];
      const csvContent = [
        headers.join(','),
        ...results.map(result => [
          result.rank + 1,
          result.name,
          (result.similarity * 100).toFixed(1) + '%',
          result.entities ? result.entities.join(';') : ''
        ].join(','))
      ].join('\\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `resume-ranking-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Results saved',
        description: 'Resume rankings have been downloaded as a CSV file',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving results:', error);
      toast({
        title: 'Error',
        description: 'Failed to save results',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      leftIcon={<Icon as={FiDownload} />}
      colorScheme="green"
      variant="outline"
      size="sm"
      onClick={handleSaveResults}
      isDisabled={!results || results.length === 0}
    >
      Save Results
    </Button>
  );
};

export default SaveResults; 