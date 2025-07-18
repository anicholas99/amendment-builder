/**
 * Azure Document Intelligence Service
 * 
 * Future migration service for Azure Document Intelligence OCR.
 * Maintains existing patterns and provides enhanced document analysis.
 * 
 * This service will replace Tesseract OCR for production workloads
 * while maintaining backward compatibility with existing architecture.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';
import { env } from '@/config/env';
import { OfficeActionParserService } from './office-action-parser.server-service';

interface AzureDocumentAnalysisResult {
  content: string;
  pages: Array<{
    pageNumber: number;
    content: string;
    confidence: number;
  }>;
  metadata: {
    totalPages: number;
    processingTime: number;
    confidence: number;
  };
}

interface DocumentIntelligenceOptions {
  model?: 'prebuilt-read' | 'prebuilt-layout' | 'prebuilt-document';
  includeStructure?: boolean;
  confidenceThreshold?: number;
}

/**
 * Azure Document Intelligence Service
 * Industry-standard OCR with layout understanding for patent documents
 */
export class AzureDocumentIntelligenceService {
  private static client: DocumentAnalysisClient | null = null;

  /**
   * Initialize Azure Document Intelligence client
   */
  private static getClient(): DocumentAnalysisClient {
    if (this.client) {
      return this.client;
    }

    const endpoint = env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const apiKey = env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY;

    if (!endpoint || !apiKey) {
      throw new ApplicationError(
        ErrorCode.API_SERVICE_UNAVAILABLE,
        'Azure Document Intelligence not configured'
      );
    }

    this.client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    logger.info('[AzureDocumentIntelligence] Client initialized');
    return this.client;
  }

  /**
   * Extract text from document using Azure Document Intelligence
   * Superior to Tesseract for complex patent documents
   */
  static async extractTextFromDocument(
    documentBuffer: Buffer,
    options: DocumentIntelligenceOptions = {}
  ): Promise<AzureDocumentAnalysisResult> {
    const startTime = Date.now();
    
    logger.info('[AzureDocumentIntelligence] Starting document analysis', {
      documentSize: documentBuffer.length,
      model: options.model || 'prebuilt-read',
    });

    try {
      const client = this.getClient();
      const model = options.model || 'prebuilt-read';

      // Start the analysis
      const poller = await client.beginAnalyzeDocument(model, documentBuffer);
      const result = await poller.pollUntilDone();

      if (!result.content) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'No content extracted from document'
        );
      }

      // Process page-level results
      const pages = result.pages?.map((page, index) => ({
        pageNumber: index + 1,
        content: this.extractPageContent(page),
        confidence: this.calculatePageConfidence(page),
      })) || [];

      const overallConfidence = pages.length > 0 
        ? pages.reduce((sum, page) => sum + page.confidence, 0) / pages.length
        : 0;

      const processingTime = Date.now() - startTime;

      logger.info('[AzureDocumentIntelligence] Document analysis completed', {
        totalPages: pages.length,
        confidence: overallConfidence,
        contentLength: result.content.length,
        processingTime,
      });

      return {
        content: result.content,
        pages,
        metadata: {
          totalPages: pages.length,
          processingTime,
          confidence: overallConfidence,
        },
      };

    } catch (error) {
      logger.error('[AzureDocumentIntelligence] Document analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime,
      });

      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `Azure Document Intelligence failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Enhanced Office Action processing using Azure DI + intelligent segmentation
   * Industry standard: OCR + AI analysis pipeline
   */
  static async processOfficeActionDocument(
    documentBuffer: Buffer,
    options: DocumentIntelligenceOptions & { parseWithAI?: boolean } = {}
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
    
    logger.info('[AzureDocumentIntelligence] Processing Office Action document');

    // Step 1: Extract text using Azure Document Intelligence
    const extractionResult = await this.extractTextFromDocument(documentBuffer, options);
    const ocrTime = Date.now() - startTime;

    let parsedAnalysis;
    let analysisTime = 0;

    // Step 2: Optionally parse with AI (using enhanced parser)
    if (options.parseWithAI !== false) {
      const analysisStart = Date.now();
      
      try {
        parsedAnalysis = await OfficeActionParserService.parseOfficeAction(
          extractionResult.content,
          {
            maxTokens: 200000, // Higher limit for Azure-extracted text
          }
        );
        
        analysisTime = Date.now() - analysisStart;
        
        logger.info('[AzureDocumentIntelligence] AI analysis completed', {
          rejections: parsedAnalysis.summary.totalRejections,
          priorArt: parsedAnalysis.summary.uniquePriorArtCount,
          analysisTime,
        });
      } catch (error) {
        logger.error('[AzureDocumentIntelligence] AI analysis failed', {
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
        analysisTime: analysisTime || undefined,
        totalTime,
        confidence: extractionResult.metadata.confidence,
      },
    };
  }

  /**
   * Extract content from a single page
   */
  private static extractPageContent(page: any): string {
    // Azure DI provides structured content - extract text while preserving layout
    if (page.lines) {
      return page.lines.map((line: any) => line.content).join('\n');
    }
    
    if (page.words) {
      return page.words.map((word: any) => word.content).join(' ');
    }

    return '';
  }

  /**
   * Calculate confidence score for a page
   */
  private static calculatePageConfidence(page: any): number {
    if (page.lines) {
      const lineConfidences = page.lines.map((line: any) => line.confidence || 0);
      return lineConfidences.length > 0 
        ? lineConfidences.reduce((sum: number, conf: number) => sum + conf, 0) / lineConfidences.length
        : 0;
    }
    
    return page.confidence || 0;
  }

  /**
   * Health check for Azure Document Intelligence service
   */
  static async healthCheck(): Promise<{
    available: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      
      // Try to initialize client
      this.getClient();
      
      const latency = Date.now() - startTime;
      
      logger.info('[AzureDocumentIntelligence] Health check passed', { latency });
      
      return {
        available: true,
        latency,
      };
    } catch (error) {
      logger.error('[AzureDocumentIntelligence] Health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        available: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get service capabilities and limits
   */
  static getServiceLimits(): {
    maxFileSize: number;
    supportedFormats: string[];
    maxPages: number;
    features: string[];
  } {
    return {
      maxFileSize: 500 * 1024 * 1024, // 500MB for Azure DI
      supportedFormats: ['pdf', 'jpeg', 'png', 'bmp', 'tiff'],
      maxPages: 2000, // Azure DI limit
      features: [
        'High-accuracy OCR',
        'Layout understanding', 
        'Table extraction',
        'Form field detection',
        'Handwriting recognition',
        'Multi-language support',
      ],
    };
  }
} 