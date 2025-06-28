import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '../constants/fileConstants';

/**
 * Validates file type against accepted types
 * @param file The file to validate
 * @returns Object with validation result and error message
 */
export const validateFileType = (
  file: File
): { valid: boolean; errorMessage?: string } => {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      errorMessage: `Please upload a PDF, DOCX, TXT, or image file (JPG, PNG, GIF, WebP). You provided: ${file.type || 'unknown'}`,
    };
  }
  return { valid: true };
};

/**
 * Validates file size against maximum allowed size
 * @param file The file to validate
 * @returns Object with validation result and error message
 */
export const validateFileSize = (
  file: File
): { valid: boolean; errorMessage?: string } => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      errorMessage: `File size cannot exceed ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    };
  }
  return { valid: true };
};

/**
 * Validates a file for both type and size
 * @param file The file to validate
 * @returns Object with validation result and error message
 */
export const validateFile = (
  file: File
): { valid: boolean; errorMessage?: string } => {
  // Check file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
};
