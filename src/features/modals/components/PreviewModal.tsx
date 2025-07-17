import React from 'react';
import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: Record<string, string>;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  claims,
}) => {
  const { isDarkMode } = useThemeContext();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Preview Content
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {Object.entries(claims).map(([number, text], index) => (
            <div
              key={index}
              className={cn(
                'p-4 border rounded-md',
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <Badge>Claim {number}</Badge>
              </div>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
