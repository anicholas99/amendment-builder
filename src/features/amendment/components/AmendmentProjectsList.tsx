/**
 * Amendment Projects List - Main list view for amendment projects
 * 
 * Shows all amendment responses for a project with status, due dates, and actions
 * Clean card-based design with modern interactions
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  Calendar,
  Clock,
  Upload,
  Plus,
  Filter,
  Search,
  Eye,
  Download,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Send
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { LoadingState } from '@/components/common/LoadingState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { OfficeActionUpload } from '@/features/office-actions/components/OfficeActionUpload';
import { useOfficeActions } from '@/hooks/api/useAmendment';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/config/featureFlags';

// Types
interface AmendmentProject {
  id: string;
  name: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'READY_TO_FILE' | 'FILED';
  dueDate?: Date;
  filedDate?: Date;
  responseType?: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
  createdAt: Date;
  updatedAt: Date;
  officeAction: {
    id: string;
    originalFileName?: string;
    rejectionCount?: number;
  };
}

interface AmendmentProjectsListProps {
  projectId: string;
}

// Status configuration
const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    icon: FileText,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    variant: 'secondary' as const,
  },
  IN_REVIEW: {
    label: 'In Review',
    icon: Eye,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    variant: 'default' as const,
  },
  READY_TO_FILE: {
    label: 'Ready to File',
    icon: FileCheck,
    color: 'bg-green-100 text-green-700 border-green-200',
    variant: 'default' as const,
  },
  FILED: {
    label: 'Filed',
    icon: Send,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    variant: 'default' as const,
  },
} as const;

const RESPONSE_TYPE_CONFIG = {
  AMENDMENT: { label: 'Amendment', color: 'bg-blue-50 text-blue-600' },
  CONTINUATION: { label: 'Continuation', color: 'bg-green-50 text-green-600' },
  RCE: { label: 'RCE', color: 'bg-orange-50 text-orange-600' },
} as const;

export const AmendmentProjectsList: React.FC<AmendmentProjectsListProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch office actions (amendment projects will be derived from these)
  const {
    data: officeActions = [],
    isLoading,
    error,
    refetch,
  } = useOfficeActions(projectId);

  // Create amendment projects from office actions with real status
  const amendmentProjects: AmendmentProject[] = useMemo(() => {
    // Debug logging
    logger.info('[AmendmentProjectsList] Office Actions received', {
      count: officeActions.length,
      officeActions: officeActions.map(oa => ({
        id: oa.id,
        status: oa.status,
        dateIssued: oa.dateIssued,
        fileName: oa.fileName,
      }))
    });
    
    // Apply filtering based on feature flag
    let filteredOAs = officeActions;
    
    if (isFeatureEnabled('ENABLE_OA_SIX_MONTH_FILTER')) {
      // Legacy 6-month filter
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      filteredOAs = officeActions.filter(oa => {
        const oaDate = oa.dateIssued || oa.createdAt;
        return new Date(oaDate) > sixMonthsAgo;
      });
    } else {
      // Timeline-aware filtering - only show OAs that need a response
      // Also filter out old OAs as a safety check
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      filteredOAs = officeActions.filter(oa => {
        // Must be PENDING_RESPONSE status
        if (oa.status !== 'PENDING_RESPONSE') return false;
        
        // Safety check: Also ensure it's not older than 90 days past deadline
        const oaDate = oa.dateIssued || oa.createdAt;
        const deadline = new Date(oaDate);
        deadline.setDate(deadline.getDate() + 90);
        
        // If deadline is more than 90 days ago, skip it
        if (deadline < ninetyDaysAgo) return false;
        
        return true;
      });
    }
    
    return filteredOAs.map((oa) => {
      // Determine status based on office action status and time since upload
      let status: AmendmentProject['status'] = 'DRAFT';
      const daysSinceUpload = Math.floor(
        (Date.now() - new Date(oa.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // More realistic status assignment based on office action status
      if (oa.status === 'UPLOADED') {
        status = 'DRAFT';
      } else if (oa.status === 'PARSED' && daysSinceUpload < 30) {
        status = 'DRAFT';
      } else if (oa.status === 'PARSED' && daysSinceUpload >= 30) {
        status = 'IN_REVIEW';
      } else if (oa.status === 'COMPLETED') {
        status = 'READY_TO_FILE';
      }

      // Calculate response deadline (typically 3 months from office action date)
      const dueDate = oa.dateIssued 
        ? new Date(oa.dateIssued.getTime() + (90 * 24 * 60 * 60 * 1000))
        : new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));

      // Default response type based on rejection count
      let responseType: AmendmentProject['responseType'] = 'AMENDMENT';
      if (oa.rejections && oa.rejections.length === 0) {
        responseType = 'RCE'; // Request for Continued Examination if no rejections
      }

      return {
        id: `amendment-${oa.id}`,
        name: `Response to ${oa.fileName || 'Office Action'} - ${new Date().getFullYear()}`,
        status,
        dueDate,
        responseType,
        createdAt: oa.createdAt,
        updatedAt: oa.updatedAt,
        officeAction: {
          id: oa.id,
          originalFileName: oa.fileName,
          rejectionCount: oa.rejections?.length || 0,
        },
      };
    });
  }, [officeActions]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return amendmentProjects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [amendmentProjects, searchTerm, statusFilter]);

  // Calculate urgent projects (due within 30 days)
  const urgentProjects = useMemo(() => {
    const thirtyDaysFromNow = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
    return amendmentProjects.filter(p => 
      p.dueDate && p.dueDate <= thirtyDaysFromNow && p.status !== 'FILED'
    );
  }, [amendmentProjects]);

  // Handlers
  const handleCreateNew = () => {
    setShowUploadModal(true);
  };

  const handleProjectClick = (amendmentId: string) => {
    // Extract office action ID from amendment ID (remove amendment- prefix)
    const officeActionId = amendmentId.replace(/^amendment-/, '');
    router.push(`/projects/${projectId}/amendments/studio?amendmentId=${officeActionId}`);
  };

  const handleUploadComplete = (officeAction: any) => {
    setShowUploadModal(false);
    refetch(); // Refresh the list
    
    // Navigate to new amendment studio using office action ID directly
    router.push(`/projects/${projectId}/amendments/studio?amendmentId=${officeAction.id}`);
  };

  // Get days until due
  const getDaysUntilDue = (dueDate?: Date) => {
    if (!dueDate) return null;
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Render header
  const renderHeader = () => (
    <div className="p-6 border-b bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Amendment Responses</h1>
          <p className="text-gray-600 mt-1">
            Manage Office Action responses and amendment strategies
          </p>
        </div>
        
        <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Response
        </Button>
      </div>

      {/* Stats & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{amendmentProjects.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">{urgentProjects.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Filed</p>
                <p className="text-2xl font-bold text-green-600">
                  {amendmentProjects.filter(p => p.status === 'FILED').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search amendment responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="IN_REVIEW">In Review</SelectItem>
            <SelectItem value="READY_TO_FILE">Ready to File</SelectItem>
            <SelectItem value="FILED">Filed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Render project card
  const renderProjectCard = (project: AmendmentProject) => {
    const statusConfig = STATUS_CONFIG[project.status];
    const responseTypeConfig = project.responseType ? RESPONSE_TYPE_CONFIG[project.responseType] : null;
    const daysUntilDue = getDaysUntilDue(project.dueDate);
    const isUrgent = daysUntilDue !== null && daysUntilDue <= 30 && project.status !== 'FILED';

    return (
      <Card 
        key={project.id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1",
          isUrgent && "ring-2 ring-orange-200 bg-orange-50/30"
        )}
        onClick={() => handleProjectClick(project.id)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
              
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant={statusConfig.variant} className={statusConfig.color}>
                  <statusConfig.icon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                
                {responseTypeConfig && (
                  <Badge variant="outline" className={responseTypeConfig.color}>
                    {responseTypeConfig.label}
                  </Badge>
                )}

                {project.officeAction.rejectionCount && (
                  <Badge variant="outline" className="bg-red-50 text-red-600">
                    {project.officeAction.rejectionCount} Rejection{project.officeAction.rejectionCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Office Action: {project.officeAction.originalFileName || 'Uploaded file'}</span>
                </div>
                
                {project.dueDate && (
                  <div className={cn(
                    "flex items-center gap-2",
                    isUrgent && "text-orange-600 font-medium"
                  )}>
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due {formatDistanceToNow(project.dueDate, { addSuffix: true })}
                      {isUrgent && <AlertCircle className="h-4 w-4 ml-1 inline" />}
                    </span>
                  </div>
                )}

                {project.filedDate && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Send className="h-4 w-4" />
                    <span>Filed {formatDistanceToNow(project.filedDate, { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleProjectClick(project.id);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Open Studio
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Response
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
    );
  };

  // Render main content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6">
          <LoadingState message="Loading amendment responses..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading responses</h3>
          <p className="text-gray-600 mb-4">Failed to load amendment responses</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    if (amendmentProjects.length === 0) {
      return (
        <div className="p-12 text-center">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No amendment responses yet</h3>
          <p className="text-gray-600 mb-6">
            Upload an Office Action to start creating your first amendment response
          </p>
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create First Response
          </Button>
        </div>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <div className="p-12 text-center">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No responses found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} variant="outline">
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map(renderProjectCard)}
        </div>
      </div>
    );
  };

  return (
    <>
      <SimpleMainPanel
        header={renderHeader()}
        contentPadding={false}
      >
        {renderContent()}
      </SimpleMainPanel>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Upload Office Action</h2>
                  <p className="text-gray-600 mt-1">
                    Upload an Office Action document to create a new amendment response
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUploadModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <OfficeActionUpload
                projectId={projectId}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 