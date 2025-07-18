/**
 * Azure Computer Vision OCR Service
 * 
 * Provides OCR capabilities using Azure Computer Vision Read API.
 * Industry-standard OCR with high accuracy for Office Action documents.
 */

// Note: Using axios for Computer Vision Read API instead of SDK for better control
import axios from 'axios';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { env } from '@/config/env';

// Types for Computer Vision OCR results
export interface ComputerVisionOCRResult {
  content: string;
  pages: {
    pageNumber: number;
    content: string;
    confidence: number;
  }[];
  metadata: {
    totalPages: number;
    processingTime: number;
    confidence: number;
  };
}

export interface ComputerVisionOCROptions {
  /** Language hint for better recognition */
  language?: string;
}

// Types for Computer Vision API responses
interface ComputerVisionReadLine {
  text: string;
  words?: {
    text: string;
    confidence?: number;
  }[];
}

interface ComputerVisionReadPage {
  lines?: ComputerVisionReadLine[];
}

interface ComputerVisionReadResult {
  status: 'notStarted' | 'running' | 'failed' | 'succeeded';
  analyzeResult?: {
    readResults: ComputerVisionReadPage[];
  };
}

/**
 * Azure Computer Vision OCR Service
 * Industry-standard OCR with high accuracy for patent documents
 */
export class AzureComputerVisionOCRService {
  private static validateConfiguration(): { endpoint: string; apiKey: string } {
    const endpoint = env.AZURE_COMPUTER_VISION_ENDPOINT;
    const apiKey = env.AZURE_COMPUTER_VISION_API_KEY;

    if (!endpoint || !apiKey) {
      throw new ApplicationError(
        ErrorCode.API_SERVICE_UNAVAILABLE,
        'Azure Computer Vision not configured'
      );
    }

    return { endpoint, apiKey };
  }

  /**
   * Extract text from document using Azure Computer Vision Read API
   * Optimized for Office Action documents and complex layouts
   */
  static async extractTextFromDocument(
    documentBuffer: Buffer,
    options: ComputerVisionOCROptions = {}
  ): Promise<ComputerVisionOCRResult> {
    const startTime = Date.now();
    
    logger.info('[AzureComputerVisionOCR] Starting document analysis', {
      documentSize: documentBuffer.length,
      language: options.language || 'auto-detect',
    });

    try {
      const { endpoint, apiKey } = this.validateConfiguration();
      const apiVersion = env.AZURE_COMPUTER_VISION_API_VERSION || '2024-02-01';

      // Step 1: Start the read operation
      const readUrl = `${endpoint}/vision/v3.2/read/analyze`;
      
      const readResponse = await axios.post(readUrl, documentBuffer, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/octet-stream',
        },
        params: {
          language: options.language,
        },
        timeout: 30000, // 30 seconds timeout
      });

      // Get the operation location from response headers
      const operationLocation = readResponse.headers['operation-location'];
      if (!operationLocation) {
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          'No operation location returned from Computer Vision Read API'
        );
      }

      // Step 2: Poll for results
      let result: ComputerVisionReadResult | null = null;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds maximum wait time
      
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        attempts++;
        
        try {
          const resultResponse = await axios.get(operationLocation, {
            headers: {
              'Ocp-Apim-Subscription-Key': apiKey,
            },
            timeout: 10000, // 10 seconds timeout for polling
          });
          
          result = resultResponse.data;
        } catch (pollError) {
          logger.warn('[AzureComputerVisionOCR] Polling attempt failed', {
            attempt: attempts,
            error: pollError instanceof Error ? pollError.message : String(pollError),
          });
          
          if (attempts >= maxAttempts) {
            throw new ApplicationError(
              ErrorCode.AI_SERVICE_ERROR,
              'Computer Vision Read API polling timeout'
            );
          }
          continue;
        }
        
        if (result && result.status === 'failed') {
          throw new ApplicationError(
            ErrorCode.FILE_PROCESSING_ERROR,
            'Computer Vision Read API failed to process document'
          );
        }
        
      } while (!result || (result.status !== 'succeeded' && attempts < maxAttempts));

      if (!result || result.status !== 'succeeded') {
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          'Computer Vision Read API did not complete within timeout period'
        );
      }

      if (!result.analyzeResult?.readResults) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'No content extracted from document'
        );
      }

      // Step 3: Process results and extract text
      const pages = result.analyzeResult.readResults.map((page: ComputerVisionReadPage, index: number) => {
        const pageText = page.lines?.map((line: ComputerVisionReadLine) => line.text).join('\n') || '';
        const confidence = this.calculatePageConfidence(page);
        
        return {
          pageNumber: index + 1,
          content: pageText,
          confidence,
        };
      });

      const fullContent = pages.map(page => page.content).join('\n\n--- PAGE BREAK ---\n\n');
      const overallConfidence = pages.length > 0 
        ? pages.reduce((sum, page) => sum + page.confidence, 0) / pages.length
        : 0;

      const processingTime = Date.now() - startTime;

      logger.info('[AzureComputerVisionOCR] Document analysis completed', {
        totalPages: pages.length,
        confidence: overallConfidence,
        contentLength: fullContent.length,
        processingTime,
        pageConfidences: pages.map(p => ({ page: p.pageNumber, confidence: p.confidence })),
        pageLengths: pages.map(p => ({ page: p.pageNumber, length: p.content.length })), // Add page lengths for debugging
        textPreviewFirst500: fullContent.substring(0, 500),
        textPreviewLast500: fullContent.length > 500 ? fullContent.substring(fullContent.length - 500) : '',
        // Add warning about free tier limitation
        warning: pages.length === 2 ? 'WARNING: Only 2 pages detected - may be limited by Free (F0) tier. Upgrade to Standard (S0) to process all pages.' : null,
      });

      return {
        content: fullContent,
        pages,
        metadata: {
          totalPages: pages.length,
          processingTime,
          confidence: overallConfidence,
        },
      };

    } catch (error) {
      logger.error('[AzureComputerVisionOCR] Document analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        if (status === 429) {
          throw new ApplicationError(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'Computer Vision API rate limit exceeded'
          );
        }
        
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          `Azure Computer Vision OCR failed: ${message}`
        );
      }

      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `Azure Computer Vision OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Enhanced Office Action processing using Azure Computer Vision + intelligent segmentation
   * Industry standard: OCR + AI analysis pipeline
   */
  static async processOfficeActionDocument(
    documentBuffer: Buffer,
    options: ComputerVisionOCROptions & { parseWithAI?: boolean } = {}
  ): Promise<{
    extractedText: string;
    parsedAnalysis?: any;
    processingStats: {
      ocrTime: number;
      analysisTime?: number;
      totalTime: number;
      confidence: number;
    };
  }> {
    const startTime = Date.now();
    
    logger.info('[AzureComputerVisionOCR] Processing Office Action document');

    // Step 1: Extract text using Azure Computer Vision
    const extractionResult = await this.extractTextFromDocument(documentBuffer, options);
    const ocrTime = Date.now() - startTime;

    let parsedAnalysis;
    let analysisTime = 0;

    // Step 2: Optionally parse with AI (using enhanced parser)
    if (options.parseWithAI !== false) {
      const analysisStart = Date.now();
      
      try {
        // Import the Office Action parser dynamically to avoid circular dependencies
        const { OfficeActionParserService } = await import('./office-action-parser.server-service');
        
        parsedAnalysis = await OfficeActionParserService.parseOfficeAction(
          extractionResult.content,
          {
            maxTokens: 200000, // Higher limit for Azure-extracted text
          }
        );
        
        analysisTime = Date.now() - analysisStart;
        
        logger.info('[AzureComputerVisionOCR] AI analysis completed', {
          rejections: parsedAnalysis.summary?.totalRejections || 0,
          priorArt: parsedAnalysis.summary?.uniquePriorArtCount || 0,
          analysisTime,
        });
      } catch (error) {
        logger.error('[AzureComputerVisionOCR] AI analysis failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue without AI analysis
      }
    }

    const totalTime = Date.now() - startTime;

    return {
      extractedText: extractionResult.content,
      parsedAnalysis,
      processingStats: {
        ocrTime,
        analysisTime,
        totalTime,
        confidence: extractionResult.metadata.confidence,
      },
    };
  }

  /**
   * Calculate confidence score for a page
   */
  private static calculatePageConfidence(page: ComputerVisionReadPage): number {
    if (!page.lines || page.lines.length === 0) {
      return 0;
    }

    // Computer Vision provides confidence at word level
    let totalConfidence = 0;
    let wordCount = 0;

    for (const line of page.lines) {
      if (line.words) {
        for (const word of line.words) {
          if (typeof word.confidence === 'number') {
            totalConfidence += word.confidence;
            wordCount++;
          }
        }
      }
    }

    return wordCount > 0 ? totalConfidence / wordCount : 0.8; // Default confidence
  }

  /**
   * Health check for Azure Computer Vision service
   */
  static async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      this.validateConfiguration();
      
      const latency = Date.now() - startTime;

      logger.info('[AzureComputerVisionOCR] Health check passed', { latency });

      return {
        healthy: true,
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      logger.error('[AzureComputerVisionOCR] Health check failed', {
        error: error instanceof Error ? error.message : String(error),
        latency,
      });

      return {
        healthy: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
} 