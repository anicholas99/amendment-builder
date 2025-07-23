import React, { useState, useCallback, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Scale,
  Lightbulb,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDraftDocumentByType, useUpdateDraftDocument } from '@/hooks/api/useDraftDocuments';
import { useOfficeAction } from '@/hooks/api/useAmendment';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import type { ArgumentSection, ParsedRejection, OfficeAction } from '@/types/domain/amendment';

interface ArgumentsTabProps {
  projectId: string;
  officeActionId: string;
}

interface EnhancedArgumentSection {
  id: string;
  rejectionId?: string;
  title: string;
  content: string;
  type: 'MAIN_ARGUMENT' | 'TECHNICAL_ARGUMENT' | 'LEGAL_ARGUMENT' | 'RESPONSE_TO_REJECTION';
  priorArtReferences?: string[];
}

interface ArgumentDraft {
  arguments: EnhancedArgumentSection[];
  lastSaved?: Date;
}

const ARGUMENT_TYPES = [
  { value: 'MAIN_ARGUMENT', label: 'Main Argument', icon: FileText },
  { value: 'TECHNICAL_ARGUMENT', label: 'Technical Argument', icon: Target },
  { value: 'LEGAL_ARGUMENT', label: 'Legal Argument', icon: Scale },
  { value: 'RESPONSE_TO_REJECTION', label: 'Response to Rejection', icon: MessageSquare },
] as const;

const getRejectionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    '§103': '§103 - Obviousness',
    '§102': '§102 - Anticipation',
    '§101': '§101 - Subject Matter',
    '§112': '§112 - Written Description',
    'OTHER': 'Other Rejection',
  };
  return labels[type] || type;
};

export function ArgumentsTab({ projectId, officeActionId }: ArgumentsTabProps) {
  const [argumentSections, setArgumentSections] = useState<EnhancedArgumentSection[]>([]);
  const [selectedArgumentId, setSelectedArgumentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Fetch office action for rejections
  const { data: officeAction } = useOfficeAction(officeActionId);

  // Use draft document for persistence
  const { data: draftDocument, isLoading: isLoadingDraft } = useDraftDocumentByType(projectId, 'ARGUMENTS');
  const updateDraftMutation = useUpdateDraftDocument();

  // Load arguments from draft
  useEffect(() => {
    if (draftDocument?.content) {
      try {
        const draft = JSON.parse(draftDocument.content) as ArgumentDraft;
        setArgumentSections(draft.arguments || []);
        setLastSaveTime(draft.lastSaved ? new Date(draft.lastSaved) : null);
        logger.debug('[ArgumentsTab] Loaded arguments from draft', { 
          count: draft.arguments?.length || 0 
        });
      } catch (error) {
        logger.error('[ArgumentsTab] Failed to parse draft content', error);
      }
    }
  }, [draftDocument]);

  // Initialize default arguments for each rejection
  useEffect(() => {
    if (officeAction?.rejections && argumentSections.length === 0) {
      const defaultArguments = officeAction.rejections.map((rejection: ParsedRejection) => ({
        id: `arg-${rejection.id}`,
        title: `Response to ${getRejectionTypeLabel(rejection.type)}`,
        content: '',
        type: 'RESPONSE_TO_REJECTION' as const,
        rejectionId: rejection.id,
      }));
      setArgumentSections(defaultArguments);
    }
  }, [officeAction?.rejections, argumentSections.length]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const draft: ArgumentDraft = {
        arguments: argumentSections,
        lastSaved: new Date(),
      };
      
      await updateDraftMutation.mutateAsync({
        projectId,
        type: 'ARGUMENTS',
        content: JSON.stringify(draft)
      });
      setLastSaveTime(new Date());
      logger.info('[ArgumentsTab] Saved arguments', { count: argumentSections.length });
    } catch (error) {
      logger.error('[ArgumentsTab] Failed to save arguments', error);
    } finally {
      setIsSaving(false);
    }
  }, [argumentSections, updateDraftMutation, projectId]);

  const handleArgumentChange = useCallback((id: string, field: keyof EnhancedArgumentSection, value: any) => {
    setArgumentSections(prev => prev.map(arg => 
      arg.id === id ? { ...arg, [field]: value } : arg
    ));
  }, []);

  const handleAddArgument = useCallback(() => {
    const newArgument: EnhancedArgumentSection = {
      id: `arg-${Date.now()}`,
      title: 'New Argument',
      content: '',
      type: 'MAIN_ARGUMENT',
    };
    setArgumentSections(prev => [...prev, newArgument]);
    setSelectedArgumentId(newArgument.id);
  }, []);

  const handleDeleteArgument = useCallback((id: string) => {
    setArgumentSections(prev => prev.filter(arg => arg.id !== id));
    if (selectedArgumentId === id) {
      setSelectedArgumentId(null);
    }
  }, [selectedArgumentId]);

  const selectedArgument = argumentSections.find(arg => arg.id === selectedArgumentId);

  if (isLoadingDraft) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar - Arguments list */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Arguments</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddArgument}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{argumentSections.length} argument{argumentSections.length !== 1 ? 's' : ''}</span>
            {lastSaveTime && (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Saved {lastSaveTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {argumentSections.map((argument) => (
              <Card
                key={argument.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedArgumentId === argument.id 
                    ? "bg-blue-50 border-blue-200" 
                    : "hover:bg-gray-50"
                )}
                onClick={() => setSelectedArgumentId(argument.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{argument.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {ARGUMENT_TYPES.find(t => t.value === argument.type)?.label}
                        </Badge>
                        {argument.rejectionId && (
                          <span className="text-xs text-gray-500">
                            {getRejectionTypeLabel(
                              officeAction?.rejections?.find(r => r.id === argument.rejectionId)?.type || ''
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {argument.content && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {argument.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Save button */}
        <div className="p-4 border-t bg-white">
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Arguments
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right panel - Argument editor */}
      <div className="flex-1 flex flex-col">
        {selectedArgument ? (
          <>
            <div className="p-6 border-b">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Argument Title
                  </label>
                  <input
                    type="text"
                    value={selectedArgument.title}
                    onChange={(e) => handleArgumentChange(selectedArgument.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Argument Type
                    </label>
                    <Select
                      value={selectedArgument.type}
                      onValueChange={(value) => handleArgumentChange(selectedArgument.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ARGUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedArgument.type === 'RESPONSE_TO_REJECTION' && (
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Responding to
                      </label>
                      <Select
                        value={selectedArgument.rejectionId || ''}
                        onValueChange={(value) => handleArgumentChange(selectedArgument.id, 'rejectionId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rejection" />
                        </SelectTrigger>
                        <SelectContent>
                          {officeAction?.rejections?.map((rejection) => (
                            <SelectItem key={rejection.id} value={rejection.id}>
                              {getRejectionTypeLabel(rejection.type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Argument Content
              </label>
              <Textarea
                value={selectedArgument.content}
                onChange={(e) => handleArgumentChange(selectedArgument.id, 'content', e.target.value)}
                placeholder="Enter your argument here..."
                className="w-full h-full min-h-[400px] resize-none"
              />
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteArgument(selectedArgument.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete Argument
              </Button>
              <div className="text-sm text-gray-500">
                {selectedArgument.content.length} characters
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium mb-2">No Argument Selected</h3>
              <p className="text-sm mb-4">Select an argument from the list or create a new one</p>
              <Button onClick={handleAddArgument}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Argument
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}