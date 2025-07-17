import React, { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarTabContainerProps {
  activeTab: string;
  handleTabChange: (index: number) => void;
  tabTitles: string[];
  tabContents: ReactNode[];
  tabIcons?: (React.ReactElement | null | undefined)[];
  notifications?: Record<number, boolean>;
}

/**
 * A reusable tab container component for sidebar navigation
 */
const SidebarTabContainer: React.FC<SidebarTabContainerProps> = ({
  activeTab,
  handleTabChange,
  tabTitles,
  tabContents,
  tabIcons = [],
  notifications,
}) => {
  // Convert activeTab string to number for defaultIndex
  const activeTabIndex = parseInt(activeTab, 10) || 0;

  return (
    <div className="absolute inset-0 border border-border rounded-lg overflow-hidden shadow-sm bg-background">
      <Tabs
        value={activeTabIndex.toString()}
        onValueChange={value => handleTabChange(parseInt(value))}
        className="h-full flex flex-col"
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 h-12 px-0">
          {tabTitles.map((title, index) => (
            <TabsTrigger
              key={index}
              value={index.toString()}
              className="px-5 py-3 text-sm font-medium data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              {tabIcons[index] ? (
                <div className="flex items-center gap-1">
                  {tabIcons[index]}
                  <span>{title}</span>
                  {notifications?.[index] && (
                    <Badge className="ml-2 px-2 py-0 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-[0_0_8px_rgba(66,153,225,0.6)]">
                      New
                    </Badge>
                  )}
                </div>
              ) : (
                <>
                  {title}
                  {notifications?.[index] && (
                    <Badge className="ml-2 px-2 py-0 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-[0_0_8px_rgba(66,153,225,0.6)]">
                      New
                    </Badge>
                  )}
                </>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-hidden relative">
          {tabContents.map((content, index) => (
            <TabsContent
              key={index}
              value={index.toString()}
              className={cn(
                'h-full overflow-auto m-0 absolute inset-0 transition-opacity',
                activeTabIndex === index
                  ? 'opacity-100 z-10'
                  : 'opacity-0 pointer-events-none'
              )}
              forceMount
            >
              {/* Keep all tabs mounted to preserve state, just hide inactive ones */}
              {content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default SidebarTabContainer;
