import React from 'react';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    <Box className="mt-4 mb-4">
      <Button
        size="default"
        onClick={onRegenerate}
        disabled={isGenerating}
        className="w-full gap-2"
      >
        <FiRefreshCw
          className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
        />
        {isGenerating
          ? `Generating... ${generationProgress}%`
          : 'Regenerate Patent Application'}
      </Button>
      {isGenerating && (
        <Progress
          value={generationProgress}
          size="md"
          className="mt-3 rounded-md"
          animated={true}
          showShimmer={true}
          colorScheme="blue"
        />
      )}
    </Box>
  );
};

export default RegeneratePatentButton;
