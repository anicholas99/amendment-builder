import React, { useState } from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import { FiSave } from 'react-icons/fi';
import SaveVersionModal from '../../version/components/SaveVersionModal';

interface SaveVersionButtonProps {
  onSave: (description?: string) => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SaveVersionButton: React.FC<SaveVersionButtonProps> = ({
  onSave,
  disabled = false,
  size = 'sm',
}) => {
  const [versionDescription, setVersionDescription] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSave = async () => {
    await onSave(versionDescription);
    setVersionDescription(''); // Reset after save
    onClose(); // Close modal after save
  };

  return (
    <>
      <Button
        size={size}
        leftIcon={<FiSave />}
        onClick={onOpen}
        colorScheme="green"
        disabled={disabled}
      >
        Save Version
      </Button>

      <SaveVersionModal
        isOpen={isOpen}
        onClose={onClose}
        versionDescription={versionDescription}
        setVersionDescription={setVersionDescription}
        onSave={handleSave}
      />
    </>
  );
};

export default SaveVersionButton;
