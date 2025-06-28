import React from 'react';
import {
  Box,
  Badge,
  Button,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  Center,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { FiPlus, FiRefreshCw, FiCopy } from 'react-icons/fi';
import { useTemporaryState } from '@/hooks/useTemporaryState';
import { logger } from '@/lib/monitoring/logger';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import ClaimsView from './ClaimsView';
import AddNewClaimForm from './AddNewClaimForm';
import MirrorClaimsModal from './MirrorClaimsModal';
import { useClaimMirroring, ClaimType } from '@/hooks/api/useClaimMirroring';

// Helper to get claim count safely
const getClaimCount = (claims: Array<{ id: string; claimNumber: number; text: string }> | undefined) => claims?.length || 0;

interface ClaimMainPanelProps {
  projectId: string;
  claims: Array<{ id: string; claimNumber: number; text: string }> | undefined;
  isLoadingClaims: boolean;
  claimViewMode: 'list' | 'box';
  onToggleViewMode: () => void;
  onGenerateClaim1: () => void;
  onClaimChange: (claimId: string, text: string) => void;
  onDeleteClaim: (claimId: string) => void;
  onInsertClaim: (afterClaimId: string) => void;
  onReorderClaim: (claimId: string, direction: 'up' | 'down') => void;
  isRegeneratingClaim1: boolean;
  isAddingClaim: boolean;
  newClaimText: string;
  setNewClaimText: (text: string) => void;
  newClaimDependsOn: string;
  setNewClaimDependsOn: (claimNumber: string) => void;
  onCancelAddClaim: () => void;
  onAddClaim: () => void;
  onStartAddClaim: () => void;
}

const ClaimMainPanel: React.FC<ClaimMainPanelProps> = ({
  projectId,
  claims,
  isLoadingClaims,
  claimViewMode,
  onToggleViewMode: _onToggleViewMode,
  onGenerateClaim1,
  onClaimChange,
  onDeleteClaim,
  onInsertClaim,
  onReorderClaim,
  isRegeneratingClaim1,
  isAddingClaim,
  newClaimText,
  setNewClaimText,
  newClaimDependsOn,
  setNewClaimDependsOn,
  onCancelAddClaim,
  onAddClaim,
  onStartAddClaim,
}) => {
  const claimCount = getClaimCount(claims);
  const hasClaims = claimCount > 0;

  const [lastAddedClaimNumber, setLastAddedClaimNumber] = useTemporaryState<
    string | undefined
  >(undefined, 3000);

  // Mirror claims functionality
  const { isOpen: isMirrorModalOpen, onOpen: onOpenMirrorModal, onClose: onCloseMirrorModal } = useDisclosure();
  const mirrorClaimsMutation = useClaimMirroring();

  const handleMirrorClaims = (targetType: ClaimType) => {
    if (!claims || claims.length === 0) return;

    const claimIds = claims.map(claim => claim.id);
    
    mirrorClaimsMutation.mutate({
      projectId,
      claimIds,
      targetType,
    }, {
      onSuccess: () => {
        onCloseMirrorModal();
      },
    });
  };

  const headerContent = (
    <Box
      p={2}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
    >
      <HStack spacing={3}>
        <Text fontSize="md" fontWeight="bold">
          Claims
        </Text>
        <Badge colorScheme="blue" fontSize="sm" borderRadius="full">
          {isLoadingClaims ? '...' : claimCount}
        </Badge>
      </HStack>

      <HStack spacing={2}>
        {hasClaims && (
          <>
            <Button
              leftIcon={<FiCopy />}
              variant="outline"
              size="sm"
              onClick={onOpenMirrorModal}
              isDisabled={mirrorClaimsMutation.isPending}
            >
              Mirror Claims
            </Button>
            {!isAddingClaim && (
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="sm"
                onClick={onStartAddClaim}
                data-testid="add-claim-button"
              >
                Add Claim
              </Button>
            )}
            <Tooltip label="Regenerate Claim 1" placement="top" hasArrow>
              <IconButton
                aria-label="Regenerate Claim 1"
                icon={<Icon as={FiRefreshCw} />}
                size="sm"
                variant="outline"
                onClick={onGenerateClaim1}
                isLoading={isRegeneratingClaim1}
                isDisabled={isRegeneratingClaim1}
              />
            </Tooltip>
          </>
        )}
      </HStack>
    </Box>
  );

  return (
    <>
      <SimpleMainPanel header={headerContent}>
        {isLoadingClaims && (
          <Center p={10}>
            <Spinner />
          </Center>
        )}

        {!isLoadingClaims && hasClaims && (
          <>
            {isAddingClaim && (
              <Box>
                <AddNewClaimForm
                  newClaimText={newClaimText}
                  setNewClaimText={setNewClaimText}
                  newClaimDependsOn={newClaimDependsOn}
                  setNewClaimDependsOn={setNewClaimDependsOn}
                  onCancel={onCancelAddClaim}
                  onAddClaim={onAddClaim}
                />
              </Box>
            )}
            <ClaimsView
              claims={claims}
              claimViewMode={claimViewMode}
              onClaimChange={onClaimChange}
              onDeleteClaim={onDeleteClaim}
              onInsertClaim={onInsertClaim}
              onReorderClaim={onReorderClaim}
              lastAddedClaimNumber={lastAddedClaimNumber}
            />
          </>
        )}

        {!isLoadingClaims && !hasClaims && (
          <Box py={8} px={6} textAlign="center" mx="auto" bg="bg.card">
            <Text color="text.secondary" mb={6}>
              No claims found in your invention disclosure
            </Text>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={onGenerateClaim1}
              isLoading={isRegeneratingClaim1}
              leftIcon={<FiRefreshCw />}
            >
              Generate Claim 1
            </Button>
            <Text fontSize="sm" color="text.tertiary" mt={4}>
              Start by generating just Claim 1, which you can refine before
              generating dependent claims.
            </Text>
          </Box>
        )}
      </SimpleMainPanel>

      <MirrorClaimsModal
        isOpen={isMirrorModalOpen}
        onClose={onCloseMirrorModal}
        onConfirm={handleMirrorClaims}
        claimCount={claimCount}
        isLoading={mirrorClaimsMutation.isPending}
      />
    </>
  );
};

export default ClaimMainPanel;
