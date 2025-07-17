import React, { useState } from 'react';
import { FiCheck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { claimQueryKeys } from '@/hooks/api/useClaims';
import { ClaimApiService } from '@/client/services/claim.client-service';
import { emitClaimUpdateEvent } from '@/features/claim-refinement/utils/claimUpdateEvents';
import { logger } from '@/utils/clientLogger';
import { chatKeys } from '@/lib/queryKeys';

interface DiffChange {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

interface RevisionDiffProps {
  claimId: string;
  claimNumber: number;
  changes: DiffChange[];
  projectId: string;
  proposedText?: string;
}

export const ClaimRevisionDiff: React.FC<RevisionDiffProps> = ({
  claimId,
  claimNumber,
  changes,
  projectId,
  proposedText,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasBeenApplied, setHasBeenApplied] = useState(false);

  // Mutation to apply the revision
  const applyRevisionMutation = useMutation({
    mutationFn: async () => {
      if (!proposedText) {
        // Extract proposed text from changes if not provided
        const proposed = changes
          .filter(c => c.type !== 'removed')
          .map(c => c.value)
          .join('');
        return ClaimApiService.updateClaim(projectId, claimId, proposed);
      }
      return ClaimApiService.updateClaim(projectId, claimId, proposedText);
    },
    onMutate: async () => {
      // Optimistic update - immediately show the revised claim
      const finalText =
        proposedText ||
        changes
          .filter(c => c.type !== 'removed')
          .map(c => c.value)
          .join('');

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: claimQueryKeys.list(projectId),
      });

      // Snapshot the previous value
      const previousClaims = queryClient.getQueryData(
        claimQueryKeys.list(projectId)
      );

      // Optimistically update the claim in the cache
      queryClient.setQueryData(claimQueryKeys.list(projectId), (old: any) => {
        if (!old?.claims) return old;

        return {
          ...old,
          claims: old.claims.map((claim: any) =>
            claim.id === claimId ? { ...claim, text: finalText } : claim
          ),
        };
      });

      // Return context object with snapshot
      return { previousClaims };
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousClaims) {
        queryClient.setQueryData(
          claimQueryKeys.list(projectId),
          context.previousClaims
        );
      }

      logger.error('[ClaimRevisionDiff] Failed to apply revision', { error });
      toast({
        title: 'Update Failed',
        description: 'Failed to apply the revision. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      // Invalidate claims queries with active refetch to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: claimQueryKeys.list(projectId),
        refetchType: 'active',
      });

      // Emit claim update event
      emitClaimUpdateEvent({
        projectId,
        action: 'edited',
      });

      // Store last action context for chat
      queryClient.setQueryData([...chatKeys.context(projectId)], {
        lastAction: {
          type: 'claim-revised' as const,
          claimNumber: claimNumber,
        },
      });

      setHasBeenApplied(true);

      toast({
        title: 'Claim Updated',
        description: `Claim ${claimNumber} has been successfully revised.`,
      });
    },
  });

  const handleApply = () => {
    applyRevisionMutation.mutate();
  };

  const handleReject = () => {
    setIsExpanded(false);
    toast({
      title: 'Revision Rejected',
      description: 'The proposed revision has been discarded.',
    });
  };

  if (hasBeenApplied) {
    return (
      <div
        className={cn(
          'p-4 rounded-md border mb-2',
          'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
        )}
      >
        <div className="flex items-center gap-2">
          <FiCheck className="text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Revision applied successfully to claim {claimNumber}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden mb-2">
      {/* Header */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-between p-4 cursor-pointer',
              'bg-muted/50 hover:bg-muted/70 transition-colors'
            )}
          >
            <span className="text-sm font-medium">
              Proposed Revision for Claim {claimNumber}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <FiChevronUp className="w-3 h-3" />
              ) : (
                <FiChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent>
          <div className="p-4">
            {/* Diff display */}
            <div
              className={cn(
                'p-4 rounded-md font-mono text-sm leading-relaxed mb-4 overflow-x-auto',
                'bg-muted/50 dark:bg-muted/80'
              )}
            >
              {changes.map((change, idx) => {
                if (change.type === 'added') {
                  return (
                    <span
                      key={idx}
                      className={cn(
                        'px-0.5 font-semibold',
                        'bg-green-50 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                      )}
                    >
                      {change.value}
                    </span>
                  );
                } else if (change.type === 'removed') {
                  return (
                    <span
                      key={idx}
                      className={cn(
                        'px-0.5 line-through opacity-70',
                        'bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                      )}
                    >
                      {change.value}
                    </span>
                  );
                } else {
                  return <span key={idx}>{change.value}</span>;
                }
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={applyRevisionMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
              >
                <FiX className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={applyRevisionMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
              >
                <FiCheck className="w-4 h-4 mr-1" />
                {applyRevisionMutation.isPending
                  ? 'Applying...'
                  : 'Apply Revision'}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
