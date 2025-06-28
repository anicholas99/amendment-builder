import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Input,
  Text,
} from '@chakra-ui/react';

interface SaveVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionDescription: string;
  setVersionDescription: (description: string) => void;
  onSave: () => void;
}

const SaveVersionModal: React.FC<SaveVersionModalProps> = ({
  isOpen,
  onClose,
  versionDescription,
  setVersionDescription,
  onSave,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleSave = () => {
    onSave();
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="semibold">
            Save Version
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text mb={4}>Add a description for this version:</Text>
            <Input
              value={versionDescription}
              onChange={e => setVersionDescription(e.target.value)}
              placeholder="e.g., Updated FIELD section"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSave} ml={3}>
              Save
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default SaveVersionModal;
