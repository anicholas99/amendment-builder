import React from 'react';
import { Flex, Text, Select, Button, Icon, Badge, Box } from '@chakra-ui/react';
import { FiAlertTriangle, FiZap } from 'react-icons/fi';

interface Version {
  id: string;
  name: string;
  createdAt: string;
}

interface VersionSelectorProps {
  versions: Version[];
  selectedVersionId: string | undefined;
  onChange?: (id: string) => void;
  latestVersionId?: string;
  selectedReference?: string | null;
  referenceMetadata?: { isMetadataOnly?: boolean } | null;
  onRerunExtraction?: (versionId: string, reference: string) => void;
}

/**
 * Small presentational component that renders a claim-set version dropdown and
 * an optional "Run extraction" button when the current reference has no
 * citations for that version.
 */
export const VersionSelector: React.FC<VersionSelectorProps> = ({
  versions,
  selectedVersionId,
  onChange,
  latestVersionId,
  selectedReference,
  referenceMetadata,
  onRerunExtraction,
}) => {
  const newerAvailable =
    latestVersionId &&
    selectedVersionId &&
    latestVersionId !== selectedVersionId;

  return (
    <Flex align="center" mt={3} justify="space-between">
      <Flex align="center">
        <Text
          fontSize="sm"
          fontWeight="medium"
          mr={2}
          className="whitespace-nowrap max-w-30"
        >
          Claim Version:
        </Text>
        <Select
          value={selectedVersionId}
          onChange={e => onChange?.(e.target.value)}
          placeholder="Select"
          size="sm"
          maxWidth="120px"
          mr={2}
        >
          {versions.map(v => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
        {newerAvailable && (
          <Box ml={2}>
            <Badge colorScheme="orange" variant="subtle" size="sm">
              Newer version available
            </Badge>
          </Box>
        )}
      </Flex>
      {selectedReference &&
        referenceMetadata?.isMetadataOnly &&
        selectedVersionId && (
          <Button
            leftIcon={<FiZap />}
            size="sm"
            variant="primary"
            colorScheme="blue"
            onClick={() =>
              onRerunExtraction?.(selectedVersionId, selectedReference)
            }
          >
            Run Extraction For This Version
          </Button>
        )}
    </Flex>
  );
};

export default VersionSelector;
