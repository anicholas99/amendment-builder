/**
 * Enhanced Text Extraction Service
 * 
 * Provides hybrid text extraction capabilities:
 * - Text-based PDFs: Uses MarkItDown for clean Markdown extraction
 * - Scanned PDFs: Uses Azure Document Intelligence OCR
 * - DOCX files: Uses mammoth (existing)
 * - TXT files: Direct file reading
 * 
 * This service follows SOC 2 compliance patterns and integrates
 * with the existing Azure infrastructure.
 */

import fs from 'fs/promises';
import formidable from 'formidable';
// Using Azure Computer Vision instead of Document Intelligence for OCR
import mammoth from 'mammoth';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { env } from '@/config/env';
import { fileGuard } from '@/lib/security/fileGuard';
import { scanFile } from '@/lib/security/malwareScanner';
import { TesseractOCRService } from './tesseract-ocr.server-service';

// Re-import the existing constants for consistency
const ACCEPTED_DOCUMENT_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/pdf',
  'text/plain',
];

// MarkItDown integration (will be imported when available)
let MarkItDown: any = null;
try {
  // Dynamic import for MarkItDown since it might not be available in all environments
  MarkItDown = require('markitdown').MarkItDown;
} catch (error) {
  logger.warn('[EnhancedTextExtraction] MarkItDown not available, falling back to basic PDF parsing');
}

/**
 * Enhanced Text Extraction Service
 * Provides intelligent text extraction with OCR fallback capabilities
 */
export class EnhancedTextExtractionService {
  /**
   * Check if Azure Computer Vision is available
   */
  private static isComputerVisionAvailable(): boolean {
    const endpoint = env.AZURE_COMPUTER_VISION_ENDPOINT;
    const apiKey = env.AZURE_COMPUTER_VISION_API_KEY;

    if (!endpoint || !apiKey) {
      logger.warn('[EnhancedTextExtraction] Azure Computer Vision not configured, OCR will be unavailable');
      return false;
    }

    return true;
  }

  /**
   * Detect if a PDF has an extractable text layer
   * This is a heuristic approach - we'll try basic extraction first
   */
  private static async hasTextLayer(filePath: string): Promise<boolean> {
    try {
      // Try to extract text using pdf-parse first
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = await fs.readFile(filePath);
      const result = await pdfParse(dataBuffer);
      
      // Consider it to have a text layer if we get meaningful text
      // (more than just whitespace and basic characters)
      const text = result.text?.trim() || '';
      const hasSubstantialText = text.length > 50 && /[a-zA-Z]{3,}/.test(text);
      
      logger.debug('[EnhancedTextExtraction] Text layer detection', {
        textLength: text.length,
        hasSubstantialText,
        firstChars: text.substring(0, 100),
      });
      
      return hasSubstantialText;
    } catch (error) {
      logger.debug('[EnhancedTextExtraction] Text layer detection failed, assuming scanned PDF', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Extract text using MarkItDown for text-based PDFs
   */
  private static async extractWithMarkItDown(filePath: string): Promise<string> {
    if (!MarkItDown) {
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'MarkItDown not available'
      );
    }

    try {
      logger.debug('[EnhancedTextExtraction] Using MarkItDown for text extraction');
      
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(filePath);
      
      logger.info('[EnhancedTextExtraction] MarkItDown extraction successful', {
        textLength: result.length,
      });
      
      return result;
    } catch (error) {
      logger.error('[EnhancedTextExtraction] MarkItDown extraction failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `MarkItDown extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract text using Tesseract OCR as fallback
   */
  private static async extractWithTesseractOCR(filePath: string): Promise<string> {
    try {
      logger.debug('[EnhancedTextExtraction] Using Tesseract OCR for text extraction');
      
      const result = await TesseractOCRService.extractTextFromPDF(filePath, {
        language: 'eng',
        confidence: 60, // Minimum confidence threshold
      });
      
      logger.info('[EnhancedTextExtraction] Tesseract OCR extraction successful', {
        textLength: result.text.length,
        confidence: result.confidence,
        pageCount: result.pageCount,
        processingTime: result.processingTime,
      });
      
      return result.text;
    } catch (error) {
      logger.error('[EnhancedTextExtraction] Tesseract OCR extraction failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `Tesseract OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract text using Azure Computer Vision OCR
   */
  private static async extractWithOCR(filePath: string): Promise<string> {
    if (!this.isComputerVisionAvailable()) {
      // Fall back to Tesseract OCR if Azure Computer Vision is not available
      logger.info('[EnhancedTextExtraction] Azure Computer Vision not available, falling back to Tesseract OCR');
      return this.extractWithTesseractOCR(filePath);
    }

    try {
      logger.debug('[EnhancedTextExtraction] Using Azure Computer Vision OCR');
      
      const fileBuffer = await fs.readFile(filePath);
      
      // Import and use Azure Computer Vision service
      const { AzureComputerVisionOCRService } = await import('./azure-computer-vision-ocr.server-service');
      
      const result = await AzureComputerVisionOCRService.extractTextFromDocument(fileBuffer);
      
      if (!result.content) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'No content extracted from document via OCR'
        );
      }

      logger.info('[EnhancedTextExtraction] OCR extraction successful', {
        textLength: result.content.length,
        pageCount: result.metadata.totalPages,
        confidence: result.metadata.confidence,
      });
      
      return result.content;
    } catch (error) {
      logger.error('[EnhancedTextExtraction] OCR extraction failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      
      if (error instanceof ApplicationError) {
        throw error;
      }
      
      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Enhanced text extraction with intelligent routing
   * 
   * @param file The formidable file object
   * @returns Extracted text content
   */
  static async extractTextFromFile(file: formidable.File): Promise<string> {
    logger.debug('[EnhancedTextExtraction] Starting enhanced text extraction');

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file uploaded'
      );
    }

    const { filepath, originalFilename, mimetype } = file;
    logger.info('[EnhancedTextExtraction] Processing file', {
      originalFilename,
      mimetype,
    });

    try {
      // Security validation
      const guardResult = await fileGuard(file, {
        acceptedTypes: ACCEPTED_DOCUMENT_TYPES,
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedExtensions: ['.docx', '.pdf', '.txt'],
        sanitizeFilename: true,
      });

      logger.info('[EnhancedTextExtraction] File validated successfully', {
        originalFilename,
        sanitizedFilename: guardResult.sanitizedFilename,
        detectedMimeType: guardResult.detectedMimeType,
      });

      // Malware scanning (non-blocking)
      try {
        const scanResult = await scanFile(file, false);
        logger.info('[EnhancedTextExtraction] Malware scan completed', {
          filename: guardResult.sanitizedFilename,
          clean: scanResult.clean,
          scanner: scanResult.scanner,
        });
      } catch (scanError) {
        logger.error('[EnhancedTextExtraction] Malware scan failed', {
          filename: guardResult.sanitizedFilename,
          error: scanError,
        });
      }

      let extractedText = '';

      // Route based on file type
      if (guardResult.detectedMimeType === 'application/pdf') {
        // Enhanced PDF handling
        const hasTextLayer = await this.hasTextLayer(filepath);
        
        if (hasTextLayer && MarkItDown) {
          logger.info('[EnhancedTextExtraction] Using MarkItDown for text-based PDF');
          try {
            extractedText = await this.extractWithMarkItDown(filepath);
          } catch (markItDownError) {
            logger.warn('[EnhancedTextExtraction] MarkItDown failed, falling back to OCR', {
              error: markItDownError instanceof Error ? markItDownError.message : String(markItDownError),
            });
            // Fall back to OCR
            extractedText = await this.extractWithOCR(filepath);
          }
        } else {
          logger.info('[EnhancedTextExtraction] Using OCR for scanned PDF');
          extractedText = await this.extractWithOCR(filepath);
        }
      } else if (
        guardResult.detectedMimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // DOCX handling (existing logic)
        logger.info('[EnhancedTextExtraction] Extracting text from DOCX file');
        const result = await mammoth.extractRawText({ path: filepath });
        extractedText = result.value;
      } else if (
        guardResult.detectedMimeType === 'text/plain' ||
        guardResult.extension === '.txt'
      ) {
        // TXT handling (existing logic)
        logger.info('[EnhancedTextExtraction] Reading text from TXT file');
        extractedText = await fs.readFile(filepath, 'utf-8');
      }

      if (!extractedText) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'No text could be extracted from the file'
        );
      }

      logger.info('[EnhancedTextExtraction] Text extraction completed successfully', {
        textLength: extractedText.length,
        originalFilename,
      });

      return extractedText;
    } catch (error) {
      logger.error('[EnhancedTextExtraction] Text extraction failed', {
        originalFilename,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Fallback to basic text extraction (compatibility with existing service)
   */
  static async fallbackExtraction(file: formidable.File): Promise<string> {
    logger.warn('[EnhancedTextExtraction] Using fallback extraction method');
    
    // Import the existing storage service for fallback
    const { StorageServerService } = await import('./storage.server-service');
    return StorageServerService.extractTextFromFile(file);
  }
} 