/**
 * Enhanced Amendment Projects List - Attorney-focused prosecution dashboard
 * 
 * Comprehensive amendment response management with:
 * - Prosecution header with application metadata and deadlines
 * - Office Action timeline visualization
 * - Enhanced status board with current OA overview
 * - Examiner analytics and insights
 * - Claim changes tracking
 * - Strategic alerts and recommendations
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
  Send,
  Settings,
  BarChart3
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Import new enhanced components
import { ProsecutionHeader } from './ProsecutionHeader';
import { OATimelineWidget } from './OATimelineWidget';
import { EnhancedStatusBoard } from './EnhancedStatusBoard';
import { ExaminerAnalyticsPanel } from './ExaminerAnalyticsPanel';
import { ClaimChangesSummary } from './ClaimChangesSummary';
import { AlertsRibbon } from './AlertsRibbon';
import { FocusedActionBanner } from './FocusedActionBanner';
import { CompactProgressBar } from './CompactProgressBar';
import { CurrentOACard } from './CurrentOACard';

// Import existing components
import { OfficeActionUpload } from '@/features/office-actions/components/OfficeActionUpload';
import { useOfficeActions } from '@/hooks/api/useAmendment';
import { useProsecutionOverview } from '@/hooks/api/useProsecutionOverview';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/config/featureFlags';

// Import legacy component as fallback
import { AmendmentProjectsList } from './AmendmentProjectsList';
import { AmendmentProjectCard } from './AmendmentProjectCard';

// Keep existing types for backward compatibility
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

interface EnhancedAmendmentProjectsListProps {
  projectId: string;
  /**
   * @deprecated Use enhanced view by default. Legacy mode available for transition.
   */
  legacyMode?: boolean;
  onAmendmentClick?: (amendmentId: string) => void;
  onUploadComplete?: (officeAction: any) => void;
}

export const EnhancedAmendmentProjectsList: React.FC<EnhancedAmendmentProjectsListProps> = ({
  projectId,
  legacyMode = false,
  onAmendmentClick,
  onUploadComplete,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');

  // Fetch data using both existing and new hooks
  const {
    data: officeActions = [],
    isLoading,
    error,
    refetch,
  } = useOfficeActions(projectId);

  const { data: prosecutionOverview } = useProsecutionOverview(projectId);
  const isMinimalistUI = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');

  // Create amendment projects from office actions (existing logic)
  const amendmentProjects: AmendmentProject[] = useMemo(() => {
    return officeActions.map((oa) => {
      let status: AmendmentProject['status'] = 'DRAFT';
      const daysSinceUpload = Math.floor(
        (Date.now() - new Date(oa.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (oa.status === 'UPLOADED') {
        status = 'DRAFT';
      } else if (oa.status === 'PARSED' && daysSinceUpload < 30) {
        status = 'DRAFT';
      } else if (oa.status === 'PARSED' && daysSinceUpload >= 30) {
        status = 'IN_REVIEW';
      } else if (oa.status === 'COMPLETED') {
        status = 'READY_TO_FILE';
      }

      const dueDate = oa.dateIssued 
        ? new Date(oa.dateIssued.getTime() + (90 * 24 * 60 * 60 * 1000))
        : new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));

      let responseType: AmendmentProject['responseType'] = 'AMENDMENT';
      if (oa.rejections && oa.rejections.length === 0) {
        responseType = 'RCE';
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

  // Filter projects (existing logic)
  const filteredProjects = useMemo(() => {
    return amendmentProjects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [amendmentProjects, searchTerm, statusFilter]);

  // Event handlers
  const handleCreateNew = () => {
    setShowUploadModal(true);
  };

  const handleProjectClick = (amendmentId: string) => {
    if (onAmendmentClick) {
      onAmendmentClick(amendmentId);
    } else {
      router.push(`${router.asPath}/studio?amendmentId=${amendmentId}`);
    }
  };

  const handleUploadComplete = (officeAction: any) => {
    setShowUploadModal(false);
    refetch();
    
    if (onUploadComplete) {
      onUploadComplete(officeAction);
    } else {
      const newAmendmentId = `amendment-${officeAction.id}`;
      router.push(`${router.asPath}/studio?amendmentId=${newAmendmentId}`);
    }
  };

  const handleStatusClick = (status: string) => {
    setStatusFilter(status);
    setViewMode('list');
  };

  const handleTimelineEventClick = (eventId: string, eventType: string) => {
    if (eventType === 'VIEW_ALL') {
      // Navigate to timeline view
      logger.info('[EnhancedAmendmentProjectsList] Navigate to timeline view');
    } else {
      // Navigate to specific event
      logger.info('[EnhancedAmendmentProjectsList] Navigate to event', { eventId, eventType });
    }
  };

  const handleAlertClick = (alertId: string, alertType: string) => {
    if (alertType === 'VIEW_ALL') {
      // Navigate to alerts view
      logger.info('[EnhancedAmendmentProjectsList] Navigate to alerts view');
    } else {
      // Handle specific alert
      logger.info('[EnhancedAmendmentProjectsList] Handle alert', { alertId, alertType });
    }
  };

  const handleClaimDiffView = () => {
    logger.info('[EnhancedAmendmentProjectsList] Navigate to claim diff view');
  };

  // Error handling - fallback to legacy UI on errors
  if (error) {
    logger.error('[EnhancedAmendmentProjectsList] Error loading data, falling back to legacy UI', {
      error: error instanceof Error ? error.message : String(error),
    });
    return <AmendmentProjectsList projectId={projectId} />;
  }

  // Legacy mode fallback
  if (legacyMode) {
    return <AmendmentProjectsList projectId={projectId} />;
  }

  // Enhanced mode with error boundary
  return (
    <>
      {/* Use full height container instead of SimpleMainPanel */}
      <div className="h-full flex flex-col bg-card border border-border shadow-lg overflow-hidden">
        {/* Fixed header */}
        <div className="flex-shrink-0 bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Amendment Builder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage amendment responses and prosecution workflow
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload OA
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-6 space-y-6">
            {/* View Toggle & Actions */}
            <div className="flex items-center justify-between">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'dashboard' | 'list')}>
                <TabsList>
                  <TabsTrigger value="dashboard">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <FileText className="h-4 w-4 mr-2" />
                    List View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Response
              </Button>
            </div>

            {/* Dashboard View - Focused Layout */}
            {viewMode === 'dashboard' && (
              <div className="space-y-6">
                {/* Current OA Card - Top Priority */}
                <CurrentOACard
                  officeAction={prosecutionOverview?.currentOfficeAction}
                  claimValidationNeeded={prosecutionOverview?.claimChanges?.pendingValidation ? 
                    prosecutionOverview.claimChanges.totalAmendedClaims : 0}
                  onViewDraft={() => {
                    const currentAmendment = amendmentProjects[0];
                    if (currentAmendment) {
                      handleProjectClick(currentAmendment.id);
                    }
                  }}
                  onValidateClaims={() => {
                    logger.info('[EnhancedAmendmentProjectsList] Navigate to claim validation');
                  }}
                  onRunAnalysis={() => {
                    logger.info('[EnhancedAmendmentProjectsList] Run AI analysis');
                  }}
                />

                {/* Compact Progress Bar */}
                <CompactProgressBar
                  segments={[
                    { 
                      label: 'Draft', 
                      count: prosecutionOverview?.responseStatus?.draft || 0,
                      color: 'bg-gray-500 text-white',
                    },
                    { 
                      label: 'Needs Validation', 
                      count: prosecutionOverview?.responseStatus?.inReview || 0,
                      color: 'bg-yellow-500 text-white',
                      isActive: true,
                    },
                    { 
                      label: 'Ready', 
                      count: prosecutionOverview?.responseStatus?.readyToFile || 0,
                      color: 'bg-green-500 text-white',
                    },
                    { 
                      label: 'Filed', 
                      count: prosecutionOverview?.responseStatus?.filed || 0,
                      color: 'bg-blue-500 text-white',
                    },
                  ]}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left - Claim Changes & Validation */}
                  <ClaimChangesSummary
                    projectId={projectId}
                    onViewDiff={handleClaimDiffView}
                    emphasized={true}
                  />

                  {/* Right - Examiner Analytics (conditional) */}
                  {prosecutionOverview?.examinerAnalytics ? (
                    <ExaminerAnalyticsPanel 
                      projectId={projectId}
                    />
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="py-8 text-center">
                        <p className="text-sm text-gray-600">
                          Examiner analytics unavailable
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Timeline - Thin Bar at Bottom */}
                <OATimelineWidget
                  projectId={projectId}
                  onEventClick={handleTimelineEventClick}
                />
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-6">
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

                {/* Projects List */}
                {isLoading ? (
                  <LoadingState message="Loading amendment responses..." />
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
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
                ) : isMinimalistUI ? (
                  // Minimalist UI - Attorney-focused cards
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => {
                      // Convert to attorney-focused data structure
                      const prosecutionData = {
                        id: project.id,
                        applicationNumber: prosecutionOverview?.applicationNumber || 'XX/XXX,XXX',
                        title: project.name,
                        currentOA: prosecutionOverview?.currentOfficeAction ? {
                          type: prosecutionOverview.currentOfficeAction.type as 'NON_FINAL' | 'FINAL' | 'ADVISORY',
                          mailedDate: new Date(prosecutionOverview.currentOfficeAction.mailedDate),
                          round: prosecutionOverview.currentOfficeAction.round || 1,
                        } : undefined,
                        nextDeadline: project.dueDate ? {
                          date: project.dueDate,
                          type: 'RESPONSE_DUE' as const,
                          isStatutory: true,
                        } : undefined,
                        examiner: prosecutionOverview?.examinerAnalytics ? {
                          name: prosecutionOverview.examinerAnalytics.examinerName,
                          artUnit: prosecutionOverview.examinerAnalytics.artUnit,
                          allowanceRate: prosecutionOverview.examinerAnalytics.allowanceRate,
                          artUnitAvgAllowance: prosecutionOverview.examinerAnalytics.artUnitAvgAllowance,
                        } : undefined,
                        draftStatus: project.status === 'DRAFT' ? 'IN_PROGRESS' : 
                                    project.status === 'READY_TO_FILE' ? 'READY' : 'NO_DRAFT',
                        fileCount: 0, // TODO: Get actual file count
                        milestones: [], // TODO: Get from prosecution overview
                      };

                      return (
                        <AmendmentProjectCard
                          key={project.id}
                          project={prosecutionData}
                          onOpenDraft={() => handleProjectClick(project.id)}
                          onViewFiles={(id) => logger.info('View files', { id })}
                          onViewTimeline={(id) => logger.info('View timeline', { id })}
                        />
                      );
                    })}
                  </div>
                ) : (
                  // Legacy UI - Original cards
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => (
                      <Card 
                        key={project.id}
                        className="cursor-pointer transition-all hover:shadow-lg border-l-4 border-l-blue-500"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <Badge>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {project.dueDate && (
                            <p className="text-sm text-gray-600">
                              Due {formatDistanceToNow(project.dueDate, { addSuffix: true })}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {project.officeAction.rejectionCount || 0} rejection{project.officeAction.rejectionCount !== 1 ? 's' : ''}
                            </span>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Open
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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