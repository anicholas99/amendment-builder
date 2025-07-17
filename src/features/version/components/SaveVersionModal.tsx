import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Save Version
          </DialogTitle>
          <DialogDescription>
            Add a description for this version:
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="version-description" className="sr-only">
              Version Description
            </Label>
            <Input
              id="version-description"
              value={versionDescription}
              onChange={e => setVersionDescription(e.target.value)}
              placeholder="e.g., Updated FIELD section"
              onKeyDown={handleKeyPress}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button ref={cancelRef} variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveVersionModal;
