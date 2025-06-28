import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Icon,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi';
import { ClaimVersion } from '../../../types/claimTypes';
import { formatDate } from '../utils/validation';

interface ClaimHistoryProps {
  claimVersions: ClaimVersion[];
  onRestoreVersion: (version: ClaimVersion) => void;
}

const ClaimHistory: React.FC<ClaimHistoryProps> = ({
  claimVersions,
  onRestoreVersion,
}): JSX.Element => {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <HStack flex="1">
              <Box as={FiClock} />
              <Text>Claims History</Text>
              <Badge colorScheme="blue">{claimVersions.length}</Badge>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <VStack align="stretch" spacing={4}>
            {claimVersions.map((version, index) => (
              <Box
                key={version.timestamp}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                position="relative"
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold">
                    Version {claimVersions.length - index}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(version.timestamp.toString())}
                  </Text>
                </HStack>
                <Text mb={3}>{version.description}</Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => onRestoreVersion(version)}
                >
                  Restore This Version
                </Button>
              </Box>
            ))}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default ClaimHistory;
