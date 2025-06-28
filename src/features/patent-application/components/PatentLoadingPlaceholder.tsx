import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

/**
 * A placeholder component shown when patent data is loading
 */
const PatentLoadingPlaceholder: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="calc(100vh - 150px)"
    >
      <Text fontSize="lg" mb={4}>
        Loading patent data...
      </Text>
      <Button
        variant="primary"
        onClick={() => window.location.reload()}
        className="mt-4"
      >
        Reload Page
      </Button>
      <Text fontSize="sm" color="gray.500" className="mt-2">
        If loading takes too long, try reloading the page
      </Text>
    </Box>
  );
};

export default PatentLoadingPlaceholder;
