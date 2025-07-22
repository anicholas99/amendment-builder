import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import sharp from 'sharp';
import { AzureComputerVisionOCRService } from '@/server/services/azure-computer-vision-ocr.server-service';
import { logger } from '@/server/logger';
import { removeStrikethroughsCanvas, removeStrikethroughsSharp } from '@/lib/image-processing/strikethrough-removal';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const requestSchema = z.object({
  image: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFiles: string[] = [];

  try {
    const { image } = requestSchema.parse(req.body);
    
    // Extract base64 data from data URL
    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Check if this is a PDF
    const isPDF = buffer.subarray(0, 4).toString('hex') === '25504446';
    
    let processedBuffers: Buffer[] = [];
    let processedDataUrls: string[] = [];
    
    if (isPDF) {
      logger.info('[Strikethrough Test] PDF detected, converting to images');
      
      // Convert PDF to images
      const images = await convertPDFToImages(buffer, tempFiles);
      
      // Process each image to remove strikethroughs
      for (const imageBuffer of images) {
        let processed: Buffer;
        try {
          processed = await removeStrikethroughsCanvas(imageBuffer);
        } catch (error) {
          logger.warn('Canvas-based processing failed, falling back to Sharp:', {
            error: error instanceof Error ? error.message : String(error)
          });
          processed = await removeStrikethroughsSharp(imageBuffer);
        }
        processedBuffers.push(processed);
        
        const processedBase64 = processed.toString('base64');
        processedDataUrls.push(`data:image/png;base64,${processedBase64}`);
      }
    } else {
      // Single image processing
      let processedBuffer: Buffer;
      try {
        processedBuffer = await removeStrikethroughsCanvas(buffer);
      } catch (error) {
        logger.warn('Canvas-based processing failed, falling back to Sharp:', {
          error: error instanceof Error ? error.message : String(error)
        });
        processedBuffer = await removeStrikethroughsSharp(buffer);
      }
      processedBuffers.push(processedBuffer);
      
      const processedBase64 = processedBuffer.toString('base64');
      processedDataUrls.push(`data:image/png;base64,${processedBase64}`);
    }
    
    // Perform OCR on all processed images
    let ocrTexts: string[] = [];
    
    for (let i = 0; i < processedBuffers.length; i++) {
      try {
        const ocrResult = await AzureComputerVisionOCRService.extractTextFromDocument(
          processedBuffers[i],
          { language: 'en' }
        );
        
        ocrTexts.push(`=== Page ${i + 1} ===\n${ocrResult.content}`);
        
        logger.info(`[Strikethrough Test] OCR completed for page ${i + 1}`, {
          confidence: ocrResult.metadata.confidence,
          textLength: ocrResult.content.length
        });
      } catch (ocrError) {
        logger.error(`[Strikethrough Test] OCR Error for page ${i + 1}:`, {
          error: ocrError instanceof Error ? ocrError.message : String(ocrError)
        });
        ocrTexts.push(`=== Page ${i + 1} ===\nOCR failed - ${ocrError instanceof Error ? ocrError.message : 'Unknown error'}`);
      }
    }
    
    // Clean up temp files
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    return res.status(200).json({
      processedImage: processedDataUrls[0], // First image for display
      processedImages: processedDataUrls, // All images
      ocrText: ocrTexts.join('\n\n'),
      pageCount: processedDataUrls.length
    });
  } catch (error) {
    // Clean up temp files on error
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    logger.error('[Strikethrough Test] Error processing:', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process' 
    });
  }
}

async function convertPDFToImages(pdfBuffer: Buffer, tempFiles: string[]): Promise<Buffer[]> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-convert-'));
  const pdfPath = path.join(tempDir, 'input.pdf');
  const outputPath = path.join(tempDir, 'output');
  
  tempFiles.push(pdfPath);
  
  try {
    // Write PDF to temp file
    await fs.writeFile(pdfPath, pdfBuffer);
    
    // Use pdf-poppler to convert PDF to images
    const poppler = await import('pdf-poppler');
    
    const opts = {
      format: 'png' as const,
      out_dir: tempDir,
      out_prefix: 'page',
      page: null, // Convert all pages
    };
    
    await poppler.convert(pdfPath, opts);
    
    // Read all generated images
    const files = await fs.readdir(tempDir);
    const imageFiles = files
      .filter(f => f.startsWith('page') && f.endsWith('.png'))
      .sort(); // Ensure correct page order
    
    const images: Buffer[] = [];
    
    for (const file of imageFiles) {
      const imagePath = path.join(tempDir, file);
      tempFiles.push(imagePath);
      const imageBuffer = await fs.readFile(imagePath);
      images.push(imageBuffer);
    }
    
    return images;
  } catch (error) {
    logger.error('[PDF Conversion] Error:', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to convert PDF to images');
  }
}

// This function has been replaced with the better Canvas-based implementation

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};