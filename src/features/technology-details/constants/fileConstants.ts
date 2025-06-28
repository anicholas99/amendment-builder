/**
 * Constants for file handling in the technology details feature
 */

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ACCEPTED_FILE_EXTENSIONS =
  '.pdf, .docx, .txt, .jpg, .jpeg, .png, .gif, .webp';
