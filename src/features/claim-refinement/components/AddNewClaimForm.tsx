import React from 'react';
import { Box, Text, Flex, Button } from '@chakra-ui/react';
import { Input, Textarea } from '@chakra-ui/react';

interface AddNewClaimFormProps {
  newClaimText: string;
  setNewClaimText: (text: string) => void;
  newClaimDependsOn: string;
  setNewClaimDependsOn: (claimNumber: string) => void;
  onCancel: () => void;
  onAddClaim: () => void;
}

/**
 * Form component for adding a new claim
 */
const AddNewClaimForm: React.FC<AddNewClaimFormProps> = ({
  newClaimText,
  setNewClaimText,
  newClaimDependsOn,
  setNewClaimDependsOn,
  onCancel,
  onAddClaim,
}) => {
  return (
    <Box id="add-claim-form" borderWidth="1px" borderRadius="md" mb={4}>
      <Box p={4}>
        <Text fontWeight="bold" mb={3}>
          Add New Claim
        </Text>

        <Flex mb={3}>
          <Text mr={2}>Claim Type:</Text>
          <Button
            size="sm"
            colorScheme={!newClaimDependsOn ? 'blue' : 'gray'}
            mr={2}
            onClick={() => setNewClaimDependsOn('')}
          >
            Independent
          </Button>
          <Button
            size="sm"
            colorScheme={newClaimDependsOn ? 'blue' : 'gray'}
            onClick={() => setNewClaimDependsOn('1')}
          >
            Dependent
          </Button>
        </Flex>

        {newClaimDependsOn && (
          <Flex align="center" mb={3}>
            <Text mr={2}>Depends on Claim:</Text>
            <Input
              value={newClaimDependsOn}
              onChange={e => setNewClaimDependsOn(e.target.value)}
              size="sm"
              width="60px"
            />
          </Flex>
        )}

        <Textarea
          value={newClaimText}
          onChange={e => setNewClaimText(e.target.value)}
          placeholder="Enter claim text..."
          size="md"
          mb={3}
          minHeight="150px"
          resize="vertical"
          rows={Math.max(6, newClaimText.split('\n').length)}
          onInput={e => {
            // Auto-resize the textarea to fit content
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />

        <Flex justify="flex-end">
          <Button mr={2} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={onAddClaim}
            isDisabled={!newClaimText.trim()}
          >
            Add Claim
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default AddNewClaimForm;
