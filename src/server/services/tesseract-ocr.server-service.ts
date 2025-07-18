/**
 * Tesseract OCR Service
 * 
 * Provides OCR capabilities using Tesseract.js as an alternative to Azure Document Intelligence.
 * Handles scanned PDFs by converting pages to images and performing OCR.
 */

import fs from 'fs/promises';
import path from 'path';
import { createWorker } from 'tesseract.js';
import * as pdfPoppler from 'pdf-poppler';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

export interface TesseractOCROptions {
  language?: string;
  pageNumbers?: number[];
  enhance?: boolean;
  confidence?: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  pageCount: number;
  processingTime: number;
}

/**
 * Tesseract OCR Service for document text extraction
 */
export class TesseractOCRService {
  private static workerPool: any[] = [];
  private static readonly MAX_WORKERS = 2;
  private static readonly DEFAULT_LANGUAGE = 'eng';
  
  /**
   * Initialize worker pool for better performance
   */
  private static async getWorker(): Promise<any> {
    if (this.workerPool.length > 0) {
      return this.workerPool.pop()!;
    }
    
    logger.debug('[TesseractOCR] Creating new Tesseract worker');
    const worker = await createWorker();
    return worker;
  }

  /**
   * Return worker to pool for reuse
   */
  private static async returnWorker(worker: any): Promise<void> {
    if (this.workerPool.length < this.MAX_WORKERS) {
      this.workerPool.push(worker);
    } else {
      await worker.terminate();
    }
  }

  /**
   * Convert PDF to images for OCR processing
   */
  private static async convertPdfToImages(
    pdfPath: string, 
    outputDir: string
  ): Promise<string[]> {
    try {
      logger.debug('[TesseractOCR] Converting PDF to images', { pdfPath });
      
      const options = {
        format: 'png' as const,
        out_dir: outputDir,
        out_prefix: 'page',
        page: null, // Convert all pages
        scale: 1024, // Higher scale for better OCR accuracy
      };

      const pages = await pdfPoppler.convert(pdfPath, options);
      
      // Get list of generated image files
      const files = await fs.readdir(outputDir);
      const imageFiles = files
        .filter(file => file.startsWith('page') && file.endsWith('.png'))
        .map(file => path.join(outputDir, file))
        .sort(); // Ensure pages are in order

      logger.info('[TesseractOCR] PDF converted to images', {
        pageCount: imageFiles.length,
        outputDir,
      });

      return imageFiles;
    } catch (error) {
      logger.error('[TesseractOCR] Failed to convert PDF to images', {
        error: error instanceof Error ? error.message : String(error),
        pdfPath,
      });
      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform OCR on a single image
   */
  private static async performOCROnImage(
    imagePath: string,
    options: TesseractOCROptions = {}
  ): Promise<{ text: string; confidence: number }> {
    let worker = null;
    
    try {
      const language = options.language || this.DEFAULT_LANGUAGE;
      
      logger.debug('[TesseractOCR] Performing OCR on image', {
        imagePath,
        language,
      });

      // Create a fresh worker for each image to avoid API issues
      worker = await createWorker(language);

      const { data } = await worker.recognize(imagePath);
      
      logger.debug('[TesseractOCR] OCR completed for image', {
        imagePath,
        confidence: data.confidence,
        textLength: data.text.length,
      });

      return {
        text: data.text,
        confidence: data.confidence,
      };
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  /**
   * Clean up temporary files
   */
  private static async cleanupTempFiles(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      logger.debug('[TesseractOCR] Cleaned up temporary files', { tempDir });
    } catch (error) {
      logger.warn('[TesseractOCR] Failed to cleanup temporary files', {
        tempDir,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Extract text from PDF using Tesseract OCR
   */
  static async extractTextFromPDF(
    pdfPath: string,
    options: TesseractOCROptions = {}
  ): Promise<OCRResult> {
    const startTime = Date.now();
    
    logger.info('[TesseractOCR] Starting PDF OCR extraction', {
      pdfPath,
      options,
    });

    // Create temporary directory for images
    const tempDir = path.join(process.cwd(), 'temp', `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
      
      // Convert PDF to images
      const imageFiles = await this.convertPdfToImages(pdfPath, tempDir);
      
      if (imageFiles.length === 0) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'No pages found in PDF or conversion failed'
        );
      }

      // Process specific pages if requested
      const pagesToProcess = options.pageNumbers 
        ? imageFiles.filter((_, index) => options.pageNumbers!.includes(index + 1))
        : imageFiles;

      logger.info('[TesseractOCR] Processing pages for OCR', {
        totalPages: imageFiles.length,
        pagesToProcess: pagesToProcess.length,
      });

      // Perform OCR on each image
      const ocrPromises = pagesToProcess.map(async (imagePath, index) => {
        try {
          const result = await this.performOCROnImage(imagePath, options);
          return {
            pageNumber: index + 1,
            text: result.text,
            confidence: result.confidence,
          };
        } catch (error) {
          logger.warn('[TesseractOCR] OCR failed for page', {
            imagePath,
            pageNumber: index + 1,
            error: error instanceof Error ? error.message : String(error),
          });
          return {
            pageNumber: index + 1,
            text: `[OCR failed for page ${index + 1}]`,
            confidence: 0,
          };
        }
      });

      const ocrResults = await Promise.all(ocrPromises);
      
      // Combine all text
      const combinedText = ocrResults
        .map(result => result.text)
        .join('\n\n--- Page Break ---\n\n')
        .trim();

      // Calculate average confidence
      const validResults = ocrResults.filter(r => r.confidence > 0);
      const averageConfidence = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length
        : 0;

      const processingTime = Date.now() - startTime;

      // Filter by confidence if specified
      if (options.confidence && averageConfidence < options.confidence) {
        logger.warn('[TesseractOCR] OCR confidence below threshold', {
          averageConfidence,
          threshold: options.confidence,
        });
      }

      const result: OCRResult = {
        text: combinedText,
        confidence: averageConfidence,
        pageCount: imageFiles.length,
        processingTime,
      };

      logger.info('[TesseractOCR] OCR extraction completed successfully', {
        textLength: combinedText.length,
        averageConfidence,
        pageCount: imageFiles.length,
        processingTime,
      });

      return result;
      
    } finally {
      // Clean up temporary files
      await this.cleanupTempFiles(tempDir);
    }
  }

  /**
   * Check if Tesseract is available and working
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const worker = await createWorker('eng');
      await worker.terminate();
      
      logger.info('[TesseractOCR] Health check passed');
      return true;
    } catch (error) {
      logger.error('[TesseractOCR] Health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Terminate all workers in the pool
   */
  static async cleanup(): Promise<void> {
    logger.info('[TesseractOCR] Cleaning up worker pool');
    
    const cleanupPromises = this.workerPool.map(worker => worker.terminate());
    await Promise.all(cleanupPromises);
    this.workerPool = [];
    
    logger.info('[TesseractOCR] Worker pool cleanup completed');
  }
} 