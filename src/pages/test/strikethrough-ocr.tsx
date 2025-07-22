import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, FileImage, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StrikethroughOCRTest() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setProcessedImage(null);
      setOcrResult('');
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/test/process-strikethrough', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: originalImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      setProcessedImage(data.processedImage);
      setOcrResult(data.ocrText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Strikethrough OCR Test</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Supported formats:</strong> PDF files and images (PNG, JPG). 
            PDFs will be automatically converted to images for processing.
            The system will detect and remove strikethrough lines before running OCR.
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label 
              htmlFor="image-upload" 
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded cursor-pointer hover:bg-primary/90"
            >
              <Upload className="w-4 h-4" />
              Choose File (PDF/PNG/JPG)
            </label>
            <input
              id="image-upload"
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedFileName && (
              <span className="text-sm text-muted-foreground">
                {uploadedFileName}
              </span>
            )}
          </div>
          
          {originalImage && (
            <Button 
              onClick={processImage} 
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileImage className="mr-2 h-4 w-4" />
                  Remove Strikethroughs & OCR
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(originalImage || processedImage) && (
        <Tabs defaultValue="images" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="ocr" disabled={!ocrResult}>OCR Result</TabsTrigger>
            <TabsTrigger value="comparison" disabled={!processedImage}>Before/After</TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {originalImage && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Original Image</h3>
                  <div className="relative">
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="w-full h-auto border rounded"
                    />
                  </div>
                </Card>
              )}
              
              {processedImage && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Processed Image (Strikethroughs Removed)</h3>
                  <div className="relative">
                    <img 
                      src={processedImage} 
                      alt="Processed" 
                      className="w-full h-auto border rounded"
                    />
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="ocr">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">OCR Text Output</h3>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm">
                {ocrResult || 'No OCR result yet'}
              </pre>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Side-by-Side Comparison</h3>
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-[800px]">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2">Original</h4>
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="w-full h-auto border rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2">Processed</h4>
                    <img 
                      src={processedImage} 
                      alt="Processed" 
                      className="w-full h-auto border rounded"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}