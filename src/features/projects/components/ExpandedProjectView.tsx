import React, { useState } from 'react';
import { Box, Heading, VStack, Divider } from '@chakra-ui/react';
import ProjectList from './ProjectList';

interface ExpandedProjectViewProps {
  projectName: string;
  projectDescription: string;
  onDocumentSelect: (projectId: string, documentType: string) => void;
}

const ExpandedProjectView: React.FC<ExpandedProjectViewProps> = ({
  projectName,
  projectDescription,
  onDocumentSelect,
}) => {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

  return (
    <Box>
      <VStack align="stretch" spacing={4} p={4}>
        <Heading size="md">Projects</Heading>
        <Divider />
        <ProjectList
          expandedIndices={expandedIndices}
          onExpandedChange={setExpandedIndices}
          onDocumentSelect={onDocumentSelect}
        />
      </VStack>
    </Box>
  );
};

export default ExpandedProjectView;
