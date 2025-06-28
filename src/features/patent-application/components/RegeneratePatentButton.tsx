import React from 'react';
import { Box, Button, Icon } from '@chakra-ui/react';
import { Progress } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';

interface RegeneratePatentButtonProps {
  onRegenerate: () => void;
  isGenerating: boolean;
  generationProgress: number;
}

const RegeneratePatentButton: React.FC<RegeneratePatentButtonProps> = ({
  onRegenerate,
  isGenerating,
  generationProgress,
}) => {
  return (
    <Box mt={4} mb={4}>
      <Button
        leftIcon={<Icon as={FiRefreshCw} />}
        variant="primary"
        size="md"
        onClick={onRegenerate}
        isLoading={isGenerating}
        loadingText={`Generating... ${generationProgress}%`}
        width="100%"
      >
        Regenerate Patent Application
      </Button>
      {isGenerating && (
        <Progress
          value={generationProgress}
          size="sm"
          colorScheme="blue"
          mt={2}
          borderRadius="md"
        />
      )}
    </Box>
  );
};

export default RegeneratePatentButton;
