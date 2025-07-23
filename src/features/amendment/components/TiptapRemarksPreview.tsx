/**
 * TiptapRemarksPreview - Editable USPTO-compliant Remarks Document Preview
 * 
 * Converts the read-only RemarksDocumentPreview into a fully editable Tiptap editor
 * that allows users to edit legal arguments directly in the preview interface while maintaining
 * USPTO-compliant formatting and auto-save functionality.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import TiptapPreviewEditor, { TiptapPreviewEditorRef } from './TiptapPreviewEditor';
import { useUpdateDraftDocument, useDraftDocumentByType } from '@/hooks/api/useDraftDocuments';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { Button } from '@/components/ui/button';
import { Download, MessageSquare, Loader2 } from 'lucide-react';

interface ArgumentSection {
  id: string;
  title: string;
  content: string;
  type: string;
  rejectionId?: string;
}

interface TiptapRemarksPreviewProps {
  projectId: string;
  argumentSections?: ArgumentSection[];
  responseType?: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
  applicationNumber?: string;
  mailingDate?: string;
  examinerName?: string;
  artUnit?: string;
  className?: string;
  onExport?: () => void;
}

export const TiptapRemarksPreview: React.FC<TiptapRemarksPreviewProps> = ({
  projectId,
  argumentSections = [],
  responseType = 'AMENDMENT',
  applicationNumber,
  mailingDate,
  examinerName,
  artUnit,
  className,
  onExport,
}) => {
  const toast = useToast();
  const editorRef = React.useRef<TiptapPreviewEditorRef>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing arguments data from draft document
  const { data: draftDocument, isLoading } = useDraftDocumentByType(projectId, 'ARGUMENTS');
  const updateDraftMutation = useUpdateDraftDocument();

  // Parse arguments from draft document or use provided arguments
  const parsedArguments = useMemo<ArgumentSection[]>(() => {
    if (argumentSections.length > 0) {
      return argumentSections;
    }

    if (draftDocument?.content) {
      try {
        const parsed = JSON.parse(draftDocument.content);
        return parsed.arguments || [];
      } catch (error) {
        logger.error('[TiptapRemarksPreview] Failed to parse arguments from draft', { error });
        return [];
      }
    }

    return [];
  }, [argumentSections, draftDocument]);

  // Convert arguments data to HTML for the editor
  const generateRemarksHTML = useCallback((arguments: ArgumentSection[]): string => {
    const argumentsHtml = arguments.length > 0 ? arguments.map((section, index) => `
      <div class="argument-section" data-argument-id="${section.id}">
        <h3>${String.fromCharCode(65 + index)}. ${section.title}</h3>
        <div class="argument-content">
          ${section.content || '[Content will be added when arguments are drafted]'}
        </div>
      </div>
    `).join('\n') : `
      <div class="no-arguments-message">
        <p><em>No remarks sections available. Legal arguments will appear here once drafted.</em></p>
      </div>
    `;

    const conclusionSection = arguments.length > 0 ? `
      <div class="conclusion-section">
        <h3>CONCLUSION</h3>
        <div class="conclusion-content">
          <p>In view of the above remarks, Applicant respectfully submits that the claims are in condition for allowance and requests that the Examiner withdraw the rejections and allow the application to issue as a patent.</p>
          <br/>
          <p>Respectfully submitted,</p>
          <br/>
          <br/>
          <p>_________________________</p>
          <p>[ATTORNEY NAME]<br/>
          Registration No. [REG NO]<br/>
          Attorney for Applicant</p>
        </div>
      </div>
    ` : '';

    return `
      <div class="document-container">
        <div class="document-header">
          <div class="uspto-header">
            <h2>IN THE UNITED STATES PATENT AND TRADEMARK OFFICE</h2>
          </div>
          
          <div class="application-info">
            <div class="info-grid">
              <div class="info-left">
                <p><strong>Applicant:</strong> [APPLICANT NAME]</p>
                <p><strong>Application No.:</strong> ${applicationNumber || '[APPLICATION NUMBER]'}</p>
                <p><strong>Filing Date:</strong> [FILING DATE]</p>
              </div>
              <div class="info-right">
                <p><strong>Art Unit:</strong> ${artUnit || '[ART UNIT]'}</p>
                <p><strong>Examiner:</strong> ${examinerName || '[EXAMINER NAME]'}</p>
                <p><strong>Confirmation No.:</strong> [CONFIRMATION NO.]</p>
              </div>
            </div>
          </div>
          
          <div class="document-title">
            <h1>REMARKS</h1>
            <p>(${responseType} Response to Office Action)</p>
          </div>
        </div>

        <div class="remarks-content">
          ${arguments.length > 0 ? `
            <div class="intro-text">
              <p>Applicant respectfully submits the following remarks in response to the Office Action. The rejections are respectfully traversed for the reasons set forth below.</p>
            </div>
          ` : ''}
          
          ${argumentsHtml}
          
          ${conclusionSection}
        </div>

        <div class="document-footer">
          <hr/>
          <p><small>Remarks Document Generated: ${new Date().toLocaleDateString()} | Page 1 of 1 | Argument Sections: ${arguments.length}</small></p>
        </div>
      </div>
    `;
  }, [applicationNumber, examinerName, artUnit, responseType]);

  // Parse HTML back to arguments data structure
  const parseArgumentsFromHTML = useCallback((html: string): ArgumentSection[] => {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const argumentSections = doc.querySelectorAll('.argument-section');
      const updatedArguments: ArgumentSection[] = [];

      argumentSections.forEach(section => {
        const argumentId = section.getAttribute('data-argument-id');
        const existingArgument = parsedArguments.find(a => a.id === argumentId);
        
        if (existingArgument) {
          // Extract the title and content from the HTML
          const titleElement = section.querySelector('h3');
          const contentElement = section.querySelector('.argument-content');
          
          let title = existingArgument.title;
          if (titleElement) {
            const titleText = titleElement.textContent?.trim() || '';
            // Extract title without the letter prefix (e.g., "A. Title" -> "Title")
            const titleMatch = titleText.match(/^[A-Z]\.\s*(.+)$/);
            title = titleMatch ? titleMatch[1] : titleText;
          }
          
          const content = contentElement?.textContent?.trim() || existingArgument.content;

          updatedArguments.push({
            ...existingArgument,
            title,
            content,
          });
        }
      });

      return updatedArguments;
    } catch (error) {
      logger.error('[TiptapRemarksPreview] Failed to parse arguments from HTML', { error });
      return parsedArguments; // Fallback to original arguments
    }
  }, [parsedArguments]);

  // Generate HTML content for the editor
  const editorContent = useMemo(() => {
    return generateRemarksHTML(parsedArguments);
  }, [parsedArguments, generateRemarksHTML]);

  // Handle content changes from the editor
  const handleContentChange = useCallback((html: string) => {
    // We'll handle the parsing and saving in the save function
    // to avoid too frequent updates
  }, []);

  // Handle save functionality
  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;

    try {
      setIsSaving(true);
      
      const editor = editorRef.current.getEditor();
      if (!editor) return;

      const currentHTML = editor.getHTML();
      const updatedArguments = parseArgumentsFromHTML(currentHTML);

      // Save to draft document using the same structure as ArgumentsTab
      const argumentDraft = {
        arguments: updatedArguments,
        lastSaved: new Date(),
      };

      await updateDraftMutation.mutateAsync({
        projectId,
        type: 'ARGUMENTS',
        content: JSON.stringify(argumentDraft),
      });

      toast.success({
        title: 'Remarks Saved',
        description: `Updated ${updatedArguments.length} argument sections`,
      });

      logger.info('[TiptapRemarksPreview] Remarks saved successfully', {
        projectId,
        argumentsCount: updatedArguments.length,
      });

    } catch (error) {
      logger.error('[TiptapRemarksPreview] Failed to save remarks', { error });
      toast.error({
        title: 'Save Failed',
        description: 'Failed to save remarks. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, parseArgumentsFromHTML, updateDraftMutation, toast]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-50 rounded-lg', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading remarks...</span>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Remarks Document Preview</h2>
          {isSaving && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <TiptapPreviewEditor
          ref={editorRef}
          content={editorContent}
          onContentChange={handleContentChange}
          onSave={handleSave}
          placeholder="Remarks content will appear here..."
          autoSave={true}
          autoSaveDelay={3000}
          className="h-full"
        />
      </div>

      <style jsx global>{`
        .tiptap-preview-editor .document-container {
          max-width: 100%;
          margin: 0;
        }

        .tiptap-preview-editor .document-header {
          margin-bottom: 2em;
          border-bottom: 2px solid black;
          padding-bottom: 1em;
        }

        .tiptap-preview-editor .uspto-header {
          text-align: center;
          margin-bottom: 1em;
        }

        .tiptap-preview-editor .uspto-header h2 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0;
        }

        .tiptap-preview-editor .application-info {
          margin-bottom: 1em;
        }

        .tiptap-preview-editor .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2em;
          font-size: 11pt;
        }

        .tiptap-preview-editor .document-title {
          text-align: center;
        }

        .tiptap-preview-editor .document-title h1 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0.5em 0 0.2em 0;
        }

        .tiptap-preview-editor .document-title p {
          font-size: 11pt;
          margin: 0;
        }

        .tiptap-preview-editor .intro-text {
          margin-bottom: 1.5em;
        }

        .tiptap-preview-editor .argument-section {
          margin-bottom: 2em;
          page-break-inside: avoid;
        }

        .tiptap-preview-editor .argument-section h3 {
          font-weight: bold;
          margin-bottom: 1em;
          color: black;
          font-size: 12pt;
        }

        .tiptap-preview-editor .argument-content {
          padding-left: 1.5em;
          line-height: 1.6;
          text-align: justify;
          white-space: pre-wrap;
        }

        .tiptap-preview-editor .conclusion-section {
          margin-top: 2em;
          page-break-inside: avoid;
        }

        .tiptap-preview-editor .conclusion-section h3 {
          font-weight: bold;
          margin-bottom: 1em;
          color: black;
          font-size: 12pt;
        }

        .tiptap-preview-editor .conclusion-content {
          padding-left: 1.5em;
          line-height: 1.6;
          text-align: justify;
        }

        .tiptap-preview-editor .no-arguments-message {
          text-align: center;
          padding: 3em 0;
          color: #666;
        }

        .tiptap-preview-editor .document-footer {
          margin-top: 3em;
          padding-top: 1.5em;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 10pt;
          color: #666;
        }

        .tiptap-preview-editor hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 1em 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .tiptap-preview-editor .info-grid {
            grid-template-columns: 1fr;
            gap: 1em;
          }
        }
      `}</style>
    </div>
  );
};

export default TiptapRemarksPreview; 