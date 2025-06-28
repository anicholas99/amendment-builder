import React from 'react';
import {
  Box,
  Button,
  Icon,
  IconButton,
  Divider,
  HStack,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FiChevronDown,
  FiRefreshCw,
  FiDownload,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import { Editor } from '@tiptap/react';
import TiptapToolbar from './TiptapToolbar';
import SaveVersionButton from './SaveVersionButton';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { logger } from '@/lib/monitoring/logger';

interface PatentEditorHeaderProps {
  editor: Editor | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onExportDocx: () => void;
  onResetApplication?: () => void;
  onOpenVersionHistory: () => void;
  onSaveVersion?: (description?: string) => Promise<void>;
  canShowVersionUI: boolean;
  visibleButtons: {
    showReset: boolean;
    showZoom: boolean;
    showExportDOCX: boolean;
    showVersionHistory: boolean;
    showSaveVersion: boolean;
    collapsedButtons: string[];
  };
  isSaving: boolean;
  showSaved: boolean;
  hasUnsavedChanges: boolean;
  actualProjectId: string;
}

export const PatentEditorHeader: React.FC<PatentEditorHeaderProps> = ({
  editor,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExportDocx,
  onResetApplication,
  onOpenVersionHistory,
  onSaveVersion,
  canShowVersionUI,
  visibleButtons,
  isSaving,
  showSaved,
  hasUnsavedChanges,
  actualProjectId,
}) => {
  return (
    <Box
      p={2}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      bg="bg.primary"
      borderBottomWidth="1px"
      borderBottomColor="border.primary"
    >
      {/* Editor Toolbar on the left */}
      <Box flex="1" display="flex" alignItems="center">
        <TiptapToolbar editor={editor} />
      </Box>

      {/* Save indicator in the middle */}
      <SaveStatusIndicator
        isSaving={isSaving}
        showSaved={showSaved}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Other controls on the right */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* Version Management - Always show Save Version if available */}
        {canShowVersionUI && visibleButtons.showSaveVersion && (
          <SaveVersionButton
            onSave={async (description?: string) => {
              if (onSaveVersion) {
                await onSaveVersion(description || 'Version saved');
              }
            }}
            disabled={!onSaveVersion}
            size="sm"
          />
        )}

        {/* Version History */}
        {canShowVersionUI && visibleButtons.showVersionHistory && (
          <Tooltip label="Version History">
            <IconButton
              aria-label="Version History"
              icon={<Icon as={FiChevronDown} />}
              onClick={() => {
                logger.log('Opening version history for project:', {
                  projectId: actualProjectId,
                });
                onOpenVersionHistory();
              }}
              size="sm"
              colorScheme="purple"
              variant="outline"
            />
          </Tooltip>
        )}

        {/* Divider after version controls */}
        {canShowVersionUI &&
          (visibleButtons.showVersionHistory ||
            visibleButtons.showSaveVersion) &&
          (visibleButtons.showExportDOCX ||
            visibleButtons.showZoom ||
            visibleButtons.showReset) && (
            <Box height="20px">
              <Divider orientation="vertical" />
            </Box>
          )}

        {/* Export DOCX button */}
        {visibleButtons.showExportDOCX && (
          <Tooltip label="Export DOCX">
            <IconButton
              aria-label="Export DOCX"
              icon={<Icon as={FiDownload} />}
              onClick={onExportDocx}
              size="sm"
              colorScheme="blue"
              variant="outline"
            />
          </Tooltip>
        )}

        {/* Divider before zoom/reset controls */}
        {visibleButtons.showExportDOCX &&
          (visibleButtons.showZoom || visibleButtons.showReset) && (
            <Box height="20px">
              <Divider orientation="vertical" />
            </Box>
          )}

        {/* Zoom Controls */}
        {visibleButtons.showZoom && (
          <HStack spacing={0} mr="4px">
            <Tooltip label="Zoom out (show more content)">
              <IconButton
                aria-label="Zoom out"
                icon={<Icon as={FiMinus} />}
                onClick={onZoomOut}
                disabled={zoomLevel <= 70}
                size="sm"
                variant="outline"
              />
            </Tooltip>
            <Button size="sm" onClick={onResetZoom} variant="outline">
              {zoomLevel}%
            </Button>
            <Tooltip label="Zoom in (larger text)">
              <IconButton
                aria-label="Zoom in"
                icon={<Icon as={FiPlus} />}
                onClick={onZoomIn}
                disabled={zoomLevel >= 120}
                size="sm"
                variant="outline"
              />
            </Tooltip>
          </HStack>
        )}

        {/* Reset Button */}
        {onResetApplication && visibleButtons.showReset && (
          <Tooltip label="Reset to initial state">
            <IconButton
              aria-label="Reset Application"
              icon={<Icon as={FiRefreshCw} />}
              onClick={onResetApplication}
              size="sm"
              colorScheme="gray"
              variant="outline"
            />
          </Tooltip>
        )}

        {/* More actions dropdown - only show if there are collapsed buttons */}
        {visibleButtons.collapsedButtons.length > 0 && (
          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              aria-label="More actions"
              size="sm"
              variant="outline"
              colorScheme="gray"
              minWidth="auto"
              px={2}
            >
              •••
            </MenuButton>
            <MenuList zIndex={1000}>
              {/* Save Version in dropdown */}
              {canShowVersionUI &&
                visibleButtons.collapsedButtons.includes('saveVersion') && (
                  <MenuItem
                    icon={<Icon as={FiChevronDown} />}
                    onClick={() => {
                      if (onSaveVersion) {
                        onSaveVersion('');
                      }
                    }}
                    disabled={!onSaveVersion}
                  >
                    Save Version
                  </MenuItem>
                )}

              {/* Version History in dropdown */}
              {canShowVersionUI &&
                visibleButtons.collapsedButtons.includes('versionHistory') && (
                  <MenuItem
                    icon={<Icon as={FiChevronDown} />}
                    onClick={onOpenVersionHistory}
                  >
                    Version History
                  </MenuItem>
                )}

              {/* Export DOCX in dropdown */}
              {visibleButtons.collapsedButtons.includes('exportDOCX') && (
                <MenuItem
                  icon={<Icon as={FiDownload} />}
                  onClick={onExportDocx}
                >
                  Export DOCX
                </MenuItem>
              )}

              {/* Zoom controls in dropdown */}
              {visibleButtons.collapsedButtons.includes('zoom') && (
                <>
                  <MenuItem
                    icon={<Icon as={FiMinus} />}
                    onClick={onZoomOut}
                    disabled={zoomLevel <= 70}
                  >
                    Zoom Out
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={FiPlus} />}
                    onClick={onZoomIn}
                    disabled={zoomLevel >= 120}
                  >
                    Zoom In
                  </MenuItem>
                  <MenuItem onClick={onResetZoom}>
                    Reset Zoom ({zoomLevel}%)
                  </MenuItem>
                </>
              )}

              {/* Reset in dropdown */}
              {onResetApplication &&
                visibleButtons.collapsedButtons.includes('reset') && (
                  <MenuItem
                    icon={<Icon as={FiRefreshCw} />}
                    onClick={onResetApplication}
                  >
                    Reset Application
                  </MenuItem>
                )}
            </MenuList>
          </Menu>
        )}
      </Box>
    </Box>
  );
};
