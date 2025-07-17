import React from 'react';
import { FiX, FiEye } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PriorArtReference } from '../../../types/claimTypes';
import { getRelevanceBadgeClasses } from '../../search/utils/searchHistoryUtils';

interface PriorArtDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorArt: PriorArtReference | null;
}

const PriorArtDetailsModal: React.FC<PriorArtDetailsModalProps> = ({
  isOpen,
  onClose,
  priorArt,
}) => {
  if (!priorArt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-bold">
              Prior Art Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed information about the selected prior art reference
            </DialogDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close"
            >
              <FiX className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">
                {typeof priorArt.number === 'string'
                  ? priorArt.number.replace(/-/g, '')
                  : 'N/A'}
              </h3>
              <p className="text-base text-muted-foreground">
                {priorArt.title || 'No Title'}
              </p>
            </div>
            <Badge
              className={cn(
                'text-base',
                typeof priorArt.relevance === 'number'
                  ? getRelevanceBadgeClasses(priorArt.relevance)
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              )}
            >
              {typeof priorArt.relevance === 'number'
                ? `${Math.round(priorArt.relevance * 100)}% Match`
                : 'N/A'}
            </Badge>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-md mb-4">
            <p className="font-medium mb-2">Relevant Text:</p>
            <p>"{priorArt.relevantText || 'N/A'}"</p>
          </div>

          <div className="p-4 bg-muted rounded-md mb-4">
            <p className="font-medium mb-2">Publication Year:</p>
            <p>{priorArt.year || 'N/A'}</p>
          </div>

          {/* REMOVED: Abstract display
          {priorArt.abstract && (
            <div className="p-4 bg-muted rounded-md mb-4">
              <p className="font-medium mb-2">
                Abstract:
              </p>
              <p className="text-sm line-clamp-5">
                {priorArt.abstract}
              </p>
            </div>
          )}
          */}
        </div>

        <DialogFooter className="p-4 border-t">
          <Button
            onClick={() =>
              window.open(
                `https://patents.google.com/patent/${typeof priorArt.number === 'string' ? priorArt.number.replace(/-/g, '') : ''}`,
                '_blank'
              )
            }
            className="gap-1"
          >
            <FiEye className="h-4 w-4" />
            View Full Patent
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriorArtDetailsModal;
