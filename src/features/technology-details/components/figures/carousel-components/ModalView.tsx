import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ModalViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * A reusable modal component for displaying content
 */
const ModalView: React.FC<ModalViewProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [isClosing, setIsClosing] = React.useState(false);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleClose = React.useCallback(() => {
    if (!isMountedRef.current || isClosing) return;

    // Set closing state to prevent multiple close attempts
    setIsClosing(true);

    // Small delay to let any pending scroll events finish
    setTimeout(() => {
      if (isMountedRef.current) {
        onClose();
        setIsClosing(false);
      }
    }, 50);
  }, [onClose, isClosing]);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-fit h-fit bg-card">
        <DialogHeader className="border-b border-border">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center p-4 max-h-[calc(90vh-80px)] overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalView;
