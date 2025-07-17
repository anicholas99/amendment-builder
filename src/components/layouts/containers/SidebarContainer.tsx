import React, { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { isDevelopment } from '@/config/environment.client';

interface SidebarContainerProps {
  children?: ReactNode;
  activeTab?: number;
  onTabChange?: (index: number) => void;
  tabTitles?: string[];
  tabIcons?: (React.ReactElement | null | undefined)[];
  tabContents?: ReactNode[];
  hasTabs?: boolean;
  // Basic style props
  style?: React.CSSProperties;
  className?: string;
}

/**
 * A standardized container for all sidebar components in the application
 * Ensures consistent styling and behavior across different views
 */
const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  activeTab = 0,
  onTabChange,
  tabTitles = [],
  tabIcons = [],
  tabContents = [],
  hasTabs = true,
  style,
  className,
}) => {
  const isDev = isDevelopment;

  // Render with tabs if tabTitles are provided
  if (hasTabs && tabTitles.length > 0 && tabContents.length > 0) {
    return (
      <div className={cn('h-full relative', className)} style={style}>
        <div className="absolute inset-0 border border-border rounded-lg overflow-hidden shadow-sm bg-background w-full">
          <Tabs
            value={activeTab.toString()}
            onValueChange={value => onTabChange?.(parseInt(value))}
            className="w-full h-full flex flex-col"
          >
            <TabsList className="w-full min-h-[48px] flex-shrink-0 bg-muted/50 border-b rounded-none justify-start px-0">
              {tabTitles.map((title, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="px-5 py-3 font-medium text-sm data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  {tabIcons[index] ? (
                    <div className="flex items-center gap-1">
                      {tabIcons[index]}
                      <span>{title}</span>
                    </div>
                  ) : (
                    title
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {tabContents.map((content, index) => (
                <TabsContent
                  key={index}
                  value={index.toString()}
                  className={cn(
                    'h-full overflow-auto p-0',
                    activeTab === index ? 'block' : 'hidden'
                  )}
                  forceMount
                >
                  {content}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  // Render without tabs, just the container with children
  return (
    <div className={cn('h-full relative', className)} style={style}>
      <div className="absolute inset-0 border border-border rounded-lg overflow-hidden shadow-sm bg-background w-full">
        {children}
      </div>
    </div>
  );
};

export default SidebarContainer;
