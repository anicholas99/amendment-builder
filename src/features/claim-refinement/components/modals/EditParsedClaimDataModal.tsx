import React, { useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import {
  FiRefreshCw,
  FiTrash2,
  FiPlus,
  FiInfo,
  FiChevronDown,
  FiList,
  FiSearch,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { useToast } from '@/hooks/useToastWrapper';
import { cn } from '@/lib/utils';

// shadcn/ui imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface EditParsedClaimDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedElements: string[];
  searchQueries: string[];
  onSave: (data: { elements: string[]; queries: string[] }) => Promise<void>;
  onSaveAndResync: (data: {
    elements: string[];
    queries: string[];
  }) => Promise<void>;
  onResyncElementsOnly?: () => Promise<void>;
  onResyncQueriesOnly?: (elements: string[]) => Promise<void>;
}

export const EditParsedClaimDataModal: React.FC<
  EditParsedClaimDataModalProps
> = ({
  isOpen,
  onClose,
  parsedElements,
  searchQueries,
  onSave,
  onSaveAndResync,
  onResyncElementsOnly,
  onResyncQueriesOnly,
}) => {
  const [editedQueries, setEditedQueries] = useState<string[]>([]);
  const [editedElements, setEditedElements] = useState<string[]>([]);
  const [isAddingElement, setIsAddingElement] = useState(false);
  const [newElementText, setNewElementText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setEditedQueries(searchQueries || []);
      setEditedElements(parsedElements || []);
    }
  }, [isOpen, searchQueries, parsedElements]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        elements: editedElements.filter(el => el.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });
      toast({
        title: 'Changes saved',
        description:
          'Elements and queries have been saved. Your next search will use these updated values.',
        status: 'success',
      });
      onClose();
    } catch (error) {
      logger.error('Save failed in EditParsedClaimDataModal', { error });
      toast({
        title: 'Save failed',
        description:
          'Failed to save changes. Please check your connection and try again.',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResync = async () => {
    setIsSaving(true);
    try {
      await onSaveAndResync({
        elements: editedElements.filter(el => el.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });
      toast({
        title: 'Saved & Resyncing',
        description:
          'Your changes have been saved and a resync is in progress.',
        status: 'success',
      });
      onClose();
    } catch (error) {
      logger.error('Save and resync failed in EditParsedClaimDataModal', {
        error,
      });
      toast({
        title: 'Operation failed',
        description: 'Could not save and resync. Please try again.',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResyncElementsOnly = async () => {
    if (!onResyncElementsOnly) return;

    setIsSaving(true);
    try {
      await onSave({
        elements: editedElements.filter(el => el.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });

      await onResyncElementsOnly();

      toast({
        title: 'Elements Resynced',
        description:
          'Elements have been regenerated from claim text. Your custom queries are preserved.',
        status: 'success',
      });
      onClose();
    } catch (error) {
      logger.error('Resync elements failed in EditParsedClaimDataModal', {
        error,
      });
      toast({
        title: 'Resync failed',
        description: 'Could not resync elements. Please try again.',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResyncQueriesOnly = async () => {
    if (!onResyncQueriesOnly) return;

    setIsSaving(true);
    try {
      await onSave({
        elements: editedElements.filter(el => el.trim()),
        queries: editedQueries.filter(q => q.trim()),
      });

      await onResyncQueriesOnly(editedElements.filter(el => el.trim()));

      toast({
        title: 'Queries Regenerated',
        description: 'Search queries have been regenerated from your elements.',
        status: 'success',
      });
      onClose();
    } catch (error) {
      logger.error('Resync queries failed in EditParsedClaimDataModal', {
        error,
      });
      toast({
        title: 'Resync failed',
        description: 'Could not regenerate queries. Please try again.',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteElement = (index: number) => {
    const newElements = editedElements.filter((_, i) => i !== index);
    setEditedElements(newElements);
  };

  const handleEditElement = (index: number, value: string) => {
    const newElements = [...editedElements];
    newElements[index] = value;
    setEditedElements(newElements);
  };

  const handleAddElement = () => {
    if (newElementText.trim()) {
      setEditedElements([...editedElements, newElementText.trim()]);
      setNewElementText('');
      setIsAddingElement(false);
    }
  };

    // Render modern element item
  const renderElementItem = (element: string, index: number) => (
    <div
      key={index}
      className="group relative rounded border bg-card p-2 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          contentEditable
          suppressContentEditableWarning
          className="text-sm flex-1 leading-relaxed outline-none focus:bg-accent/20 rounded px-1 py-0.5 transition-colors"
          onBlur={e => handleEditElement(index, e.currentTarget.textContent || '')}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          dangerouslySetInnerHTML={{ __html: element }}
        />
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteElement(index)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <FiTrash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete element</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  // Render modern query item
  const renderQueryItem = (query: string, index: number) => (
    <div
      key={index}
      className="group relative rounded border bg-card p-2 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
          Q{index + 1}
        </span>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditedQueries(
                      editedQueries.filter((_, i) => i !== index)
                    )
                  }
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <FiTrash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete query</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        className="text-sm leading-relaxed outline-none focus:bg-accent/20 rounded px-1 py-0.5 transition-colors min-h-[100px]"
        onBlur={e => {
          const newQueries = [...editedQueries];
          newQueries[index] = e.currentTarget.textContent || '';
          setEditedQueries(newQueries);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        dangerouslySetInnerHTML={{ __html: query }}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <FiList className="h-4 w-4" />
              Edit Parsed Claim Data
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 min-h-[650px]">
            {/* Elements Section */}
            <div className="border-r bg-slate-50/50 dark:bg-slate-900/20">
              <div className="p-4">
                {/* Elements Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiList className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Parsed Elements</h3>
                    <Badge variant="secondary" className="text-xs">
                      {editedElements.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddingElement(true)}
                    variant="outline"
                    className="h-7 text-xs"
                  >
                    <FiPlus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                <ScrollArea className="h-[570px] pr-2">
                  <div className="space-y-2">
                    {editedElements.map((element, index) =>
                      renderElementItem(element, index)
                    )}

                    {/* Add Element Form */}
                    {isAddingElement && (
                      <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-900/20">
                        <CardContent className="p-3">
                          <div className="space-y-3">
                            <Input
                              placeholder="Enter element text"
                              value={newElementText}
                              onChange={e => setNewElementText(e.target.value)}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleAddElement();
                                } else if (e.key === 'Escape') {
                                  setIsAddingElement(false);
                                  setNewElementText('');
                                }
                              }}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsAddingElement(false);
                                  setNewElementText('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleAddElement}
                                disabled={!newElementText.trim()}
                              >
                                Add Element
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Queries Section */}
            <div>
              <div className="p-4">
                {/* Queries Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiSearch className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-medium text-sm">Search Queries</h3>
                    <Badge variant="secondary" className="text-xs">
                      {editedQueries.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setEditedQueries([...editedQueries, ''])}
                    variant="outline"
                    className="h-7 text-xs"
                  >
                    <FiPlus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                <ScrollArea className="h-[570px] pr-2">
                  <div className="space-y-1">
                    {editedQueries.map((query, index) =>
                      renderQueryItem(query, index)
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3 border-t bg-muted/20">
            <div className="flex items-center justify-between w-full">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isSaving}
                size="sm"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                    disabled={isSaving}
                  >
                    <FiRefreshCw className="h-4 w-4 mr-2" />
                    Resync
                    <FiChevronDown className="h-4 w-4 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem
                      onClick={handleResync}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium">Full Resync</span>
                        <span className="text-xs text-muted-foreground">
                          Regenerate both elements & queries
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {onResyncElementsOnly && (
                      <DropdownMenuItem
                        onClick={handleResyncElementsOnly}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium">Elements Only</span>
                          <span className="text-xs text-muted-foreground">
                            Re-parse claim, keep queries
                          </span>
                        </div>
                      </DropdownMenuItem>
                    )}
                    {onResyncQueriesOnly && (
                      <DropdownMenuItem
                        onClick={handleResyncQueriesOnly}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium">Queries Only</span>
                          <span className="text-xs text-muted-foreground">
                            Regenerate from elements
                          </span>
                        </div>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
