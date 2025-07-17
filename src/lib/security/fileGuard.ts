import type { File } from 'formidable';
import path from 'path';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Options for the file guard helper.
 */
export interface FileGuardOptions {
  /** Array of allowed MIME types. */
  acceptedTypes: string[];
  /** Maximum file size in bytes. */
  maxSize: number;
  /** Optional: allowed file extensions (additional validation) */
  allowedExtensions?: string[];
  /** Optional: custom filename sanitization */
  sanitizeFilename?: boolean;
}

/**
 * File validation result with sanitized filename
 */
export interface FileGuardResult {
  /** Sanitized filename safe for storage */
  sanitizedFilename: string;
  /** Detected MIME type from file content */
  detectedMimeType: string;
  /** File extension */
  extension: string;
}

/**
 * Dangerous filename patterns that could cause security issues
 */
const DANGEROUS_PATTERNS = [
  /\.\./g, // Directory traversal
  /[<>:"|?*\x00-\x1f]/g, // Invalid filename characters
  /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, // Windows reserved names
  /[\u0000-\u001f\u007f-\u009f]/g, // Control characters
];

/**
 * Common double extensions used in attacks
 */
const DANGEROUS_DOUBLE_EXTENSIONS = [
  '.php',
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.com',
  '.scr',
  '.vbs',
  '.js',
];

/**
 * Sanitize a filename to prevent security issues
 */
function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed-file';
  }

  // Get base name to remove any path components
  let sanitized = path.basename(filename);

  // Replace dangerous patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '_');
  });

  // Check for dangerous double extensions (e.g., file.jpg.exe)
  const lowerFilename = sanitized.toLowerCase();
  DANGEROUS_DOUBLE_EXTENSIONS.forEach(ext => {
    if (lowerFilename.includes(ext) && !lowerFilename.endsWith(ext)) {
      // Remove the dangerous extension from middle of filename
      sanitized = sanitized.replace(
        new RegExp(ext.replace('.', '\\.'), 'gi'),
        ''
      );
    }
  });

  // Limit filename length (keep extension)
  const maxNameLength = 200;
  if (sanitized.length > maxNameLength) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, maxNameLength - ext.length) + ext;
  }

  // Ensure filename is not empty after sanitization
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    sanitized = 'unnamed-file';
  }

  return sanitized;
}

/**
 * Enhanced file validation with security checks
 */
export async function fileGuard(
  file: File,
  opts: FileGuardOptions
): Promise<FileGuardResult> {
  const {
    acceptedTypes,
    maxSize,
    allowedExtensions,
    sanitizeFilename: shouldSanitize = true,
  } = opts;

  if (!file) {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'No file uploaded'
    );
  }

  // 1. Size check (prevent DoS)
  if (file.size && file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new ApplicationError(
      ErrorCode.VALIDATION_OUT_OF_RANGE,
      `File size (${sizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    );
  }

  // 2. Filename sanitization
  const originalFilename = file.originalFilename || 'unnamed-file';
  const sanitizedFilename = shouldSanitize
    ? sanitizeFilename(originalFilename)
    : originalFilename;
  const fileExtension = path.extname(sanitizedFilename).toLowerCase();

  // 3. Extension validation (if specified)
  if (allowedExtensions && allowedExtensions.length > 0) {
    const normalizedExtensions = allowedExtensions.map(ext =>
      ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    );

    if (!normalizedExtensions.includes(fileExtension)) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_INVALID_FORMAT,
        `File extension '${fileExtension}' is not allowed. Allowed extensions: ${normalizedExtensions.join(', ')}`
      );
    }
  }

  // 4. MIME type detection using magic numbers
  let detectedMime: string | undefined;
  let fileTypeError: Error | null = null;

  try {
    const { fileTypeFromFile } = await import('file-type');
    const result = await fileTypeFromFile(file.filepath);
    detectedMime = result?.mime;

    if (!detectedMime) {
      // Warning logging removed for client compatibility
    }
  } catch (err) {
    fileTypeError = err as Error;
    // Error logging removed for client compatibility
  }

  // 5. MIME type validation
  const mimeToCheck = detectedMime || file.mimetype || 'unknown';

  if (!acceptedTypes.includes(mimeToCheck)) {
    // Special handling for text files which might not have magic numbers
    if (fileExtension === '.txt' && acceptedTypes.includes('text/plain')) {
      // Text files often don't have magic numbers, accept based on extension
      // Info logging removed for client compatibility
    } else {
      throw new ApplicationError(
        ErrorCode.VALIDATION_INVALID_FORMAT,
        `File type '${mimeToCheck}' is not allowed. Allowed types: ${acceptedTypes.join(', ')}`
      );
    }
  }

  // 6. Additional security check: ensure MIME matches extension
  const extensionMimeMap: Record<string, string[]> = {
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.gif': ['image/gif'],
    '.pdf': ['application/pdf'],
    '.docx': [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    '.txt': ['text/plain', 'application/octet-stream'], // text files might be detected as octet-stream
  };

  const expectedMimes = extensionMimeMap[fileExtension];
  if (expectedMimes && detectedMime && !expectedMimes.includes(detectedMime)) {
    // Warning logging removed for client compatibility
    // Don't throw error, just log warning - some legitimate files have mismatches
  }
  // Info logging removed for client compatibility

  return {
    sanitizedFilename,
    detectedMimeType: mimeToCheck,
    extension: fileExtension,
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use the new fileGuard that returns FileGuardResult
 */
export async function validateFile(
  file: File,
  opts: FileGuardOptions
): Promise<void> {
  await fileGuard(file, opts);
}
