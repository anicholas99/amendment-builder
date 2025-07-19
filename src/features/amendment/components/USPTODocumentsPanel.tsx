/**
 * USPTO Documents Panel
 * 
 * Displays USPTO prosecution history documents within a project context
 * Allows filtering, downloading, and viewing of official documents
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Filter,
  AlertCircle,
  FileSearch,
  MessageSquare,
  BookOpen,
  Info,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useProjectUSPTODocuments } from '@/hooks/api/useEnhancedProsecution';
import { useDownloadUSPTODocument } from '@/hooks/api/useUSPTO';
import { ProsecutionDocument } from '@/client/services/uspto.client-service';

interface USPTODocumentsPanelProps {
  projectId: string;
  applicationNumber?: string | null;
  className?: string;
  onDocumentClick?: (document: ProsecutionDocument) => void;
}

const CATEGORY_CONFIG = {
  'office-action': {
    icon: AlertCircle,
    label: 'Office Actions',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  'response': {
    icon: MessageSquare,
    label: 'Responses',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  'claims': {
    icon: BookOpen,
    label: 'Claims',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  'citations': {
    icon: FileSearch,
    label: 'Citations',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  'examiner-notes': {
    icon: Info,
    label: 'Examiner Notes',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
  },
} as const;

export const USPTODocumentsPanel: React.FC<USPTODocumentsPanelProps> = ({
  projectId,
  applicationNumber,
  className,
  onDocumentClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCoreOnly, setShowCoreOnly] = useState(false);
  
  const { data: documents = [], isLoading } = useProjectUSPTODocuments(
    projectId,
    applicationNumber,
    {
      coreOnly: showCoreOnly,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    }
  );
  
  const downloadMutation = useDownloadUSPTODocument();

  if (!applicationNumber) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-8', className)}>
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No application number available</p>
          <p className="text-xs mt-1">USPTO documents require a valid application number</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, ProsecutionDocument[]>);

  const handleDownload = async (document: ProsecutionDocument) => {
    downloadMutation.mutate(document);
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">USPTO Documents</h3>
            <p className="text-sm text-gray-500 mt-1">
              {documents.length} documents from USPTO
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showCoreOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowCoreOnly(!showCoreOnly)}
            >
              <Filter className="h-3 w-3 mr-1" />
              Core Only
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {selectedCategory === 'all' ? 'All Categories' : CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG]?.label || selectedCategory}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                  All Categories
                </DropdownMenuItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <DropdownMenuItem key={key} onClick={() => setSelectedCategory(key)}>
                    <config.icon className={cn('h-4 w-4 mr-2', config.color)} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4">
        {selectedCategory === 'all' ? (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              {Object.entries(CATEGORY_CONFIG).slice(0, 5).map(([key, config]) => (
                <TabsTrigger key={key} value={key}>
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="space-y-2">
              <DocumentList 
                documents={documents} 
                onDocumentClick={onDocumentClick}
                onDownload={handleDownload}
              />
            </TabsContent>
            
            {Object.entries(documentsByCategory).map(([category, categoryDocs]) => (
              <TabsContent key={category} value={category} className="space-y-2">
                <DocumentList 
                  documents={categoryDocs} 
                  onDocumentClick={onDocumentClick}
                  onDownload={handleDownload}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <DocumentList 
            documents={documents} 
            onDocumentClick={onDocumentClick}
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  );
};

// Document list component
const DocumentList: React.FC<{
  documents: ProsecutionDocument[];
  onDocumentClick?: (document: ProsecutionDocument) => void;
  onDownload: (document: ProsecutionDocument) => void;
}> = ({ documents, onDocumentClick, onDownload }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No documents found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const categoryConfig = CATEGORY_CONFIG[doc.category as keyof typeof CATEGORY_CONFIG];
        const Icon = categoryConfig?.icon || FileText;
        
        return (
          <Card
            key={doc.documentId}
            className={cn(
              'cursor-pointer hover:shadow-sm transition-shadow',
              onDocumentClick && 'hover:bg-gray-50'
            )}
            onClick={() => onDocumentClick?.(doc)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    'p-2 rounded-lg',
                    categoryConfig?.bgColor || 'bg-gray-50'
                  )}>
                    <Icon className={cn(
                      'h-4 w-4',
                      categoryConfig?.color || 'text-gray-700'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{doc.description}</span>
                      <Badge variant={doc.importance === 'core' ? 'default' : 'secondary'} className="text-xs">
                        {doc.importance}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{doc.documentCode}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {doc.mailDate ? format(new Date(doc.mailDate), 'MMM dd, yyyy') : 'No date'}
                      {doc.pageCount && ` • ${doc.pageCount} pages`}
                    </div>
                    {doc.purpose && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        {doc.purpose}
                      </p>
                    )}
                  </div>
                </div>
                {doc.isDownloadable && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(doc);
                    }}
                    disabled={!doc.downloadOptionBag || doc.downloadOptionBag.length === 0}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};