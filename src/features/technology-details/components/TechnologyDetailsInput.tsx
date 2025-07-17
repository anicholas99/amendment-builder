import React from 'react';
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
} from './sections';

export interface TechnologyDetailsInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isProcessing: boolean;
  handleProceed: () => void;
  onFileUpload: (file: File) => Promise<void>;
  uploadedFiles: Array<{
    id: string;
    name: string;
    includeInProcessing: boolean;
  }>;
  uploadedFigures?: UploadedFigure[];
  onRemoveTextFile?: (fileName: string) => Promise<void>;
  onToggleFileInProcessing?: (fileName: string) => void;
  onRemoveFigure?: (figureId: string) => void;
  onResetFigureNumbers?: () => void;
  onReorderFigures?: (fromIndex: number, toIndex: number) => void;
  onUpdateFigureNumber?: (figureId: string, newNumber: string) => void;
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
  onToggleFileInProcessing,
  onRemoveFigure,
  onResetFigureNumbers,
  onReorderFigures,
  onUpdateFigureNumber,
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

  // Get proper view height
  const viewHeight = useViewHeight(80);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 pt-4 md:pt-6 px-4 md:px-6 pb-2 md:pb-3 flex flex-col overflow-auto">
        <div className="w-full h-full flex flex-col">
          <div className="flex flex-col gap-3 md:gap-4 h-full">
            {/* Welcome Section */}
            <TechnologyWelcomeSection />

            {/* Quick Action Cards */}
            <TechnologyQuickActions onUploadClick={triggerFileInput} />

            {/* Main Input Area - Unified design */}
            <div className="w-full flex-1 min-h-0 overflow-visible">
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_0.75fr] gap-4 md:gap-5 h-full">
                {/* Text Input */}
                <div className="h-full">
                  <div className="h-full border-2 border-border rounded-lg overflow-hidden relative transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] hover:border-blue-400 focus-within:border-blue-400 focus-within:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),_0_0_0_3px_rgba(66,153,225,0.2)]">
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
                  </div>
                </div>

                {/* Files Sidebar - Desktop */}
                <div className="hidden lg:block h-full">
                  <TechnologyFilesSidebar
                    uploadedFiles={uploadedFiles}
                    uploadedFigures={uploadedFigures}
                    uploadingFiles={uploadingFiles}
                    isDragging={isDragging}
                    onRemoveTextFile={onRemoveTextFile}
                    onToggleFileInProcessing={onToggleFileInProcessing}
                    onRemoveFigure={onRemoveFigure}
                    onReorderFigures={onReorderFigures}
                    onUpdateFigureNumber={onUpdateFigureNumber}
                    onFileInputClick={triggerFileInput}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Flush with content */}
      <div className="flex-shrink-0">
        <TechnologyFooterActions
          value={value}
          uploadedFilesCount={uploadedFiles.length}
          uploadedFiguresCount={uploadedFigures.length}
          isProcessing={isProcessing}
          isUploading={isUploading}
          onProceed={handleProceed}
        />
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        onChange={handleFileInputChange}
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,.pdf,.doc,.docx,.txt"
        ref={activeFileInputRef}
        className="hidden"
        multiple
      />
    </div>
  );
};
