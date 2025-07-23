/**
 * TiptapClaimsPreview - Editable USPTO-compliant Claims Document Preview
 * 
 * Converts the read-only ClaimsDocumentPreview into a fully editable Tiptap editor
 * that allows users to edit claims directly in the preview interface while maintaining
 * USPTO-compliant formatting and auto-save functionality.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import TiptapPreviewEditor, { TiptapPreviewEditorRef } from './TiptapPreviewEditor';
import { useUpdateDraftDocument, useDraftDocumentByType } from '@/hooks/api/useDraftDocuments';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';

interface ClaimAmendment {
  id: string;
  claimNumber: string;
  status: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
  originalText: string;
  amendedText: string;
  reasoning: string;
}

interface TiptapClaimsPreviewProps {
  projectId: string;
  claimAmendments?: ClaimAmendment[];
  applicationNumber?: string;
  mailingDate?: string;
  examinerName?: string;
  artUnit?: string;
  className?: string;
  onExport?: () => void;
}

export const TiptapClaimsPreview: React.FC<TiptapClaimsPreviewProps> = ({
  projectId,
  claimAmendments = [],
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

  // Load existing claims data from draft document
  const { data: draftDocument, isLoading } = useDraftDocumentByType(projectId, 'CLAIMS_AMENDMENTS');
  const updateDraftMutation = useUpdateDraftDocument();

  // Parse claims from draft document or use provided claims
  const parsedClaims = useMemo<ClaimAmendment[]>(() => {
    if (claimAmendments.length > 0) {
      return claimAmendments;
    }

    if (draftDocument?.content) {
      try {
        const parsed = JSON.parse(draftDocument.content);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        logger.error('[TiptapClaimsPreview] Failed to parse claims from draft', { error });
        return [];
      }
    }

    return [];
  }, [claimAmendments, draftDocument]);

  // Convert claims data to HTML for the editor
  const generateClaimsHTML = useCallback((claims: ClaimAmendment[]): string => {
    if (claims.length === 0) {
      return `
        <div class="document-container">
          <div class="document-header">
            <div class="application-number">
              <p><strong>Application No.:</strong> ${applicationNumber || '[APPLICATION NUMBER]'}</p>
            </div>
            <div class="document-title">
              <h1>CLAIM AMENDMENTS</h1>
            </div>
            <div class="intro-text">
              <p>This listing of the claims will replace all prior versions of the claims in the application:</p>
            </div>
          </div>
          <div class="claims-content">
            <div class="no-claims-message">
              <p><em>No claim amendments available. Claims will appear here once amendments are generated.</em></p>
            </div>
          </div>
          <div class="document-footer">
            <hr/>
            <p><small>Claims Document Generated: ${new Date().toLocaleDateString()} | Page 1 of 1 | Claim Count: 0</small></p>
          </div>
        </div>
      `;
    }

    const claimsHtml = claims.map(claim => {
      const statusLabel = {
        'CURRENTLY_AMENDED': 'Currently Amended',
        'PREVIOUSLY_PRESENTED': 'Previously Presented',
        'NEW': 'New',
        'CANCELLED': 'Cancelled'
      }[claim.status];

      return `
        <div class="claim-section" data-claim-id="${claim.id}">
          <h3>Claim ${claim.claimNumber}. (${statusLabel})</h3>
          <div class="claim-text">
            ${claim.amendedText || claim.originalText || '[Claim text to be added]'}
          </div>
          ${claim.reasoning && claim.status === 'CURRENTLY_AMENDED' ? `
            <div class="amendment-basis">
              <p><strong>Amendment Basis:</strong></p>
              <p>${claim.reasoning}</p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('\n');

    return `
      <div class="document-container">
        <div class="document-header">
          <div class="application-number">
            <p><strong>Application No.:</strong> ${applicationNumber || '[APPLICATION NUMBER]'}</p>
          </div>
          <div class="document-title">
            <h1>CLAIM AMENDMENTS</h1>
          </div>
          <div class="intro-text">
            <p>This listing of the claims will replace all prior versions of the claims in the application:</p>
          </div>
        </div>
        <div class="claims-content">
          ${claimsHtml}
        </div>
        <div class="document-footer">
          <hr/>
          <p><small>Claims Document Generated: ${new Date().toLocaleDateString()} | Page 1 of 1 | Claim Count: ${claims.length}</small></p>
        </div>
      </div>
    `;
  }, [applicationNumber]);

  // Parse HTML back to claims data structure
  const parseClaimsFromHTML = useCallback((html: string): ClaimAmendment[] => {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const claimSections = doc.querySelectorAll('.claim-section');
      const updatedClaims: ClaimAmendment[] = [];

      claimSections.forEach(section => {
        const claimId = section.getAttribute('data-claim-id');
        const existingClaim = parsedClaims.find(c => c.id === claimId);
        
        if (existingClaim) {
          // Extract the claim text from the HTML
          const claimTextElement = section.querySelector('.claim-text');
          const amendmentBasisElement = section.querySelector('.amendment-basis p:last-child');
          
          const amendedText = claimTextElement?.textContent?.trim() || existingClaim.amendedText;
          const reasoning = amendmentBasisElement?.textContent?.trim() || existingClaim.reasoning;

          updatedClaims.push({
            ...existingClaim,
            amendedText,
            reasoning,
          });
        }
      });

      return updatedClaims;
    } catch (error) {
      logger.error('[TiptapClaimsPreview] Failed to parse claims from HTML', { error });
      return parsedClaims; // Fallback to original claims
    }
  }, [parsedClaims]);

  // Generate HTML content for the editor
  const editorContent = useMemo(() => {
    return generateClaimsHTML(parsedClaims);
  }, [parsedClaims, generateClaimsHTML]);

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
      const updatedClaims = parseClaimsFromHTML(currentHTML);

      // Save to draft document
      await updateDraftMutation.mutateAsync({
        projectId,
        type: 'CLAIMS_AMENDMENTS',
        content: JSON.stringify(updatedClaims),
      });

      toast.success({
        title: 'Claims Saved',
        description: `Updated ${updatedClaims.length} claim amendments`,
      });

      logger.info('[TiptapClaimsPreview] Claims saved successfully', {
        projectId,
        claimsCount: updatedClaims.length,
      });

    } catch (error) {
      logger.error('[TiptapClaimsPreview] Failed to save claims', { error });
      toast.error({
        title: 'Save Failed',
        description: 'Failed to save claim amendments. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, parseClaimsFromHTML, updateDraftMutation, toast]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-50 rounded-lg', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading claims...</span>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Claims Document Preview</h2>
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
          placeholder="Claims content will appear here..."
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
        }

        .tiptap-preview-editor .application-number {
          text-align: right;
          margin-bottom: 1.5em;
        }

        .tiptap-preview-editor .document-title {
          text-align: center;
          margin-bottom: 2em;
        }

        .tiptap-preview-editor .document-title h1 {
          text-decoration: underline;
          font-size: 14pt;
          font-weight: bold;
        }

        .tiptap-preview-editor .intro-text {
          margin-bottom: 1.5em;
        }

        .tiptap-preview-editor .claim-section {
          margin-bottom: 2em;
          page-break-inside: avoid;
        }

        .tiptap-preview-editor .claim-section h3 {
          font-weight: bold;
          margin-bottom: 0.5em;
          color: black;
        }

        .tiptap-preview-editor .claim-text {
          margin-bottom: 1em;
          line-height: 1.6;
          text-align: justify;
          padding-left: 1em;
        }

        .tiptap-preview-editor .amendment-basis {
          padding-left: 2em;
          margin-bottom: 1.5em;
          font-size: 11pt;
        }

        .tiptap-preview-editor .amendment-basis p:first-child {
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .tiptap-preview-editor .no-claims-message {
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
      `}</style>
    </div>
  );
};

export default TiptapClaimsPreview; 