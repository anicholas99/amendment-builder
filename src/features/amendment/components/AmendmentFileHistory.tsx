/**
 * Amendment File History - File timeline component for AmendmentStudio
 * 
 * Shows chronological file history with version tracking, download links,
 * and legal audit trail for amendment projects
 */

import React, { useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Eye, 
  Upload,
  Clock,
  User,
  Tag,
  FileCheck,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  History,
  ExternalLink,
  Copy,
  Archive,
  Send,
  Filter,
  Search,
  MoreHorizontal,
  Calendar
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToastWrapper';
import type { 
  AmendmentProjectFile, 
  AmendmentFileType, 
  AmendmentFileStatus 
} from '@/types/amendment';

interface AmendmentFileHistoryProps {
  amendmentProjectId: string;
  files: AmendmentProjectFile[];
  isLoading?: boolean;
  onDownload?: (file: AmendmentProjectFile) => void;
  onPreview?: (file: AmendmentProjectFile) => void;
  onDelete?: (file: AmendmentProjectFile) => void;
  className?: string;
}

// File type configuration
const FILE_TYPE_CONFIG = {
  office_action: {
    label: 'Office Action',
    icon: FileText,
    color: 'bg-red-100 text-red-700 border-red-200',
    description: 'USPTO Office Action document',
  },
  draft_response: {
    label: 'Draft Response',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Draft amendment response',
  },
  filed_response: {
    label: 'Filed Response',
    icon: Send,
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Final filed response',
  },
  prior_art: {
    label: 'Prior Art',
    icon: ExternalLink,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Prior art reference document',
  },
  reference_doc: {
    label: 'Reference Doc',
    icon: FileText,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    description: 'Supporting reference document',
  },
  export_version: {
    label: 'Export Version',
    icon: Download,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    description: 'Exported document version',
  },
  amended_claims: {
    label: 'Amended Claims',
    icon: FileCheck,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    description: 'Amended claims document',
  },
  argument_section: {
    label: 'Argument Section',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    description: 'Legal argument section',
  },
  final_package: {
    label: 'Final Package',
    icon: Archive,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Complete filing package',
  },
} as const;

// Status configuration
const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: FileCheck,
  },
  SUPERSEDED: {
    label: 'Superseded',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: History,
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Archive,
  },
  FILED: {
    label: 'Filed',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Send,
  },
  EXPORTED: {
    label: 'Exported',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Download,
  },
  DRAFT: {
    label: 'Draft',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: FileText,
  },
} as const;

export const AmendmentFileHistory: React.FC<AmendmentFileHistoryProps> = ({
  amendmentProjectId,
  files,
  isLoading = false,
  onDownload,
  onPreview,
  onDelete,
  className,
}) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'date' | 'type' | 'version'>('date');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today']));

  // Filter and group files
  const filteredAndGroupedFiles = useMemo(() => {
    // Filter files
    let filteredFiles = files.filter(file => {
      const matchesSearch = !searchTerm || 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || file.fileType === filterType;
      const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort by creation date (newest first)
    filteredFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Group files
    const groups: Record<string, AmendmentProjectFile[]> = {};

    filteredFiles.forEach(file => {
      let groupKey: string;

      if (groupBy === 'date') {
        const fileDate = new Date(file.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (fileDate.toDateString() === today.toDateString()) {
          groupKey = 'today';
        } else if (fileDate.toDateString() === yesterday.toDateString()) {
          groupKey = 'yesterday';
        } else {
          groupKey = format(fileDate, 'yyyy-MM-dd');
        }
      } else if (groupBy === 'type') {
        groupKey = file.fileType;
      } else {
        // Group by version chains
        groupKey = file.parentFileId || file.id;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    return groups;
  }, [files, searchTerm, filterType, filterStatus, groupBy]);

  // Handle group expansion
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Handle file actions
  const handleDownload = (file: AmendmentProjectFile) => {
    onDownload?.(file);
    toast.success({
      title: 'Download Started',
      description: `Downloading ${file.fileName}`,
    });
  };

  const handlePreview = (file: AmendmentProjectFile) => {
    onPreview?.(file);
  };

  const handleCopyLink = (file: AmendmentProjectFile) => {
    if (file.storageUrl) {
      navigator.clipboard.writeText(file.storageUrl);
      toast.success({
        title: 'Link Copied',
        description: 'File link copied to clipboard',
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get group title
  const getGroupTitle = (groupKey: string) => {
    if (groupBy === 'date') {
      if (groupKey === 'today') return 'Today';
      if (groupKey === 'yesterday') return 'Yesterday';
      return format(new Date(groupKey), 'MMMM d, yyyy');
    } else if (groupBy === 'type') {
      return FILE_TYPE_CONFIG[groupKey as AmendmentFileType]?.label || groupKey;
    } else {
      return 'Version Chain';
    }
  };

  // Render file item
  const renderFileItem = (file: AmendmentProjectFile) => {
    const typeConfig = FILE_TYPE_CONFIG[file.fileType as AmendmentFileType];
    const statusConfig = STATUS_CONFIG[file.status as AmendmentFileStatus];
    const IconComponent = typeConfig?.icon || FileText;

    return (
      <div
        key={file.id}
        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
      >
        {/* File icon and type */}
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          typeConfig?.color || 'bg-gray-100 text-gray-700'
        )}>
          <IconComponent className="h-5 w-5" />
        </div>

        {/* File details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {file.fileName}
              </h3>
              {file.originalName !== file.fileName && (
                <p className="text-sm text-gray-500 truncate">
                  Original: {file.originalName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              {/* Version badge */}
              {file.version > 1 && (
                <Badge variant="outline" className="text-xs">
                  v{file.version}
                </Badge>
              )}

              {/* Status badge */}
              <Badge 
                variant="outline" 
                className={cn('text-xs', statusConfig?.color)}
              >
                {statusConfig?.label || file.status}
              </Badge>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onPreview && (
                    <DropdownMenuItem onClick={() => handlePreview(file)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                  )}
                  {onDownload && (
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleCopyLink(file)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  {onDelete && file.status !== 'FILED' && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(file)}
                      className="text-red-600"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* File metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Uploaded by User
            </span>
            {file.sizeBytes && (
              <span>{formatFileSize(file.sizeBytes)}</span>
            )}
          </div>

          {/* Description */}
          {file.description && (
            <p className="text-sm text-gray-600 mb-2">
              {file.description}
            </p>
          )}

          {/* Tags */}
          {file.tags && (
            <div className="flex items-center gap-1 flex-wrap">
              {JSON.parse(file.tags).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Special indicators */}
          <div className="flex items-center gap-2 mt-2">
            {file.filedAt && (
              <Badge className="text-xs bg-green-600 text-white">
                <Send className="h-3 w-3 mr-1" />
                Filed {format(new Date(file.filedAt), 'MMM d, yyyy')}
              </Badge>
            )}
            {file.exportedAt && (
              <Badge variant="outline" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Exported {format(new Date(file.exportedAt), 'MMM d, yyyy')}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render filters
  const renderFilters = () => (
    <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
      <div className="flex-1">
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="File type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => (
            <SelectItem key={type} value={type}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <SelectItem key={status} value={status}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">By Date</SelectItem>
          <SelectItem value="type">By Type</SelectItem>
          <SelectItem value="version">By Version</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            File History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading file history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            File History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files yet
            </h3>
            <p className="text-gray-600">
              Files will appear here as you work on your amendment response
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          File History
          <Badge variant="secondary" className="ml-auto">
            {files.length} files
          </Badge>
        </CardTitle>
      </CardHeader>

      {renderFilters()}

      <ScrollArea className="h-[600px]">
        <div className="p-4 space-y-4">
          {Object.entries(filteredAndGroupedFiles).map(([groupKey, groupFiles]) => (
            <Collapsible
              key={groupKey}
              open={expandedGroups.has(groupKey)}
              onOpenChange={() => toggleGroup(groupKey)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto text-left"
                >
                  <div className="flex items-center gap-2">
                    {expandedGroups.has(groupKey) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{getGroupTitle(groupKey)}</span>
                    <Badge variant="outline" className="ml-2">
                      {groupFiles.length}
                    </Badge>
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-3 mt-2">
                {groupFiles.map(renderFileItem)}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}; 