/**
 * TiptapPreviewModal - Editable Claims Preview Modal
 * 
 * Converts the read-only PreviewModal into an editable Tiptap-based modal
 * that allows users to edit claims directly in the modal interface.
 */

import React, { useCallback, useState, useMemo } from 'react';
import { FileText, Save, Edit3, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import TiptapPreviewEditor, { TiptapPreviewEditorRef } from '@/features/amendment/components/TiptapPreviewEditor';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';

interface TiptapPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: Record<string, string>;
  onSave?: (updatedClaims: Record<string, string>) => void;
  projectId?: string;
  readOnly?: boolean;
}

const TiptapPreviewModal: React.FC<TiptapPreviewModalProps> = ({
  isOpen,
  onClose,
  claims,
  onSave,
  projectId,
  readOnly = false,
}) => {
  const { isDarkMode } = useThemeContext();
  const toast = useToast();
  const editorRef = React.useRef<TiptapPreviewEditorRef>(null);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [hasChanges, setHasChanges] = useState(false);

  // Convert claims object to HTML for editor
  const generateClaimsHTML = useCallback((claimsData: Record<string, string>): string => {
    if (Object.keys(claimsData).length === 0) {
      return `
        <div class="modal-claims-container">
          <div class="no-claims-message">
            <p><em>No claims available to preview.</em></p>
          </div>
        </div>
      `;
    }

    const claimsHtml = Object.entries(claimsData)
      .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by claim number
      .map(([number, text]) => `
        <div class="claim-section" data-claim-number="${number}">
          <div class="claim-header">
            <h3>Claim ${number}</h3>
          </div>
          <div class="claim-text">
            ${text}
          </div>
        </div>
      `).join('\n');

    return `
      <div class="modal-claims-container">
        <div class="claims-header">
          <h2>Claims Preview</h2>
          <p><small>${Object.keys(claimsData).length} claim(s)</small></p>
        </div>
        <div class="claims-content">
          ${claimsHtml}
        </div>
      </div>
    `;
  }, []);

  // Parse HTML back to claims object
  const parseClaimsFromHTML = useCallback((html: string): Record<string, string> => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const claimSections = doc.querySelectorAll('.claim-section');
      const updatedClaims: Record<string, string> = {};

      claimSections.forEach(section => {
        const claimNumber = section.getAttribute('data-claim-number');
        const claimTextElement = section.querySelector('.claim-text');
        
        if (claimNumber && claimTextElement) {
          const claimText = claimTextElement.textContent?.trim() || '';
          updatedClaims[claimNumber] = claimText;
        }
      });

      return updatedClaims;
    } catch (error) {
      logger.error('[TiptapPreviewModal] Failed to parse claims from HTML', { error });
      return claims; // Fallback to original claims
    }
  }, [claims]);

  // Generate HTML content for the editor
  const editorContent = useMemo(() => {
    return generateClaimsHTML(claims);
  }, [claims, generateClaimsHTML]);

  // Handle content changes
  const handleContentChange = useCallback((html: string) => {
    setHasChanges(true);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    if (!editorRef.current || !onSave) return;

    try {
      const editor = editorRef.current.getEditor();
      if (!editor) return;

      const currentHTML = editor.getHTML();
      const updatedClaims = parseClaimsFromHTML(currentHTML);

      onSave(updatedClaims);
      setHasChanges(false);

      toast.success({
        title: 'Claims Saved',
        description: `Updated ${Object.keys(updatedClaims).length} claims`,
      });

      logger.info('[TiptapPreviewModal] Claims saved successfully', {
        projectId,
        claimsCount: Object.keys(updatedClaims).length,
      });

    } catch (error) {
      logger.error('[TiptapPreviewModal] Failed to save claims', { error });
      toast.error({
        title: 'Save Failed',
        description: 'Failed to save claims. Please try again.',
      });
    }
  }, [parseClaimsFromHTML, onSave, projectId, toast]);

  // Handle edit mode toggle
  const toggleEditMode = useCallback(() => {
    setIsEditing(prev => !prev);
    if (editorRef.current) {
      editorRef.current.toggleReadOnly();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "max-w-4xl max-h-[90vh] overflow-hidden flex flex-col",
        isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
      )}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Claims Preview
            </div>
            {!readOnly && (
              <div className="flex items-center gap-2">
                <Badge variant={isEditing ? 'default' : 'secondary'}>
                  {isEditing ? 'Editing' : 'Viewing'}
                </Badge>
                {hasChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit claims directly in the preview' : 'Review your claims content'}
          </DialogDescription>
        </DialogHeader>

        {/* Editor */}
        <div className="flex-1 overflow-hidden min-h-0">
          <TiptapPreviewEditor
            ref={editorRef}
            content={editorContent}
            onContentChange={handleContentChange}
            onSave={handleSave}
            isReadOnly={!isEditing}
            placeholder="Claims content will appear here..."
            showToolbar={false} // Hide toolbar in modal for cleaner look
            autoSave={false} // Disable auto-save in modal
            className="h-full border rounded-lg"
          />
        </div>

        <DialogFooter className="flex-shrink-0 gap-2">
          {!readOnly && (
            <>
              <Button
                variant="outline"
                onClick={toggleEditMode}
              >
                {isEditing ? <Eye className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                {isEditing ? 'View Mode' : 'Edit Mode'}
              </Button>
              
              {isEditing && onSave && (
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <style jsx global>{`
        .tiptap-preview-editor .modal-claims-container {
          max-width: 100%;
          margin: 0;
          padding: 0;
        }

        .tiptap-preview-editor .claims-header {
          margin-bottom: 1.5em;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 1em;
        }

        .tiptap-preview-editor .claims-header h2 {
          font-size: 16pt;
          font-weight: bold;
          margin: 0 0 0.5em 0;
          color: black;
        }

        .tiptap-preview-editor .claims-header p {
          margin: 0;
          color: #666;
          font-size: 10pt;
        }

        .tiptap-preview-editor .claim-section {
          margin-bottom: 1.5em;
          padding: 1em;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background-color: #fafafa;
        }

        .tiptap-preview-editor .claim-header {
          margin-bottom: 0.5em;
        }

        .tiptap-preview-editor .claim-header h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0;
          color: #1f2937;
        }

        .tiptap-preview-editor .claim-text {
          line-height: 1.6;
          color: #374151;
          font-size: 11pt;
          text-align: justify;
        }

        .tiptap-preview-editor .no-claims-message {
          text-align: center;
          padding: 2em 0;
          color: #666;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .tiptap-preview-editor .claims-header h2 {
            color: white;
          }

          .tiptap-preview-editor .claim-section {
            background-color: #374151;
            border-color: #4b5563;
          }

          .tiptap-preview-editor .claim-header h3 {
            color: #f9fafb;
          }

          .tiptap-preview-editor .claim-text {
            color: #d1d5db;
          }
        }

        /* Responsive adjustments for modal */
        @media (max-width: 768px) {
          .tiptap-preview-editor .ProseMirror {
            padding: 1em;
            font-size: 10pt;
          }

          .tiptap-preview-editor .claim-section {
            padding: 0.75em;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default TiptapPreviewModal; 