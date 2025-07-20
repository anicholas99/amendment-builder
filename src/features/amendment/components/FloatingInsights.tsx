/**
 * Floating Insights Icon - Access to advanced analytics
 * 
 * Provides power users with quick access to:
 * - Examiner statistics
 * - Historical success rates
 * - Allowance probability
 * - Similar argument analysis
 */

import React, { useState } from 'react';
import { 
  BarChart3,
  TrendingUp,
  History,
  Users,
  FileSearch,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/config/featureFlags';

interface FloatingInsightsProps {
  projectId: string;
  officeActionId?: string;
  examinerData?: {
    name: string;
    allowanceRate: number;
    artUnitAvgAllowance: number;
    recentTrends?: Array<{ month: string; rate: number }>;
  };
  className?: string;
}

const INSIGHTS_FEATURES = [
  {
    id: 'examiner-stats',
    title: 'Examiner Analytics',
    description: 'Detailed examiner statistics and trends',
    icon: Users,
    color: 'text-blue-600',
  },
  {
    id: 'success-rates',
    title: 'Argument Success Rates',
    description: 'Historical success with similar arguments',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    id: 'allowance-prob',
    title: 'Allowance Probability',
    description: 'AI-predicted allowance likelihood',
    icon: BarChart3,
    color: 'text-purple-600',
  },
  {
    id: 'similar-cases',
    title: 'Similar Cases',
    description: 'Find similar prosecution histories',
    icon: FileSearch,
    color: 'text-orange-600',
  },
];

export const FloatingInsights: React.FC<FloatingInsightsProps> = ({
  projectId,
  officeActionId,
  examinerData,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMinimalistUI = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');
  
  // Only show in minimalist UI mode
  if (!isMinimalistUI) return null;

  return (
    <>
      {/* Floating button */}
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-12 w-12 rounded-full shadow-lg",
          "bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          "transition-all hover:scale-105",
          className
        )}
        title="Advanced Insights"
      >
        <BarChart3 className="h-5 w-5" />
      </Button>

      {/* Insights panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Advanced Insights
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Quick stats */}
            {examinerData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Current Examiner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {examinerData.name}
                      </span>
                      <Badge 
                        variant={examinerData.allowanceRate > examinerData.artUnitAvgAllowance ? "default" : "secondary"}
                      >
                        {(examinerData.allowanceRate * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Allowance Rate</span>
                        <span>{(examinerData.allowanceRate * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={examinerData.allowanceRate * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Art Unit Average</span>
                        <span>{(examinerData.artUnitAvgAllowance * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={examinerData.artUnitAvgAllowance * 100} 
                        className="h-2 bg-gray-200"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature list */}
            <div className="space-y-2">
              {INSIGHTS_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                    onClick={() => {
                      console.log('Open feature:', feature.id);
                      // TODO: Implement feature navigation
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg bg-gray-50",
                          feature.color
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Coming soon section */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">More Insights Coming Soon</h4>
                    <p className="text-xs text-muted-foreground">
                      We're continuously adding new analytics and insights based on attorney feedback.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};