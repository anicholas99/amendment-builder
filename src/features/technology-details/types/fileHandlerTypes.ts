import React from 'react';

/**
 * Props for the useTechnologyInputFileHandler hook
 */
export interface UseTechnologyInputFileHandlerProps {
  setLocalText: (text: string) => void;
  updateContextTextInput: (text: string) => void;
}

/**
 * Return type for the useTechnologyInputFileHandler hook
 */
export interface TechnologyInputFileHandlerResult {
  uploadedFiles: string[];
  isUploading: boolean;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  clearUploadedFile: (fileName: string) => void;
  triggerFileInput: () => void;
}
