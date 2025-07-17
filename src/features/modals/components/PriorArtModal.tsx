import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { IconButton } from '@/components/ui/icon-button';
import { Badge } from '@/components/ui/badge';
import { FiX, FiEye } from 'react-icons/fi';
import { PriorArtReference } from '../../../types/claimTypes';

interface PriorArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorArt: PriorArtReference | null;
}

const PriorArtModal: React.FC<PriorArtModalProps> = ({
  isOpen,
  onClose,
  priorArt,
}) => {
  if (!priorArt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Prior Art Details</DialogTitle>
          <DialogDescription className="sr-only">
            View detailed information about the selected prior art reference
          </DialogDescription>
        </DialogHeader>

        <Box className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <Flex justify="between" align="center" className="mb-4">
            <Box>
              <Text size="xl" weight="bold">
                {priorArt.number.replace(/-/g, '')}
              </Text>
              <Text size="md" className="text-muted-foreground">
                {priorArt.title}
              </Text>
            </Box>
            <Badge variant="destructive" className="text-md">
              {priorArt.relevance}% Match
            </Badge>
          </Flex>

          <Box className="p-4 bg-red-50 rounded-md mb-4 dark:bg-red-900/20">
            <Text weight="medium" className="mb-2">
              Relevant Text:
            </Text>
            <Text>"{priorArt.relevantText}"</Text>
          </Box>

          <Box className="p-4 bg-muted rounded-md mb-4">
            <Text weight="medium" className="mb-2">
              Publication Year:
            </Text>
            <Text>{priorArt.year}</Text>
          </Box>
        </Box>

        <DialogFooter>
          <Button
            onClick={() =>
              window.open(
                `https://patents.google.com/patent/${priorArt.number.replace(/-/g, '')}`,
                '_blank'
              )
            }
            className="gap-1"
          >
            <FiEye className="h-4 w-4" />
            View Full Patent
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriorArtModal;
