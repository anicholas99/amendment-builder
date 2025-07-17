import React from 'react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
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
    <Flex align="center" justify="between" className="mt-3">
      <Flex align="center">
        <Text
          size="sm"
          weight="medium"
          className="whitespace-nowrap max-w-30 mr-2"
        >
          Claim Version:
        </Text>
        <Select value={selectedVersionId} onValueChange={onChange}>
          <SelectTrigger className="w-32 h-8 mr-2">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {versions.map(v => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {newerAvailable && (
          <Box className="ml-2">
            <Badge variant="secondary" className="text-xs">
              Newer version available
            </Badge>
          </Box>
        )}
      </Flex>
      {selectedReference &&
        referenceMetadata?.isMetadataOnly &&
        selectedVersionId && (
          <Button
            size="sm"
            onClick={() =>
              onRerunExtraction?.(selectedVersionId, selectedReference)
            }
            className="gap-1"
          >
            <FiZap className="h-4 w-4" />
            Run Extraction For This Version
          </Button>
        )}
    </Flex>
  );
};

export default VersionSelector;
