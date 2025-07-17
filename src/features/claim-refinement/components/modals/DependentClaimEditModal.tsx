import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DependentClaimEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSave: (editedText: string) => void;
}

/**
 * Modal for editing a dependent claim suggestion before inserting it into the claim set
 */
const DependentClaimEditModal: React.FC<DependentClaimEditModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onSave,
}) => {
  const [editedText, setEditedText] = useState(initialText);

  // Reset edited text when modal opens with new initialText
  useEffect(() => {
    setEditedText(initialText);
  }, [initialText, isOpen]);

  const handleSave = () => {
    onSave(editedText);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Dependent Claim</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Edit the dependent claim text below before adding it to your claim
            set:
          </p>

          <div className="space-y-2">
            <Label htmlFor="claim-text">Claim Text</Label>
            <Textarea
              id="claim-text"
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              placeholder="Enter claim text..."
              rows={8}
              className="font-mono text-sm leading-relaxed resize-y"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editedText.trim()}
            className="ml-3"
          >
            Save & Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DependentClaimEditModal;
