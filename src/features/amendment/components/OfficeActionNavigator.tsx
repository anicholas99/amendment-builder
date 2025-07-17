/**
 * Office Action Navigator - Left panel component for AmendmentStudio
 * 
 * Displays parsed rejections, prior art references, affected claims, and examiner info
 * Clean, organized interface for navigating through Office Action content
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Scale, 
  BookOpen,
  User,
  Calendar,
  Hash,
  ChevronDown,
  ChevronRight,
  Eye,
  Target,
  Filter,
  Search
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';

// Types
interface Rejection {
  id: string;
  type: '§102' | '§103' | '§101' | '§112' | 'OTHER';
  claims: string[];
  priorArtReferences: string[];
  examinerReasoning: string;
  rawText: string;
}

interface OfficeActionData {
  id: string;
  fileName?: string;
  metadata?: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
    artUnit?: string;
  };
  rejections: Rejection[];
  allPriorArtReferences: string[];
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
  };
}

interface OfficeActionNavigatorProps {
  officeAction?: OfficeActionData;
  selectedRejectionId?: string | null;
  onRejectionSelect?: (rejectionId: string) => void;
  onPriorArtSelect?: (reference: string) => void;
  className?: string;
}

// Rejection type configuration
const REJECTION_TYPE_CONFIG = {
  '§102': {
    label: 'Anticipation',
    description: '35 U.S.C. § 102',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Target,
  },
  '§103': {
    label: 'Obviousness',
    description: '35 U.S.C. § 103',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: Scale,
  },
  '§101': {
    label: 'Subject Matter',
    description: '35 U.S.C. § 101',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: BookOpen,
  },
  '§112': {
    label: 'Written Description',
    description: '35 U.S.C. § 112',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FileText,
  },
  'OTHER': {
    label: 'Other',
    description: 'Other rejection type',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: AlertTriangle,
  },
} as const;

export const OfficeActionNavigator: React.FC<OfficeActionNavigatorProps> = ({
  officeAction,
  selectedRejectionId,
  onRejectionSelect,
  onPriorArtSelect,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionTypeFilter, setRejectionTypeFilter] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    rejections: true,
    priorArt: false,
  });

  // Filter rejections
  const filteredRejections = useMemo(() => {
    if (!officeAction?.rejections) return [];
    
    return officeAction.rejections.filter(rejection => {
      const matchesSearch = 
        rejection.examinerReasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rejection.claims.some(claim => claim.includes(searchTerm)) ||
        rejection.priorArtReferences.some(ref => ref.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = rejectionTypeFilter === 'all' || rejection.type === rejectionTypeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [officeAction?.rejections, searchTerm, rejectionTypeFilter]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render overview section
  const renderOverview = () => {
    if (!officeAction) return null;

    return (
      <Collapsible 
        open={expandedSections.overview} 
        onOpenChange={() => toggleSection('overview')}
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto font-medium"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Office Action Overview
            </div>
            {expandedSections.overview ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-3">
              {/* Document info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{officeAction.fileName || 'Office Action Document'}</span>
                </div>

                {officeAction.metadata?.applicationNumber && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span>App. No.: {officeAction.metadata.applicationNumber}</span>
                  </div>
                )}

                {officeAction.metadata?.examinerName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Examiner: {officeAction.metadata.examinerName}</span>
                  </div>
                )}

                {officeAction.metadata?.mailingDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Mailed: {new Date(officeAction.metadata.mailingDate).toLocaleDateString()}</span>
                  </div>
                )}

                {officeAction.metadata?.artUnit && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span>Art Unit: {officeAction.metadata.artUnit}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-bold text-lg text-red-600">{officeAction.summary.totalRejections}</div>
                  <div className="text-gray-600">Rejections</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-bold text-lg text-blue-600">{officeAction.summary.totalClaimsRejected}</div>
                  <div className="text-gray-600">Claims</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-bold text-lg text-green-600">{officeAction.summary.uniquePriorArtCount}</div>
                  <div className="text-gray-600">Prior Art</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-bold text-lg text-purple-600">{officeAction.summary.rejectionTypes.length}</div>
                  <div className="text-gray-600">Types</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Render rejection item
  const renderRejection = (rejection: Rejection) => {
    const config = REJECTION_TYPE_CONFIG[rejection.type];
    const isSelected = selectedRejectionId === rejection.id;
    
    return (
      <Card 
        key={rejection.id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-blue-500 bg-blue-50"
        )}
        onClick={() => onRejectionSelect?.(rejection.id)}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <config.icon className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={config.color}>
                  {config.label}
                </Badge>
                <span className="text-xs text-gray-500">{config.description}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Claims: {rejection.claims.join(', ')}</span>
                <span>•</span>
                <span>{rejection.priorArtReferences.length} References</span>
              </div>
            </div>
            
            {isSelected && (
              <Eye className="h-4 w-4 text-blue-600" />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-gray-700 line-clamp-3">
            {rejection.examinerReasoning}
          </p>
          
          {rejection.priorArtReferences.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {rejection.priorArtReferences.slice(0, 3).map((ref, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPriorArtSelect?.(ref);
                  }}
                >
                  {ref}
                </Button>
              ))}
              {rejection.priorArtReferences.length > 3 && (
                <span className="text-xs text-gray-500 self-center">
                  +{rejection.priorArtReferences.length - 3} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render rejections section
  const renderRejections = () => {
    return (
      <Collapsible 
        open={expandedSections.rejections} 
        onOpenChange={() => toggleSection('rejections')}
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto font-medium"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Rejections ({filteredRejections.length})
            </div>
            {expandedSections.rejections ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          {/* Search and filter */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rejections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <Select value={rejectionTypeFilter} onValueChange={setRejectionTypeFilter}>
              <SelectTrigger className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="§102">§ 102 - Anticipation</SelectItem>
                <SelectItem value="§103">§ 103 - Obviousness</SelectItem>
                <SelectItem value="§101">§ 101 - Subject Matter</SelectItem>
                <SelectItem value="§112">§ 112 - Written Description</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rejections list */}
          <div className="space-y-3">
            {filteredRejections.length === 0 ? (
              <div className="text-center p-4 text-gray-500 text-sm">
                {searchTerm || rejectionTypeFilter !== 'all' ? 'No rejections match your filters' : 'No rejections found'}
              </div>
            ) : (
              filteredRejections.map(renderRejection)
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Render prior art section
  const renderPriorArt = () => {
    if (!officeAction?.allPriorArtReferences?.length) return null;

    return (
      <Collapsible 
        open={expandedSections.priorArt} 
        onOpenChange={() => toggleSection('priorArt')}
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto font-medium"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Prior Art ({officeAction.allPriorArtReferences.length})
            </div>
            {expandedSections.priorArt ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-2">
            {officeAction.allPriorArtReferences.map((reference, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => onPriorArtSelect?.(reference)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-mono text-sm">{reference}</span>
                </div>
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Empty state
  if (!officeAction) {
    return (
      <div className={cn("p-6 text-center text-gray-500", className)}>
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-medium mb-2">No Office Action Selected</h3>
        <p className="text-sm">Upload an Office Action to view its contents</p>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {renderOverview()}
          <Separator className="my-4" />
          {renderRejections()}
          <Separator className="my-4" />
          {renderPriorArt()}
        </div>
      </ScrollArea>
    </div>
  );
}; 