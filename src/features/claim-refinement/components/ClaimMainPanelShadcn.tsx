import React from 'react';
import { cn } from '@/lib/utils';
import {
  FiPlus,
  FiRefreshCw,
  FiCopy,
  FiGrid,
  FiMenu,
  FiZoomOut,
  FiZoomIn,
  FiClock,
} from 'react-icons/fi';
import { useTemporaryState } from '@/hooks/useTemporaryState';
import { logger } from '@/utils/clientLogger';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import ClaimsViewShadcn from './ClaimsViewShadcn';
import AddNewClaimFormShadcn from './AddNewClaimFormShadcn';
import MirrorClaimsModal from './MirrorClaimsModal';
import { useClaimMirroring, ClaimType } from '@/hooks/api/useClaimMirroring';
import { useZoomControls } from '@/features/technology-details/components/TechMainPanel/hooks/useZoomControls';
import { SaveClaimVersionButtonShadcn } from './SaveClaimVersionButtonShadcn';
import { ClaimVersionHistoryModal } from './ClaimVersionHistoryModal';
import { useInventionData } from '@/hooks/useInventionData';
import { useRouter } from 'next/router';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Loader } from 'lucide-react';
import { useState } from 'react';

// Helper to get claim count safely
const getClaimCount = (
  claims: Array<{ id: string; claimNumber: number; text: string }> | undefined
) => claims?.length || 0;

interface ClaimMainPanelShadcnProps {
  projectId: string;
  claims: Array<{ id: string; claimNumber: number; text: string }> | undefined;
  isLoadingClaims: boolean;
  claimViewMode: 'box' | 'compact';
  onToggleViewMode: () => void;
  onSelectViewMode?: (mode: 'box' | 'compact') => void;
  onGenerateClaim1: () => void;
  onClaimChange: (claimId: string, text: string) => void;
  onDeleteClaim: (claimId: string, renumber: boolean) => void;
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
  isSubmittingClaim?: boolean;
  newlyAddedClaimNumbers?: number[];
  isAddClaimDisabled?: boolean;
  cooldownRemaining?: number;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
}

const ClaimMainPanelShadcn: React.FC<ClaimMainPanelShadcnProps> = ({
  projectId,
  claims,
  isLoadingClaims,
  claimViewMode,
  onToggleViewMode: _onToggleViewMode,
  onSelectViewMode,
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
  isSubmittingClaim = false,
  newlyAddedClaimNumbers,
  isAddClaimDisabled = false,
  cooldownRemaining,
  isSaving = false,
  hasUnsavedChanges = false,
}) => {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const claimCount = getClaimCount(claims);
  const hasClaims = claimCount > 0;

  // Get invention data directly
  const { data: inventionData, isLoading: isLoadingInvention } =
    useInventionData(projectId);
  const inventionId = inventionData?.id;

  // Version history modal state
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Zoom controls
  const {
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    getFontSize,
  } = useZoomControls();

  const [lastAddedClaimNumber, setLastAddedClaimNumber] = useTemporaryState<
    string | undefined
  >(undefined, 3000);

  // Mirror claims functionality
  const [isMirrorModalOpen, setIsMirrorModalOpen] = useState(false);
  const mirrorClaimsMutation = useClaimMirroring();

  const handleMirrorClaims = (targetType: ClaimType) => {
    if (!claims || claims.length === 0) return;

    const claimIds = claims.map(claim => claim.id);

    mirrorClaimsMutation.mutate(
      {
        projectId,
        claimIds,
        targetType,
      },
      {
        onSuccess: () => {
          setIsMirrorModalOpen(false);
        },
      }
    );
  };

  const headerContent = (
    <div
      className={cn(
        'p-2 flex justify-between items-center gap-2',
        'bg-bg-panel-header rounded-t-md'
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">Claims</h2>
        <Badge variant="secondary" className="rounded-full text-sm">
          {isLoadingClaims ? '...' : claimCount}
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        {hasClaims && (
          <>
            {/* Version management buttons - only show when we have valid projectId AND inventionId */}
            {projectId && inventionId && !isLoadingInvention && (
              <>
                <SaveClaimVersionButtonShadcn
                  inventionId={inventionId}
                  size="sm"
                  variant="outline"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsVersionHistoryOpen(true)}
                        className="h-8 w-8 p-0"
                      >
                        <FiClock className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Version History</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Separator orientation="vertical" className="h-4" />
              </>
            )}

            {/* View mode toggle - simplified to just box and compact */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center h-8 w-8 p-0 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                title={`View mode: ${claimViewMode}`}
              >
                {claimViewMode === 'box' ? (
                  <FiGrid className="h-4 w-4" />
                ) : (
                  <FiMenu className="h-4 w-4" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    if (onSelectViewMode) {
                      onSelectViewMode('box');
                    } else if (claimViewMode !== 'box') {
                      _onToggleViewMode();
                    }
                  }}
                  className={cn(
                    'cursor-pointer',
                    claimViewMode === 'box' && 'font-bold'
                  )}
                >
                  <FiGrid className="mr-2 h-4 w-4" />
                  Box View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (onSelectViewMode) {
                      onSelectViewMode('compact');
                    } else if (claimViewMode !== 'compact') {
                      _onToggleViewMode();
                    }
                  }}
                  className={cn(
                    'cursor-pointer',
                    claimViewMode === 'compact' && 'font-bold'
                  )}
                >
                  <FiMenu className="mr-2 h-4 w-4" />
                  Compact View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Zoom controls */}
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 70}
                      className="h-8 w-8 p-0 rounded-r-none border-r-0"
                    >
                      <FiZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom out (smaller text)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="h-8 rounded-none border-x-0 px-3"
              >
                {zoomLevel}%
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 150}
                      className="h-8 w-8 p-0 rounded-l-none border-l-0"
                    >
                      <FiZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom in (larger text)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-4" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMirrorModalOpen(true)}
              disabled={mirrorClaimsMutation.isPending}
              className="h-8 flex items-center gap-1.5"
            >
              <FiCopy className="h-4 w-4" />
              <span>Mirror Claims</span>
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onGenerateClaim1}
                    disabled={isRegeneratingClaim1}
                    className="h-8 w-8 p-0"
                  >
                    {isRegeneratingClaim1 ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiRefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Regenerate Claim 1</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <SimpleMainPanel header={headerContent}>
        {isLoadingClaims && (
          <div className="flex items-center justify-center p-10">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!isLoadingClaims && hasClaims && (
          <div className="min-h-[200px]">
            {isAddingClaim && (
              <div>
                <AddNewClaimFormShadcn
                  newClaimText={newClaimText}
                  setNewClaimText={setNewClaimText}
                  newClaimDependsOn={newClaimDependsOn}
                  setNewClaimDependsOn={setNewClaimDependsOn}
                  onCancel={onCancelAddClaim}
                  onAddClaim={onAddClaim}
                  isSubmitting={isSubmittingClaim}
                  cooldownRemaining={cooldownRemaining}
                />
              </div>
            )}
            <ClaimsViewShadcn
              claims={claims}
              claimViewMode={claimViewMode}
              onClaimChange={onClaimChange}
              onDeleteClaim={onDeleteClaim}
              onInsertClaim={onInsertClaim}
              onReorderClaim={onReorderClaim}
              lastAddedClaimNumber={lastAddedClaimNumber}
              zoomLevel={zoomLevel}
              getFontSize={getFontSize}
              newlyAddedClaimNumbers={newlyAddedClaimNumbers}
            />
          </div>
        )}

        {!isLoadingClaims && !hasClaims && (
          <div className="flex items-center justify-center min-h-[400px] p-8">
            <div className="text-center max-w-md mx-auto">
              <div
                className={cn(
                  'rounded-lg p-8 space-y-6',
                  isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                )}
              >
                <div className="space-y-3">
                  <p
                    className={cn(
                      'text-lg font-medium',
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    )}
                  >
                    No claims found in your invention disclosure
                  </p>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    Start by generating just Claim 1, which you can refine
                    before generating dependent claims.
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={onGenerateClaim1}
                    disabled={isRegeneratingClaim1}
                    className="flex items-center gap-2 px-6 py-3"
                  >
                    {isRegeneratingClaim1 ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiRefreshCw className="h-4 w-4" />
                    )}
                    <span>Generate Claim 1</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SimpleMainPanel>

      <MirrorClaimsModal
        isOpen={isMirrorModalOpen}
        onClose={() => setIsMirrorModalOpen(false)}
        onConfirm={handleMirrorClaims}
        claimCount={claimCount}
        isLoading={mirrorClaimsMutation.isPending}
      />

      {/* Version History Modal */}
      {projectId && inventionId && (
        <ClaimVersionHistoryModal
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
          inventionId={inventionId}
          projectId={projectId}
        />
      )}
    </>
  );
};

export default ClaimMainPanelShadcn;
