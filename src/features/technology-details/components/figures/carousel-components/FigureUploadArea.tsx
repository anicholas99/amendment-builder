import React, { useState, useCallback } from 'react';
import { FiUpload, FiImage, FiFolder } from 'react-icons/fi';
import { FigureUploadAreaProps } from './types';
import { useThemeContext } from '../../../../../contexts/ThemeContext';
import { FigureManagementModal } from '../FigureManagementModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

/**
 * Component for when no figure image is available, showing upload options
 */
const FigureUploadArea: React.FC<FigureUploadAreaProps> = React.memo(
  ({
    figureKey,
    onUpload,
    fullView = false,
    onDropUpload,
    readOnly = false,
    projectId,
    onFigureAssigned,
    inventionData,
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const bgColor = useColorModeValue('#ebf8ff', '#1e3a8a'); // blue.50, blue.900
    const bgColorHover = useColorModeValue('#bee3f8', '#1e40af'); // blue.100, blue.800
    const borderColor = useColorModeValue('#90cdf4', '#2563eb'); // blue.200, blue.600
    const borderColorActive = useColorModeValue('#3182ce', '#60a5fa'); // blue.500, blue.400
    const textColor = useColorModeValue('#2c5282', '#93c5fd'); // blue.600, blue.200

    // Drag and drop handlers
    const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;

        setIsDragging(true);
      },
      [readOnly]
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;

        setIsDragging(false);
      },
      [readOnly]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;

        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && onDropUpload) {
          onDropUpload(file);
        }
      },
      [onDropUpload, readOnly]
    );

    // In fullView mode (modal), we show a different UI
    if (fullView) {
      return (
        <div className="h-[70vh] w-full p-10 bg-muted flex items-center justify-center">
          <div className="flex flex-col items-center space-y-5">
            <FiImage className="w-12 h-12 text-gray-500" />
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              No image available for {figureKey}
            </span>
            {!readOnly && (
              <>
                <Button
                  onClick={onUpload}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FiUpload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                {projectId && (
                  <Button
                    variant="outline"
                    onClick={onOpen}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <FiFolder className="w-4 h-4 mr-2" />
                    Manage Figures
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Figure Management Modal */}
          {projectId && (
            <FigureManagementModal
              isOpen={isOpen}
              onClose={onClose}
              projectId={projectId}
              inventionData={inventionData}
              currentFigure={figureKey}
              onFigureAssigned={onFigureAssigned}
            />
          )}
        </div>
      );
    }

    return (
      <>
        <div
          className={cn(
            'relative border-2 border-dashed rounded-md h-full w-full flex items-center justify-center transition-all duration-150 ease-out',
            isDragging
              ? 'border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-800'
              : 'border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <FiImage className="w-9 h-9" style={{ color: textColor }} />
            <span
              className="font-medium text-sm text-center"
              style={{ color: textColor }}
            >
              Drag & Drop or Click to Upload
            </span>

            {!readOnly && (
              <div className="flex flex-col items-center space-y-2">
                <Button
                  size="sm"
                  onClick={onUpload}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FiUpload className="w-3 h-3 mr-2" />
                  Upload Figure
                </Button>

                {projectId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onOpen}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <FiFolder className="w-3 h-3 mr-2" />
                    Manage Figures
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Figure Management Modal */}
        {projectId && (
          <FigureManagementModal
            isOpen={isOpen}
            onClose={onClose}
            projectId={projectId}
            inventionData={inventionData}
            currentFigure={figureKey}
            onFigureAssigned={onFigureAssigned}
          />
        )}
      </>
    );
  }
);

FigureUploadArea.displayName = 'FigureUploadArea';

export default FigureUploadArea;
