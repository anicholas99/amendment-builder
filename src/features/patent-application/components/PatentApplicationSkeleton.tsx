import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, FileText, MessageCircle } from 'lucide-react';
import ViewLayout from '@/components/layouts/ViewLayout';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { SidebarContainer } from '@/components/layouts/containers';
import PatentHeader from './PatentHeader';

/**
 * Skeleton component specifically designed for Patent Application view
 * Matches the PatentMainPanel and PatentSidebar structure
 */
export const PatentApplicationSkeleton: React.FC = () => {
  // Main panel skeleton content - matches PatentMainPanel structure
  const mainPanelSkeleton = (
    <SimpleMainPanel
      header={
        // Patent Editor Header with toolbar - matches PatentEditorHeader
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50/50 dark:bg-gray-800/50 min-h-[44px]">
          {/* Left side - Save status */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" variant="shimmer" />
          </div>

          {/* Right side - Toolbar actions */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
            <Skeleton className="h-8 w-16 rounded" variant="shimmer" />
            <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
            <Skeleton className="h-8 w-24 rounded" variant="shimmer" />
            <Skeleton className="h-8 w-20 rounded" variant="shimmer" />
          </div>
        </div>
      }
      reserveScrollbarGutter={false}
      contentPadding={false}
      contentStyles={{ overflow: 'hidden' }}
    >
      {/* Patent Document Content - styled like a real document */}
      <div className="p-8 space-y-8 bg-white dark:bg-black min-h-full">
        {/* Document Title */}
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" variant="shimmer" />
          <Skeleton className="h-4 w-1/2 mx-auto" variant="shimmer" />
        </div>

        {/* Abstract Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" variant="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-11/12" variant="shimmer" />
            <Skeleton className="h-4 w-5/6" variant="shimmer" />
            <Skeleton className="h-4 w-4/5" variant="shimmer" />
          </div>
        </div>

        {/* Field of Invention */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" variant="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
          </div>
        </div>

        {/* Background Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-28" variant="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-11/12" variant="shimmer" />
            <Skeleton className="h-4 w-5/6" variant="shimmer" />
            <Skeleton className="h-4 w-4/5" variant="shimmer" />
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
          </div>
        </div>

        {/* Summary Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-20" variant="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-11/12" variant="shimmer" />
            <Skeleton className="h-4 w-4/5" variant="shimmer" />
          </div>
        </div>

        {/* Brief Description of Drawings */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" variant="shimmer" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton
                  className="h-4 w-16 flex-shrink-0"
                  variant="shimmer"
                />
                <Skeleton className="h-4 flex-1" variant="shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" variant="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-11/12" variant="shimmer" />
            <Skeleton className="h-4 w-5/6" variant="shimmer" />
            <Skeleton className="h-4 w-4/5" variant="shimmer" />
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
          </div>
        </div>

        {/* Claims Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-16" variant="shimmer" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-start space-x-3">
                  <Skeleton
                    className="h-4 w-8 flex-shrink-0"
                    variant="shimmer"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" variant="shimmer" />
                    <Skeleton className="h-4 w-5/6" variant="shimmer" />
                    <Skeleton className="h-4 w-4/5" variant="shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SimpleMainPanel>
  );

  // Sidebar skeleton content - reuse the same structure as Technology Details
  const sidebarSkeleton = (
    <SidebarContainer
      tabTitles={['Figures', 'Chat']}
      tabIcons={[
        <div key="figuresIcon" className="flex items-center justify-center h-6">
          <Image className="h-4 w-4" />
        </div>,
        <div key="chatIcon" className="flex items-center justify-center h-6">
          <MessageCircle className="h-4 w-4" />
        </div>,
      ]}
      tabContents={[
        // Figures tab content - same as Technology Details
        <div key="figures" className="p-4 h-full flex flex-col overflow-auto">
          {/* Figure Carousel Section */}
          <div className="mb-1">
            {/* Main figure display area */}
            <div className="h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] flex-shrink-0 border border-border rounded-md p-2 bg-card relative overflow-hidden mb-2">
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <Skeleton className="h-16 w-16 rounded-lg" variant="shimmer" />
                <Skeleton className="h-3 w-24" variant="shimmer" />
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center w-full mb-1">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    variant="shimmer"
                  />
                ))}
              </div>
            </div>

            {/* Figure metadata */}
            <div className="w-full">
              <div className="flex items-center w-full gap-2">
                <Skeleton className="h-6 w-16 rounded-md" variant="shimmer" />
                <Skeleton className="h-6 flex-1 rounded-md" variant="shimmer" />
              </div>
            </div>
          </div>

          {/* Reference Numerals Section */}
          <div className="mt-0 flex-1 overflow-visible">
            <div className="mt-2 flex flex-col min-h-0 h-full flex-1">
              <div className="border border-border rounded-lg bg-card flex-1 min-h-0 flex flex-col relative overflow-hidden shadow-sm">
                {/* Table header */}
                <div className="bg-accent border-b border-border p-2">
                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-3">
                      <Skeleton className="h-3 w-8" variant="shimmer" />
                    </div>
                    <div className="col-span-7">
                      <Skeleton className="h-3 w-16" variant="shimmer" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-3 w-12" variant="shimmer" />
                    </div>
                  </div>
                </div>

                {/* Table rows */}
                <div className="flex-1 p-2">
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-2 text-xs py-1"
                      >
                        <div className="col-span-3">
                          <Skeleton className="h-4 w-8" variant="shimmer" />
                        </div>
                        <div className="col-span-7">
                          <Skeleton className="h-4 w-full" variant="shimmer" />
                        </div>
                        <div className="col-span-2">
                          <Skeleton
                            className="h-4 w-4 rounded"
                            variant="shimmer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,

        // Chat tab content - same as Technology Details
        <div key="chat" className="h-full flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Skeleton
                className="h-6 w-6 rounded-full flex-shrink-0"
                variant="shimmer"
              />
              <Skeleton className="h-5 w-32" variant="shimmer" />
            </div>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* AI message */}
            <div className="flex items-start space-x-3">
              <Skeleton
                className="h-8 w-8 rounded-full flex-shrink-0"
                variant="shimmer"
              />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" variant="shimmer" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" variant="shimmer" />
                  <Skeleton className="h-4 w-4/5" variant="shimmer" />
                  <Skeleton className="h-4 w-3/4" variant="shimmer" />
                </div>
              </div>
            </div>

            {/* User message */}
            <div className="flex items-start space-x-3 justify-end">
              <div className="flex-1 max-w-xs space-y-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full ml-auto" variant="shimmer" />
                  <Skeleton className="h-4 w-4/5 ml-auto" variant="shimmer" />
                </div>
              </div>
              <Skeleton
                className="h-8 w-8 rounded-full flex-shrink-0"
                variant="shimmer"
              />
            </div>

            {/* AI response */}
            <div className="flex items-start space-x-3">
              <Skeleton
                className="h-8 w-8 rounded-full flex-shrink-0"
                variant="shimmer"
              />
              <div className="flex-1 space-y-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" variant="shimmer" />
                  <Skeleton className="h-4 w-5/6" variant="shimmer" />
                </div>
              </div>
            </div>
          </div>

          {/* Chat input area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 flex-1 rounded-lg" variant="shimmer" />
              <Skeleton className="h-10 w-10 rounded-lg" variant="shimmer" />
            </div>
          </div>
        </div>,
      ]}
      activeTab={0}
      onTabChange={() => {}}
    />
  );

  return (
    <ViewLayout
      header={<PatentHeader hideTitle={false} />}
      mainContent={mainPanelSkeleton}
      sidebarContent={sidebarSkeleton}
      isResizable={true}
      defaultSidebarWidth={400}
      minSidebarWidth={300}
      maxSidebarWidth={600}
    />
  );
};
