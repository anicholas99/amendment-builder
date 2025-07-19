/**
 * Prosecution History Tab
 * 
 * Example implementation showing how to use USPTO integration in your project views
 * Combines timeline visualization with document access
 */

import React from 'react';
import { OATimelineWidget } from './OATimelineWidget';
import { USPTODocumentsPanel } from './USPTODocumentsPanel';
import { useProject } from '@/hooks/api/useProject';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useHasUSPTOData } from '@/hooks/api/useEnhancedProsecution';

interface ProsecutionHistoryTabProps {
  projectId: string;
}

export const ProsecutionHistoryTab: React.FC<ProsecutionHistoryTabProps> = ({
  projectId,
}) => {
  // Get project data to extract application number
  const { data: project } = useProject(projectId);
  const applicationNumber = project?.invention?.applicationNumber || null;
  
  // Check if USPTO data is available
  const { hasData, documentCount, isLoading } = useHasUSPTOData(applicationNumber);

  return (
    <div className="space-y-6">
      {/* Timeline Widget - automatically uses USPTO data when available */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Prosecution Timeline</h2>
          {hasData && (
            <Badge variant="secondary" className="text-xs">
              {documentCount} USPTO Documents Available
            </Badge>
          )}
        </div>
        <OATimelineWidget 
          projectId={projectId}
          applicationNumber={applicationNumber}
          onEventClick={(eventId, eventType) => {
            // Handle event click - could open document viewer
            console.log('Timeline event clicked:', { eventId, eventType });
          }}
        />
      </div>

      {/* USPTO Documents Panel - only shown if we have an application number */}
      {applicationNumber && (
        <div>
          <h2 className="text-lg font-semibold mb-4">USPTO Documents</h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="core">Core Documents</TabsTrigger>
              <TabsTrigger value="office-actions">Office Actions</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <USPTODocumentsPanel
                projectId={projectId}
                applicationNumber={applicationNumber}
                onDocumentClick={(document) => {
                  // Handle document click - could open in modal or new tab
                  console.log('Document clicked:', document);
                }}
              />
            </TabsContent>
            
            <TabsContent value="core">
              <USPTODocumentsPanel
                projectId={projectId}
                applicationNumber={applicationNumber}
                onDocumentClick={(document) => {
                  console.log('Core document clicked:', document);
                }}
              />
            </TabsContent>
            
            <TabsContent value="office-actions">
              <p className="text-sm text-gray-500 p-4">
                Office Actions view - filter by office-action category
              </p>
            </TabsContent>
            
            <TabsContent value="responses">
              <p className="text-sm text-gray-500 p-4">
                Responses view - filter by response category
              </p>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* No application number message */}
      {!applicationNumber && !isLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            No application number found for this project. USPTO prosecution history requires a valid application number.
          </p>
        </div>
      )}
    </div>
  );
};