import React from 'react';
import {
  VStack,
  Box,
  Text,
  Button,
  Icon,
  Flex,
  Badge,
  HStack,
  Divider,
  Textarea,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

interface Claim {
  id: string;
  number: number;
  text: string;
  type: 'independent' | 'dependent';
  dependsOn?: number;
}

interface ClaimListProps {
  claims: Claim[];
  newClaimText: string;
  setNewClaimText: (text: string) => void;
  newClaimDependsOn: number | null;
  setNewClaimDependsOn: (claimNumber: number | null) => void;
  isAddingClaim: boolean;
  setIsAddingClaim: (isAdding: boolean) => void;
  hasClaim1: boolean;
  onClaimChange: (id: string, text: string) => void;
  onDeleteClaim: (id: string) => void;
  onAddClaim: () => void;
  onParseClaim?: (claimId: string) => void;
}

/**
 * Component for displaying and managing the list of claims
 */
const ClaimList: React.FC<ClaimListProps> = ({
  claims,
  newClaimText,
  setNewClaimText,
  newClaimDependsOn,
  setNewClaimDependsOn,
  isAddingClaim,
  setIsAddingClaim,
  hasClaim1,
  onClaimChange,
  onDeleteClaim,
  onAddClaim,
  onParseClaim,
}) => {
  return (
    <Box w="100%" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Claims
        </Text>
        <Button
          leftIcon={<Icon as={FiPlus} />}
          variant="primary"
          size="standard"
          onClick={() => setIsAddingClaim(true)}
          isDisabled={isAddingClaim}
        >
          Add Claim
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        {claims.map(claim => (
          <Box
            key={claim.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            overflow="hidden"
          >
            <Flex justifyContent="space-between" alignItems="center" mb={2}>
              <HStack>
                <Badge
                  colorScheme={claim.type === 'independent' ? 'green' : 'blue'}
                >
                  Claim {claim.number}
                </Badge>
                {claim.type === 'dependent' && (
                  <Badge colorScheme="gray">
                    Depends on Claim {claim.dependsOn}
                  </Badge>
                )}
              </HStack>
              <HStack>
                {onParseClaim && (
                  <Button
                    size="action"
                    onClick={() => onParseClaim(claim.id)}
                    variant="secondary"
                  >
                    Parse
                  </Button>
                )}
                <Button
                  size="action"
                  leftIcon={<Icon as={FiTrash2} />}
                  variant="ghost-danger"
                  onClick={() => onDeleteClaim(claim.id)}
                >
                  Delete
                </Button>
              </HStack>
            </Flex>
            <Textarea
              value={claim.text}
              onChange={e => onClaimChange(claim.id, e.target.value)}
              minH="150px"
              resize="vertical"
              rows={Math.max(6, claim.text.split('\n').length)}
              onInput={e => {
                // Auto-resize the textarea to fit content
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </Box>
        ))}

        {isAddingClaim && (
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            bg="gray.50"
          >
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              New Claim
            </Text>

            {hasClaim1 && (
              <FormControl mb={3}>
                <FormLabel>Depends on</FormLabel>
                <Select
                  value={newClaimDependsOn || ''}
                  onChange={e =>
                    setNewClaimDependsOn(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                >
                  <option value="">Independent Claim</option>
                  {claims.map(claim => (
                    <option key={claim.id} value={claim.number}>
                      Claim {claim.number}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <Textarea
              value={newClaimText}
              onChange={e => setNewClaimText(e.target.value)}
              placeholder="Enter claim text..."
              minH="150px"
              mb={3}
              resize="vertical"
              rows={Math.max(6, newClaimText.split('\n').length)}
              onInput={e => {
                // Auto-resize the textarea to fit content
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />

            <Flex justifyContent="flex-end" gap={2}>
              <Button
                onClick={() => setIsAddingClaim(false)}
                variant="secondary"
                size="action"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="action"
                onClick={onAddClaim}
                isDisabled={!newClaimText.trim()}
              >
                Add Claim
              </Button>
            </Flex>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ClaimList;
