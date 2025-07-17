import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FiFile, FiTrash2 } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';

interface UploadedFilesSidebarProps {
  uploadedFiles: string[];
  clearUploadedFile: (fileName: string) => void;
  isProcessing: boolean;
  isUploading: boolean;
}

/**
 * Sidebar component that displays uploaded files categorized as documents and figures
 */
export const UploadedFilesSidebar: React.FC<UploadedFilesSidebarProps> =
  React.memo(
    ({ uploadedFiles, clearUploadedFile, isProcessing, isUploading }) => {
      const { isDarkMode } = useThemeContext();

      // Helper function to determine if a file is an image
      const isImageFile = (fileName: string) => {
        return !!fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      };

      // Filter files into documents and figures
      const documentFiles = uploadedFiles.filter(
        fileName => !isImageFile(fileName)
      );
      const figureFiles = uploadedFiles.filter(isImageFile);

      return (
        <div
          className={cn(
            'w-[300px] border-l overflow-y-auto flex flex-col thin-scrollbar',
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          )}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Uploaded Files</h2>

            {uploadedFiles.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <FiFile
                    className={cn(
                      'h-8 w-8',
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm text-center',
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    )}
                  >
                    No files uploaded yet
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Documents Section */}
                {documentFiles.length > 0 && (
                  <div>
                    <h3
                      className={cn(
                        'font-semibold mb-3 text-sm',
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      )}
                    >
                      Documents
                    </h3>
                    <div className="space-y-2">
                      {documentFiles.map((fileName, index) => (
                        <div
                          key={`${fileName}-${index}`}
                          className={cn(
                            'p-4 rounded-md border flex items-center transition-all duration-150 ease-out',
                            'hover:-translate-y-0.5 hover:shadow-sm',
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 hover:border-blue-600 hover:bg-gray-700'
                              : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                          )}
                        >
                          <FiFile className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm flex-1 truncate">
                            {fileName}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => clearUploadedFile(fileName)}
                            disabled={isUploading || isProcessing}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Figures Section */}
                {figureFiles.length > 0 && (
                  <div>
                    <h3
                      className={cn(
                        'font-semibold mb-3 text-sm',
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      )}
                    >
                      Figures
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {figureFiles.map((fileName, index) => (
                        <div
                          key={`${fileName}-${index}`}
                          className={cn(
                            'relative rounded-md overflow-hidden border transition-all duration-150 ease-out',
                            'hover:-translate-y-0.5 hover:shadow-sm',
                            isDarkMode
                              ? 'border-gray-700 bg-gray-800 hover:border-blue-600'
                              : 'border-gray-200 bg-white hover:border-blue-200'
                          )}
                        >
                          <div className="aspect-square">
                            <div
                              className={cn(
                                'h-full p-2 flex items-center justify-center',
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                              )}
                            >
                              <span
                                className={cn(
                                  'text-sm text-center line-clamp-2',
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                )}
                              >
                                {fileName}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => clearUploadedFile(fileName)}
                            disabled={isUploading || isProcessing}
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100"
                          >
                            <FiTrash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  );

UploadedFilesSidebar.displayName = 'UploadedFilesSidebar';
