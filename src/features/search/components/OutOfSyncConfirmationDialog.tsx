import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { FiInfo, FiAlertTriangle } from 'react-icons/fi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OutOfSyncConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hasQueries: boolean;
  onProceedWithOldData: () => void;
  onSyncBeforeSearch: () => void;
}

export const OutOfSyncConfirmationDialog: React.FC<
  OutOfSyncConfirmationDialogProps
> = ({
  isOpen,
  onClose,
  hasQueries,
  onProceedWithOldData,
  onSyncBeforeSearch,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold">
            Claim 1 Has Changed
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4">
            <p>
              Your Claim 1 has been modified since the last search analysis.
            </p>
            <p>You have two options:</p>
            <div className="pl-4 space-y-2">
              <p>
                <strong>1. Re-sync Claim 1</strong> - Analyze the updated claim
                text to generate new search queries (recommended)
              </p>
              <p>
                <strong>2. Search with Previous Data</strong> - Use the search
                queries from the last sync
                {hasQueries
                  ? ' (queries available)'
                  : ' (no queries available)'}
              </p>
            </div>
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
              <FiInfo className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Re-syncing ensures your search results match your current claim
                language.
              </AlertDescription>
            </Alert>
            {!hasQueries && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
                <FiAlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  No search queries are available from the previous sync. You
                  may need to re-sync first.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel ref={cancelRef}>Cancel</AlertDialogCancel>
          <Button
            variant="outline"
            onClick={onProceedWithOldData}
            disabled={!hasQueries}
            title={
              !hasQueries
                ? 'No search queries available from previous sync'
                : undefined
            }
          >
            Use Old Queries
          </Button>
          <AlertDialogAction onClick={onSyncBeforeSearch}>
            Re-sync & Search
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
