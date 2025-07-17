import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FiFileText, FiImage, FiX, FiInbox } from 'react-icons/fi';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { UploadedFigure } from '../hooks/useTechnologyInputFileHandler';
import { useThemeContext } from '@/contexts/ThemeContext';

interface TechnologyUploadedFilesListProps {
  uploadedTextFiles: string[];
  uploadedFigures: UploadedFigure[];
  onRemoveTextFile?: (fileName: string) => Promise<void>;
  onRemoveFigure?: (figureId: string) => void;
  uploadingFiles?: string[]; // New prop for files currently being uploaded
}

/**
 * Component to display a list of uploaded files with counts and types
 */
export const TechnologyUploadedFilesList: React.FC<
  TechnologyUploadedFilesListProps
> = ({
  uploadedTextFiles = [],
  uploadedFigures = [],
  onRemoveTextFile,
  onRemoveFigure,
  uploadingFiles = [],
}) => {
  const { isDarkMode } = useThemeContext();
  const totalFiles =
    uploadedTextFiles.length + uploadedFigures.length + uploadingFiles.length;

  // State to track failed image loads
  const [failedImages, setFailedImages] = React.useState<Set<string>>(
    new Set()
  );

  const handleImageError = (figureId: string) => {
    setFailedImages(prev => new Set(prev).add(figureId));
  };

  return (
    <div className="w-full h-full flex flex-col space-y-2">
      {totalFiles > 0 ? (
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {/* Files being uploaded */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              {uploadingFiles.map((fileName, index) => (
                <div
                  key={`uploading-${fileName}-${index}`}
                  className={cn(
                    'p-4 rounded-md flex items-center transition-colors shadow-xs opacity-80',
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  )}
                >
                  <LoadingMinimal size="sm" />
                  <span
                    className={cn(
                      'text-sm font-medium flex-1 truncate ml-2',
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    )}
                    title={fileName}
                  >
                    {fileName}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  >
                    Uploading...
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded text files */}
          {uploadedTextFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedTextFiles.map(fileName => (
                <div
                  key={fileName}
                  className={cn(
                    'p-4 rounded-md flex items-center transition-colors shadow-xs group',
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-600'
                      : 'bg-white hover:bg-gray-100'
                  )}
                >
                  <FiFileText
                    className={cn(
                      'h-5 w-5 mr-3',
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium flex-1 truncate',
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    )}
                    title={fileName}
                  >
                    {fileName}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex-shrink-0"
                  >
                    Text
                  </Badge>
                  {onRemoveTextFile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveTextFile?.(fileName)}
                      className={cn(
                        'ml-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        isDarkMode
                          ? 'text-gray-400 hover:text-red-300 hover:bg-transparent'
                          : 'text-gray-500 hover:text-red-500 hover:bg-transparent'
                      )}
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {uploadedFigures.length > 0 && (
            <div
              className={cn(
                'space-y-2',
                uploadedTextFiles.length > 0 && 'mt-4'
              )}
            >
              {uploadedFigures.map(figure => (
                <div
                  key={figure.id}
                  className={cn(
                    'p-4 rounded-md flex items-center transition-colors shadow-xs group',
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-600'
                      : 'bg-white hover:bg-gray-100'
                  )}
                >
                  {/* Image preview with fallback */}
                  {!failedImages.has(figure.id) ? (
                    <img
                      src={figure.url}
                      alt={`Preview of ${figure.fileName}`}
                      className={cn(
                        'w-10 h-10 object-cover rounded-sm border mr-3',
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      )}
                      onError={() => handleImageError(figure.id)}
                      onLoad={() => {
                        // Remove from failed images if it loads successfully
                        setFailedImages(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(figure.id);
                          return newSet;
                        });
                      }}
                    />
                  ) : (
                    <div
                      className={cn(
                        'w-10 h-10 rounded-sm border mr-3 flex items-center justify-center',
                        isDarkMode
                          ? 'border-gray-600 bg-gray-700'
                          : 'border-gray-200 bg-gray-100'
                      )}
                    >
                      <FiImage
                        className={cn(
                          'h-5 w-5',
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        )}
                      />
                    </div>
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium flex-1 truncate',
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    )}
                    title={figure.fileName}
                  >
                    {figure.fileName}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 flex-shrink-0"
                  >
                    Image
                  </Badge>
                  {onRemoveFigure && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFigure(figure.id)}
                      className={cn(
                        'ml-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        isDarkMode
                          ? 'text-gray-400 hover:text-red-300 hover:bg-transparent'
                          : 'text-gray-500 hover:text-red-500 hover:bg-transparent'
                      )}
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 h-full flex flex-col items-center justify-center">
          <div
            className={cn(
              'flex flex-col items-center space-y-2',
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            )}
          >
            <FiInbox className="h-8 w-8" />
            <span className="text-sm">No files uploaded yet.</span>
          </div>
        </div>
      )}
    </div>
  );
};
