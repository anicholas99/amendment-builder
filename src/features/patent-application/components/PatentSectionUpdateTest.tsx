import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraftApiService } from '@/services/api/draftApiService';
import { logger } from '@/utils/clientLogger';
import { useQueryClient } from '@tanstack/react-query';
import { draftQueryKeys } from '@/lib/queryKeys/draftQueryKeys';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';

interface PatentSectionUpdateTestProps {
  projectId: string;
}

type SectionType = 'TITLE' | 'ABSTRACT' | 'FIELD' | 'BACKGROUND' | 'SUMMARY';

interface TestResult {
  sectionType: SectionType;
  timestamp: string;
  success: boolean;
  error?: string;
  apiSuccess?: boolean;
  eventEmitted?: boolean;
  contentBefore?: string;
  contentAfter?: string;
  cacheUpdated?: boolean;
  editorSyncKey?: number;
}

interface DebugInfo {
  eventReceived: boolean;
  lastEventTime: string | null;
  refreshCalled: boolean;
  forceReloadCalled: boolean;
  editorSyncKey: number;
  cacheData: any;
}

export const PatentSectionUpdateTest: React.FC<
  PatentSectionUpdateTestProps
> = ({ projectId }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentSection, setCurrentSection] = useState<SectionType | null>(
    null
  );
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    eventReceived: false,
    lastEventTime: null,
    refreshCalled: false,
    forceReloadCalled: false,
    editorSyncKey: 0,
    cacheData: null,
  });

  const queryClient = useQueryClient();

  // Listen for patent section update events to debug the flow
  useEffect(() => {
    const handlePatentSectionUpdate = (event: CustomEvent) => {
      const {
        projectId: eventProjectId,
        sectionType,
        timestamp,
      } = event.detail;

      if (eventProjectId !== projectId) return;

      logger.info('[PatentSectionUpdateTest] Event received', {
        projectId: eventProjectId,
        sectionType,
        timestamp,
      });

      setDebugInfo(prev => ({
        ...prev,
        eventReceived: true,
        lastEventTime: new Date().toISOString(),
      }));
    };

    window.addEventListener(
      'patentSectionUpdated',
      handlePatentSectionUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        'patentSectionUpdated',
        handlePatentSectionUpdate as EventListener
      );
    };
  }, [projectId]);

  // Monitor cache changes
  useEffect(() => {
    const cacheData = queryClient.getQueryData([
      ...draftQueryKeys.all(projectId),
      'with-content',
    ]);
    setDebugInfo(prev => ({
      ...prev,
      cacheData,
    }));
  }, [projectId, queryClient]);

  const updateSection = async (sectionType: SectionType) => {
    setCurrentSection(sectionType);
    const timestamp = new Date().toISOString();

    const result: TestResult = {
      sectionType,
      timestamp,
      success: false,
    };

    try {
      logger.info(
        '[PatentSectionUpdateTest] Starting detailed section update test',
        {
          projectId,
          sectionType,
          timestamp,
        }
      );

      // Step 1: Get current draft documents
      const currentDrafts = await DraftApiService.getDraftDocuments(projectId);
      const sectionDoc = currentDrafts.find(doc => doc.type === sectionType);

      if (!sectionDoc) {
        throw new Error(`No ${sectionType} document found`);
      }

      result.contentBefore = sectionDoc.content || '';

      // Step 2: Create updated content with timestamp
      let updatedContent: string;

      if (sectionType === 'FIELD') {
        // Special test content for FIELD section
        const baseContent =
          sectionDoc.content ||
          'The present invention relates to the field of technology.';
        updatedContent = `${baseContent}\n\nThis invention particularly relates to automated testing systems and real-time content synchronization mechanisms. The technical field encompasses patent document management systems, content version control, and dynamic document updating technologies.\n\n<!-- TEST UPDATE: ${timestamp} -->`;
      } else if (sectionType === 'TITLE') {
        // Test content for TITLE section
        const baseContent = sectionDoc.content || 'PATENT APPLICATION TITLE';
        updatedContent = `${baseContent} - TEST ${timestamp}`;
      } else if (sectionType === 'ABSTRACT') {
        // Test content for ABSTRACT section
        const baseContent =
          sectionDoc.content ||
          'A system and method for managing patent applications.';
        updatedContent = `${baseContent}\n\nThis test demonstrates real-time content synchronization in a patent document management system. The system provides automated section updates, version control, and collaborative editing capabilities with instant content propagation across all connected interfaces.\n\n<!-- TEST UPDATE: ${timestamp} -->`;
      } else if (sectionType === 'BACKGROUND') {
        // Test content for BACKGROUND section
        const baseContent =
          sectionDoc.content || 'Background of the invention.';
        updatedContent = `${baseContent}\n\nTraditional patent document systems lack real-time synchronization capabilities. This test demonstrates the need for and implementation of dynamic content updates that propagate instantly across all system components. Prior art systems required manual refresh operations and suffered from content inconsistency issues.\n\n<!-- TEST UPDATE: ${timestamp} -->`;
      } else {
        // Default test content for other sections
        const baseContent =
          sectionDoc.content || `Default ${sectionType} content`;
        updatedContent = `${baseContent}\n\n<!-- TEST UPDATE: ${timestamp} -->`;
      }
      result.contentAfter = updatedContent;

      // Step 3: Update via API
      await DraftApiService.updateDraftDocument(
        projectId,
        sectionType,
        updatedContent
      );
      result.apiSuccess = true;

      logger.info('[PatentSectionUpdateTest] API update successful', {
        projectId,
        sectionType,
        contentLength: updatedContent.length,
      });

      // Step 4: Check cache before event
      const cacheBefore = queryClient.getQueryData([
        ...draftQueryKeys.all(projectId),
        'with-content',
      ]);
      logger.info('[PatentSectionUpdateTest] Cache before event', {
        cacheBefore,
      });

      // Step 5: Emit the event to trigger real-time update
      const event = new CustomEvent('patentSectionUpdated', {
        detail: {
          projectId,
          sectionType,
          timestamp: Date.now(),
        },
      });

      window.dispatchEvent(event);
      result.eventEmitted = true;

      logger.info('[PatentSectionUpdateTest] Event emitted', {
        projectId,
        sectionType,
        timestamp: Date.now(),
      });

      // Step 6: Wait a bit and check cache after event
      await new Promise(resolve => setTimeout(resolve, 300));

      const cacheAfter = queryClient.getQueryData([
        ...draftQueryKeys.all(projectId),
        'with-content',
      ]);
      logger.info('[PatentSectionUpdateTest] Cache after event', {
        cacheAfter,
      });

      // Step 7: Manually try to update cache to see if that works
      logger.info('[PatentSectionUpdateTest] Attempting manual cache update');

      // Invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: [...draftQueryKeys.all(projectId), 'with-content'],
      });

      // Try to get fresh data
      const freshDrafts = await DraftApiService.getDraftDocuments(
        projectId,
        false,
        true
      );
      logger.info('[PatentSectionUpdateTest] Fresh drafts fetched', {
        count: freshDrafts.length,
        updatedDoc:
          freshDrafts
            .find(d => d.type === sectionType)
            ?.content?.substring(0, 200) + '...',
      });

      // Rebuild content manually
      const sectionDocuments: Record<string, string> = {};
      freshDrafts.forEach(doc => {
        if (doc.type && doc.content) {
          sectionDocuments[doc.type] = doc.content;
        }
      });

      const rebuiltContent = rebuildHtmlContent(sectionDocuments);
      logger.info('[PatentSectionUpdateTest] Content rebuilt', {
        length: rebuiltContent.length,
        containsTimestamp: rebuiltContent.includes(timestamp),
        preview: rebuiltContent.substring(0, 500) + '...',
      });

      // Update cache manually
      const withContentData = {
        documents: freshDrafts,
        content: rebuiltContent,
        hasContent: rebuiltContent.length > 0,
      };

      queryClient.setQueryData(
        [...draftQueryKeys.all(projectId), 'with-content'],
        withContentData
      );
      result.cacheUpdated = true;

      logger.info('[PatentSectionUpdateTest] Manual cache update complete');

      // Step 8: Emit another event to trigger editor sync
      const event2 = new CustomEvent('patentSectionUpdated', {
        detail: {
          projectId,
          sectionType,
          timestamp: Date.now(),
        },
      });

      window.dispatchEvent(event2);

      result.success = true;

      logger.info(
        '[PatentSectionUpdateTest] Section update test completed successfully',
        {
          projectId,
          sectionType,
          timestamp,
          result,
        }
      );
    } catch (error) {
      logger.error('[PatentSectionUpdateTest] Section update test failed', {
        error,
        projectId,
        sectionType,
        result,
      });

      result.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      setTestResults(prev => [...prev, result]);
      setCurrentSection(null);
    }
  };

  const handleTestSingleSection = async (sectionType: SectionType) => {
    setIsUpdating(true);
    await updateSection(sectionType);
    setIsUpdating(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setDebugInfo({
      eventReceived: false,
      lastEventTime: null,
      refreshCalled: false,
      forceReloadCalled: false,
      editorSyncKey: 0,
      cacheData: null,
    });
  };

  const manualCacheRefresh = async () => {
    setIsUpdating(true);
    try {
      logger.info('[PatentSectionUpdateTest] Manual cache refresh');
      await queryClient.invalidateQueries({
        queryKey: [...draftQueryKeys.all(projectId), 'with-content'],
      });
      await queryClient.refetchQueries({
        queryKey: [...draftQueryKeys.all(projectId), 'with-content'],
      });
      logger.info('[PatentSectionUpdateTest] Manual cache refresh complete');
    } catch (error) {
      logger.error('[PatentSectionUpdateTest] Manual cache refresh failed', {
        error,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;

  return (
    <Card className="w-full max-w-3xl max-h-96 overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">
          Patent Section Update Debug Test
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p>Project: {projectId}</p>
          {currentSection && (
            <p className="text-blue-600 font-medium">
              Currently updating: {currentSection}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Debug Info */}
        <div className="border rounded-lg p-3 bg-blue-50">
          <h4 className="font-medium text-sm mb-2">Debug Info</h4>
          <div className="text-xs space-y-1">
            <p>Event Received: {debugInfo.eventReceived ? '✅' : '❌'}</p>
            <p>Last Event: {debugInfo.lastEventTime || 'None'}</p>
            <p>Cache Data: {debugInfo.cacheData ? 'Present' : 'Missing'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleTestSingleSection('TITLE')}
            disabled={isUpdating}
            variant="outline"
            size="sm"
          >
            Test Title
          </Button>

          <Button
            onClick={() => handleTestSingleSection('FIELD')}
            disabled={isUpdating}
            variant="outline"
            size="sm"
          >
            Test Field
          </Button>

          <Button
            onClick={() => handleTestSingleSection('ABSTRACT')}
            disabled={isUpdating}
            variant="outline"
            size="sm"
          >
            Test Abstract
          </Button>

          <Button
            onClick={() => handleTestSingleSection('BACKGROUND')}
            disabled={isUpdating}
            variant="outline"
            size="sm"
          >
            Test Background
          </Button>

          <Button
            onClick={manualCacheRefresh}
            disabled={isUpdating}
            variant="outline"
            size="sm"
          >
            Manual Cache Refresh
          </Button>

          <Button
            onClick={clearResults}
            disabled={isUpdating}
            variant="ghost"
            size="sm"
          >
            Clear Results
          </Button>
        </div>

        {/* Detailed Results */}
        {testResults.length > 0 && (
          <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Detailed Test Results</h4>
              <span
                className={`text-sm font-medium ${successCount === totalCount ? 'text-green-600' : 'text-orange-600'}`}
              >
                {successCount}/{totalCount} successful
              </span>
            </div>

            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="border-l-4 border-gray-300 pl-3 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.sectionType}</span>
                    <span className={getStatusColor(result.success)}>
                      {result.success ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1">
                    <p>API Success: {result.apiSuccess ? '✅' : '❌'}</p>
                    <p>Event Emitted: {result.eventEmitted ? '✅' : '❌'}</p>
                    <p>Cache Updated: {result.cacheUpdated ? '✅' : '❌'}</p>
                    {result.error && (
                      <p className="text-red-600">Error: {result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p className="font-medium mb-1">Debug Steps:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Check if API calls succeed (should be ✅)</li>
            <li>Check if events are emitted (should be ✅)</li>
            <li>Check if cache updates (might be ❌)</li>
            <li>Watch browser console for detailed logs</li>
            <li>Try manual cache refresh to see if that updates editor</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
