import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { useProjectActions } from '../../hooks/useProjectActions';
import { useNextTick } from '@/hooks/useNextTick';

interface RenameProjectModalProps {
  projectId: string;
  currentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({
  projectId,
  currentName,
  isOpen,
  onClose,
}) => {
  const [newName, setNewName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialRef = useRef<HTMLInputElement>(null);
  const { renameProject, isRenaming } = useProjectActions();
  const { nextTick } = useNextTick();

  // Reset form when modal opens with current name
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  // Focus the input when the modal opens
  useEffect(() => {
    if (isOpen && initialRef.current) {
      nextTick(() => {
        initialRef.current?.focus();
        initialRef.current?.select();
      });
    }
  }, [isOpen, nextTick]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || newName.trim() === currentName) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await renameProject(projectId, newName);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Rename Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Project name</FormLabel>
              <Input
                ref={initialRef}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Enter a new name"
                onKeyDown={e => e.key === 'Escape' && onClose()}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              type="submit"
              isLoading={isSubmitting || isRenaming}
              disabled={!newName.trim() || newName.trim() === currentName}
            >
              Save
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
