import { z } from 'zod';

/**
 * File upload validation schemas following security best practices
 * Ensures all file uploads are properly validated at the API layer
 */

// Common file size limits
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  MAX_FILENAME_LENGTH: 255,
} as const;

// Accepted MIME types for security
export const ACCEPTED_MIME_TYPES = {
  IMAGE: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
  ] as const,
  DOCUMENT: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/pdf',
    'text/plain',
  ] as const,
} as const;

// File extensions whitelist
export const ACCEPTED_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'] as const,
  DOCUMENT: ['.docx', '.pdf', '.txt'] as const,
} as const;

/**
 * Base file validation schema with security checks
 */
const baseFileSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(FILE_SIZE_LIMITS.MAX_FILENAME_LENGTH, 'Filename too long')
    .regex(/^[a-zA-Z0-9\-_. ()]+$/, 'Filename contains invalid characters')
    .refine(name => {
      // Prevent directory traversal
      return (
        !name.includes('..') && !name.includes('/') && !name.includes('\\')
      );
    }, 'Invalid filename pattern detected'),
  size: z
    .number()
    .positive('File size must be positive')
    .int('File size must be an integer'),
  mimetype: z.string().min(1, 'MIME type is required'),
});

/**
 * Image upload validation schema
 */
export const imageUploadSchema = baseFileSchema.extend({
  size: z
    .number()
    .positive()
    .max(
      FILE_SIZE_LIMITS.IMAGE,
      `Image size must not exceed ${FILE_SIZE_LIMITS.IMAGE / 1024 / 1024}MB`
    ),
  mimetype: z.enum(ACCEPTED_MIME_TYPES.IMAGE, {
    errorMap: () => ({
      message: 'Invalid image type. Accepted: JPEG, PNG, GIF, BMP, WebP',
    }),
  }),
  filename: baseFileSchema.shape.filename.refine(name => {
    const ext = name.toLowerCase().substring(name.lastIndexOf('.'));
    return ACCEPTED_EXTENSIONS.IMAGE.includes(ext as any);
  }, 'Invalid image file extension'),
});

/**
 * Document upload validation schema
 */
export const documentUploadSchema = baseFileSchema.extend({
  size: z
    .number()
    .positive()
    .max(
      FILE_SIZE_LIMITS.DOCUMENT,
      `Document size must not exceed ${FILE_SIZE_LIMITS.DOCUMENT / 1024 / 1024}MB`
    ),
  mimetype: z.enum(ACCEPTED_MIME_TYPES.DOCUMENT, {
    errorMap: () => ({
      message: 'Invalid document type. Accepted: DOCX, PDF, TXT',
    }),
  }),
  filename: baseFileSchema.shape.filename.refine(name => {
    const ext = name.toLowerCase().substring(name.lastIndexOf('.'));
    return ACCEPTED_EXTENSIONS.DOCUMENT.includes(ext as any);
  }, 'Invalid document file extension'),
});

/**
 * Figure upload request schema (for multipart form data fields)
 */
export const figureUploadFieldsSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  figureKey: z.string().optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

/**
 * Combined figure upload validation (file + fields)
 */
export const figureUploadRequestSchema = z.object({
  file: imageUploadSchema,
  fields: figureUploadFieldsSchema,
});

/**
 * Invention document upload schema
 */
export const inventionUploadRequestSchema = z.object({
  file: documentUploadSchema,
  // Add any additional fields if needed
});

/**
 * Helper to validate file metadata before processing
 * This should be used in API endpoints before passing to service layer
 */
export function validateFileMetadata(
  file: {
    originalFilename?: string | null;
    size: number;
    mimetype?: string | null;
  },
  type: 'image' | 'document'
): z.infer<typeof imageUploadSchema> | z.infer<typeof documentUploadSchema> {
  const schema = type === 'image' ? imageUploadSchema : documentUploadSchema;

  const fileData = {
    filename: file.originalFilename || 'unnamed-file',
    size: file.size,
    mimetype: file.mimetype || 'application/octet-stream',
  };

  return schema.parse(fileData);
}

/**
 * Type exports for use in API handlers
 */
export type ImageUploadData = z.infer<typeof imageUploadSchema>;
export type DocumentUploadData = z.infer<typeof documentUploadSchema>;
export type FigureUploadFields = z.infer<typeof figureUploadFieldsSchema>;
export type FigureUploadRequest = z.infer<typeof figureUploadRequestSchema>;
export type InventionUploadRequest = z.infer<
  typeof inventionUploadRequestSchema
>;
