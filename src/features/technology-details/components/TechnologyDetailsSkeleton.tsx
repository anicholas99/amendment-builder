import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, FileText, MessageCircle } from 'lucide-react';
import ViewLayout from '@/components/layouts/ViewLayout';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { SidebarContainer } from '@/components/layouts/containers';
import TechnologyHeader from './TechnologyHeader';

/**
 * Skeleton component specifically designed for Technology Details view
 * Minimal and generic while maintaining the general layout structure
 */
export const TechnologyDetailsSkeleton: React.FC = () => {
  // Main panel skeleton content - minimal and generic
  const mainPanelSkeleton = (
    <SimpleMainPanel
      header={
        // Simple header without icons
        <div className="p-2 flex justify-between items-center gap-2 bg-card border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" variant="shimmer" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-16 rounded" variant="shimmer" />
          </div>
        </div>
      }
      contentPadding={false}
    >
      <div className="space-y-6">
        {/* Title and Abstract - matches TechInventionTitleShadcn */}
        <div>
          <div className="pt-2 px-5 pb-3">
            <Skeleton className="h-8 w-2/3" variant="shimmer" />
          </div>
          <div className="px-5 pb-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" variant="shimmer" />
              <Skeleton className="h-4 w-5/6" variant="shimmer" />
              <Skeleton className="h-4 w-4/5" variant="shimmer" />
            </div>
          </div>
        </div>

        {/* Technology Classification Section - dual column layout */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-48" variant="shimmer" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" variant="shimmer" />
              <Skeleton className="h-8 w-full" variant="shimmer" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" variant="shimmer" />
              <Skeleton className="h-8 w-full" variant="shimmer" />
            </div>
          </div>
        </div>

        {/* Background Section - paragraph format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-20" variant="shimmer" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-11/12" variant="shimmer" />
            <Skeleton className="h-4 w-4/5" variant="shimmer" />
            <Skeleton className="h-4 w-5/6" variant="shimmer" />
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
          </div>
        </div>

        {/* Summary Section - paragraph format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-16" variant="shimmer" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-5/6" variant="shimmer" />
            <Skeleton className="h-4 w-4/5" variant="shimmer" />
          </div>
        </div>

        {/* Novelty Section - paragraph format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-14" variant="shimmer" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-11/12" variant="shimmer" />
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
          </div>
        </div>

        {/* Key Features Section - list format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-28" variant="shimmer" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton
                  className="h-2 w-2 rounded-full mt-2 flex-shrink-0"
                  variant="shimmer"
                />
                <Skeleton className="h-4 flex-1" variant="shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Advantages Section - list format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-24" variant="shimmer" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton
                  className="h-2 w-2 rounded-full mt-2 flex-shrink-0"
                  variant="shimmer"
                />
                <Skeleton className="h-4 flex-1" variant="shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Technical Implementation Section - paragraph format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-40" variant="shimmer" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-5/6" variant="shimmer" />
            <Skeleton className="h-4 w-4/5" variant="shimmer" />
            <Skeleton className="h-4 w-11/12" variant="shimmer" />
          </div>
        </div>

        {/* Process Steps Section - list format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-28" variant="shimmer" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton
                  className="h-2 w-2 rounded-full mt-2 flex-shrink-0"
                  variant="shimmer"
                />
                <Skeleton className="h-4 flex-1" variant="shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section - list format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-20" variant="shimmer" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton
                  className="h-2 w-2 rounded-full mt-2 flex-shrink-0"
                  variant="shimmer"
                />
                <Skeleton className="h-4 flex-1" variant="shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Definitions Section - key-value format */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <Skeleton className="h-5 w-20" variant="shimmer" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-24" variant="shimmer" />
                <Skeleton className="h-4 w-full" variant="shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SimpleMainPanel>
  );

  // Sidebar skeleton content - minimal and generic
  const sidebarSkeleton = (
    <SidebarContainer
      tabTitles={['Figures', 'Files', 'AI Assistant']}
      tabIcons={[
        <div key="figuresIcon" className="flex items-center justify-center h-6">
          <Image className="h-4 w-4" />
        </div>,
        <div key="filesIcon" className="flex items-center justify-center h-6">
          <FileText className="h-4 w-4" />
        </div>,
        <div key="chatIcon" className="flex items-center justify-center h-6">
          <MessageCircle className="h-4 w-4" />
        </div>,
      ]}
      tabContents={[
        // Tab 1 content - Figures tab with carousel and reference numerals
        <div key="tab1" className="p-4 h-full flex flex-col overflow-auto">
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

        // Tab 2 content - Files tab (LinkedPatentFiles structure)
        <div key="tab2" className="p-6 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-5 w-5 rounded" variant="shimmer" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-32" variant="shimmer" />
                <Skeleton className="h-4 w-8 rounded-full" variant="shimmer" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded" variant="shimmer" />
          </div>

          {/* Document list */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="group p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <Skeleton
                      className="h-5 w-5 mt-0.5 flex-shrink-0"
                      variant="shimmer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Skeleton className="h-4 w-3/4" variant="shimmer" />
                        <Skeleton
                          className="h-5 w-16 rounded-full"
                          variant="shimmer"
                        />
                      </div>
                      <Skeleton className="h-3 w-1/2" variant="shimmer" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                    <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>,

        // Tab 3 content - AI Assistant (Chat interface structure)
        <div key="tab3" className="h-full flex flex-col overflow-hidden">
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
      header={<TechnologyHeader />}
      mainContent={mainPanelSkeleton}
      sidebarContent={sidebarSkeleton}
      isResizable={true}
      defaultSidebarWidth={400}
      minSidebarWidth={300}
      maxSidebarWidth={600}
    />
  );
};
