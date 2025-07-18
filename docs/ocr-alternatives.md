# OCR Alternatives to Azure Document Intelligence

Since you don't have access to Azure Document Intelligence, here are several OCR alternatives that can extract text from scanned PDFs:

## **1. Tesseract.js (✅ Already Integrated)**

**Status:** Integrated into your enhanced text extraction service as a fallback

**Pros:**
- Free and open source
- No API limits or costs
- Runs locally on your server
- Good accuracy for clean documents
- Supports multiple languages

**Cons:**
- Slower than cloud services
- Requires more server resources
- Lower accuracy on poor quality scans

**Setup:** Already installed and configured. Will automatically be used when Azure DI is unavailable.

## **2. Google Cloud Vision API**

**Pros:**
- Excellent accuracy
- Fast processing
- Handles multiple languages
- Good with handwriting
- Supports batch processing

**Cons:**
- Requires Google Cloud account
- Pay-per-use pricing
- API rate limits

**Setup:**
```bash
npm install @google-cloud/vision
```

**Usage Example:**
```typescript
// src/server/services/google-vision-ocr.server-service.ts
import { ImageAnnotatorClient } from '@google-cloud/vision';

export class GoogleVisionOCRService {
  private static client = new ImageAnnotatorClient({
    keyFilename: 'path/to/service-account-key.json',
    projectId: 'your-project-id',
  });

  static async extractTextFromPDF(pdfPath: string): Promise<string> {
    // Convert PDF to images first (same as Tesseract approach)
    const imageFiles = await this.convertPdfToImages(pdfPath);
    
    const ocrPromises = imageFiles.map(async (imagePath) => {
      const [result] = await this.client.textDetection(imagePath);
      return result.textAnnotations?.[0]?.description || '';
    });

    const results = await Promise.all(ocrPromises);
    return results.join('\n\n--- Page Break ---\n\n');
  }
}
```

**Environment Variables:**
```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## **3. AWS Textract**

**Pros:**
- High accuracy
- Handles forms and tables well
- Asynchronous processing for large documents
- Good integration with AWS services

**Cons:**
- Requires AWS account
- Pay-per-use pricing
- More complex setup

**Setup:**
```bash
npm install @aws-sdk/client-textract
```

**Usage Example:**
```typescript
// src/server/services/aws-textract-ocr.server-service.ts
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

export class AWSTextractOCRService {
  private static client = new TextractClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  static async extractTextFromPDF(pdfPath: string): Promise<string> {
    const fileBuffer = await fs.readFile(pdfPath);
    
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: fileBuffer,
      },
    });

    const response = await this.client.send(command);
    
    return response.Blocks
      ?.filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n') || '';
  }
}
```

## **4. OCR.space API**

**Pros:**
- Free tier available (25,000 requests/month)
- Simple REST API
- No setup complexity
- Supports multiple formats

**Cons:**
- Limited accuracy compared to major cloud providers
- Rate limits on free tier
- Requires internet connection

**Setup:**
```bash
npm install node-fetch # if not already installed
```

**Usage Example:**
```typescript
// src/server/services/ocrspace-ocr.server-service.ts
export class OCRSpaceService {
  private static readonly API_KEY = process.env.OCR_SPACE_API_KEY;
  private static readonly API_URL = 'https://api.ocr.space/parse/image';

  static async extractTextFromPDF(pdfPath: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));
    formData.append('apikey', this.API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const response = await fetch(this.API_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result.ParsedResults?.[0]?.ParsedText || '';
  }
}
```

## **5. Adobe PDF Services API**

**Pros:**
- High accuracy for PDFs
- Built specifically for PDF processing
- Good table and form extraction

**Cons:**
- Commercial service
- More expensive than alternatives
- Complex setup

## **6. Mathpix (For Technical Documents)**

**Pros:**
- Excellent for mathematical content
- Good for technical documents
- Handles equations and formulas

**Cons:**
- Limited to specific use cases
- Pay-per-use pricing

## **Recommended Implementation Strategy**

1. **Primary:** Use Tesseract.js (already integrated) for most documents
2. **Fallback:** Implement Google Vision or AWS Textract for higher accuracy when needed
3. **Specific cases:** Use Mathpix for patent documents with complex formulas

## **Performance Comparison**

| Service | Speed | Accuracy | Cost | Setup Complexity |
|---------|-------|----------|------|------------------|
| Tesseract.js | Slow | Good | Free | Low ✅ |
| Google Vision | Fast | Excellent | $1.50/1000 | Medium |
| AWS Textract | Fast | Excellent | $1.50/1000 | Medium |
| OCR.space | Medium | Good | Free tier | Low |
| Azure DI | Fast | Excellent | $1.50/1000 | Medium |

## **Integration with Your Current System**

Your enhanced text extraction service now automatically uses Tesseract OCR when Azure Document Intelligence is unavailable. To add additional services:

```typescript
// In enhanced-text-extraction.server-service.ts
private static async extractWithOCR(filePath: string): Promise<string> {
  const client = this.getDocumentAnalysisClient();
  
  if (!client) {
    // Try multiple OCR services in priority order
    try {
      return await this.extractWithTesseractOCR(filePath);
    } catch (tesseractError) {
      logger.warn('Tesseract OCR failed, trying Google Vision', { tesseractError });
      return await this.extractWithGoogleVision(filePath);
    }
  }
  
  // Use Azure DI if available
  // ... existing Azure DI code
}
```

## **Current Status**

✅ **Tesseract OCR** - Integrated and ready to use
⏳ **Google Vision** - Code example provided, requires setup
⏳ **AWS Textract** - Code example provided, requires setup
⏳ **OCR.space** - Code example provided, requires API key

Your system will now automatically fall back to Tesseract OCR when Azure Document Intelligence permissions are not available. 