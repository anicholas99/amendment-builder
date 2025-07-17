import { useToast } from '@/hooks/useToastWrapper';
import { useApiMutation } from '@/lib/api/queryClient';
import { logger } from '@/utils/clientLogger';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { InventionData } from '@/types';

interface UseSimpleClaimGenerationProps {
  onClaimGenerated: (claimText: string) => void;
}

interface GenerateClaimPayload {
  projectId: string;
  invention: InventionData | null;
}

export const useSimpleClaimGeneration = ({
  onClaimGenerated,
}: UseSimpleClaimGenerationProps) => {
  const toast = useToast();

  const {
    mutate: generateClaim1,
    isPending: isGenerating,
    error,
  } = useApiMutation<
    { claim: string; critique?: string },
    GenerateClaimPayload
  >({
    mutationFn: ({ projectId, invention }: GenerateClaimPayload) => {
      if (!invention) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'No invention data available'
        );
      }
      return ClaimsClientService.generateClaim1(projectId, invention);
    },
    onSuccess: data => {
      if (!data.claim) {
        throw new Error('No claim text in response');
      }
      onClaimGenerated(data.claim);
      toast({
        title: 'Success',
        description: 'Claim 1 has been generated and saved',
        status: 'success',
        duration: 3000,
      });
      logger.info('[ClaimGen] Successfully generated and saved claim 1');
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      logger.error('[SimpleClaimGen] Error:', { error: err });
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    },
  });

  return {
    generateClaim1,
    isGenerating,
    error,
  };
};
