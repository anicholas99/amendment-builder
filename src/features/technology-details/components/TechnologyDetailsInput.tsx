import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Card,
  CardBody,
  Divider,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useViewHeight } from '@/hooks/useViewHeight';
import { TechnologyInputTextArea } from './TechnologyInputTextArea';
import { UploadedFigure } from '../hooks/useTechnologyInputFileHandler';
import { useDragDropFileHandler } from '../hooks/useDragDropFileHandler';

// Section components
import {
  TechnologyWelcomeSection,
  TechnologyQuickActions,
  TechnologyFooterActions,
  TechnologyFilesSidebar,
  TechnologyMobileFiles,
} from './sections';

export interface TechnologyDetailsInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isProcessing: boolean;
  handleProceed: () => void;
  onFileUpload: (file: File) => Promise<void>;
  uploadedFiles: string[];
  uploadedFigures?: UploadedFigure[];
  onRemoveTextFile?: (fileName: string) => void;
  onRemoveFigure?: (figureId: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const TechnologyDetailsInput: React.FC<TechnologyDetailsInputProps> = ({
  value,
  onChange,
  isProcessing,
  handleProceed,
  onFileUpload,
  uploadedFiles,
  uploadedFigures = [],
  onRemoveTextFile,
  onRemoveFigure,
  fileInputRef: externalFileInputRef,
}) => {
  // Use the drag/drop handler hook
  const {
    isDragging,
    isUploading,
    uploadingFiles,
    fileInputRef: internalFileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInputChange,
    triggerFileInput: _, // Ignore the hook's trigger function
  } = useDragDropFileHandler({ onFileUpload });

  // Use external ref if provided, otherwise use internal
  const activeFileInputRef = externalFileInputRef || internalFileInputRef;

  // Create our own trigger function that uses the correct ref
  const triggerFileInput = () => {
    activeFileInputRef.current?.click();
  };

  // Color mode values
  const contentBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const insetShadow = useColorModeValue(
    'inset 0 1px 2px rgba(0,0,0,0.05)',
    'inset 0 1px 2px rgba(0,0,0,0.2)'
  );
  const focusBoxShadow = useColorModeValue(
    `inset 0 1px 2px rgba(0,0,0,0.05), 0 0 0 3px rgba(66, 153, 225, 0.2)`,
    `inset 0 1px 2px rgba(0,0,0,0.2), 0 0 0 3px rgba(66, 153, 225, 0.3)`
  );

  // Get proper view height
  const viewHeight = useViewHeight(80);

  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      bg={contentBg}
      overflow="hidden"
    >
      {/* Main Content */}
      <Box
        flex="1"
        pt={{ base: 4, md: 6 }}
        px={{ base: 4, md: 6 }}
        pb={{ base: 2, md: 3 }}
        display="flex"
        flexDirection="column"
        overflow="auto"
      >
        <Container
          maxW="7xl"
          height="100%"
          display="flex"
          flexDirection="column"
        >
          <VStack spacing={{ base: 3, md: 4 }} height="100%" align="stretch">
            {/* Welcome Section */}
            <TechnologyWelcomeSection />

            {/* Quick Action Cards */}
            <TechnologyQuickActions onUploadClick={triggerFileInput} />

            {/* Main Input Area - Unified design */}
            <Box width="100%" flex="1" minH="0" overflow="visible">
              <Grid
                templateColumns={{ base: '1fr', lg: '1.5fr 0.6fr' }}
                gap={{ base: 4, md: 5 }}
                height="100%"
              >
                {/* Text Input */}
                <GridItem height="100%">
                  <Box
                    height="100%"
                    borderWidth="2px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                    position="relative"
                    transition="border-color 0.2s, box-shadow 0.2s"
                    boxShadow={insetShadow}
                    _hover={{
                      borderColor: useColorModeValue('blue.400', 'blue.500'),
                    }}
                    _focusWithin={{
                      borderColor: useColorModeValue('blue.400', 'blue.500'),
                      boxShadow: focusBoxShadow,
                    }}
                  >
                    <TechnologyInputTextArea
                      value={value}
                      onChange={onChange}
                      isProcessing={isProcessing}
                      isUploading={isUploading}
                      isDragging={isDragging}
                      handleDrop={handleDrop}
                      handleDragOver={handleDragOver}
                      handleDragLeave={handleDragLeave}
                      placeholder="Start describing your invention here..."
                    />
                  </Box>
                </GridItem>

                {/* Files Sidebar - Desktop */}
                <GridItem display={{ base: 'none', lg: 'block' }} height="100%">
                  <TechnologyFilesSidebar
                    uploadedFiles={uploadedFiles}
                    uploadedFigures={uploadedFigures}
                    uploadingFiles={uploadingFiles}
                    isDragging={isDragging}
                    onRemoveTextFile={onRemoveTextFile}
                    onRemoveFigure={onRemoveFigure}
                    onFileInputClick={triggerFileInput}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  />
                </GridItem>
              </Grid>

              {/* Mobile Files Section */}
              <TechnologyMobileFiles
                uploadedFiles={uploadedFiles}
                uploadedFigures={uploadedFigures}
                uploadingFiles={uploadingFiles}
                isDragging={isDragging}
                onRemoveTextFile={onRemoveTextFile}
                onRemoveFigure={onRemoveFigure}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              />
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Footer - Flush with content */}
      <Box flexShrink={0}>
        <TechnologyFooterActions
          value={value}
          uploadedFilesCount={uploadedFiles.length}
          uploadedFiguresCount={uploadedFigures.length}
          isProcessing={isProcessing}
          isUploading={isUploading}
          onProceed={handleProceed}
        />
      </Box>

      {/* Hidden file input */}
      <input
        type="file"
        onChange={handleFileInputChange}
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,.pdf,.doc,.docx,.txt"
        ref={activeFileInputRef}
        className="hidden"
        multiple
      />
    </Box>
  );
};
