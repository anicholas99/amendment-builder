import React, { useState, useRef, useEffect } from 'react';
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
import { useToast } from '@/hooks/useToastWrapper';
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
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                ref={initialRef}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Enter a new name"
                onKeyDown={e => e.key === 'Escape' && onClose()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isRenaming ||
                !newName.trim() ||
                newName.trim() === currentName
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting || isRenaming ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
