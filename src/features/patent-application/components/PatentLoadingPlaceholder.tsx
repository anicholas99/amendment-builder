import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useViewHeight } from '@/hooks/useViewHeight';

/**
 * A placeholder component shown when patent data is loading
 */
const PatentLoadingPlaceholder: React.FC = () => {
  const viewHeight = useViewHeight();

  return (
    <Box
      className="flex flex-col justify-center items-center"
      style={{ height: viewHeight }}
    >
      <Text size="lg" className="mb-4">
        Loading patent data...
      </Text>
      <Button onClick={() => window.location.reload()} className="mt-4">
        Reload Page
      </Button>
      <Text size="sm" className="text-muted-foreground mt-2">
        If loading takes too long, try reloading the page
      </Text>
    </Box>
  );
};

export default PatentLoadingPlaceholder;
