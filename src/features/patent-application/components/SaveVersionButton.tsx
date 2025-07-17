import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const handleSave = async () => {
    await onSave(versionDescription);
    setVersionDescription(''); // Reset after save
    onClose(); // Close modal after save
  };

  return (
    <>
      <Button
        size={size === 'md' ? 'default' : size}
        onClick={onOpen}
        disabled={disabled}
        className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
      >
        <FiSave className="mr-2 h-4 w-4" />
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
