import React from 'react';
import { cn } from '@/lib/utils';
import { FiFileText, FiClock, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';
import { useThemeContext } from '@/contexts/ThemeContext';
import { LoadingState } from '@/components/common/LoadingState';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combined-analysis.client-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PastAnalysisEntry {
  id: string;
  createdAt: string;
  referenceNumbers: string[];
  analysis: StructuredCombinedAnalysis;
}

interface PastAnalysesListProps {
  isLoading: boolean;
  pastAnalyses: PastAnalysisEntry[] | undefined;
  onViewAnalysis: (analysis: StructuredCombinedAnalysis) => void;
  onCreateNew: () => void;
  getDeterminationColorScheme: (determination?: string) => string;
}

export const PastAnalysesList: React.FC<PastAnalysesListProps> = ({
  isLoading,
  pastAnalyses,
  onViewAnalysis,
  onCreateNew,
  getDeterminationColorScheme,
}) => {
  const { isDarkMode } = useThemeContext();

  // Map determination color scheme to badge classes
  const getDeterminationBadgeClass = (determination?: string) => {
    const scheme = getDeterminationColorScheme(determination);
    const colorMap: Record<string, string> = {
      green:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      orange:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colorMap[scheme] || colorMap.gray;
  };

  if (isLoading) {
    return (
      <LoadingState
        variant="spinner"
        message="Loading past analyses..."
        minHeight="200px"
      />
    );
  }

  if (!pastAnalyses || pastAnalyses.length === 0) {
    return (
      <Card
        className={cn(
          'border',
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        )}
      >
        <CardContent className="py-6">
          <div className="flex flex-col items-center space-y-3">
            <p
              className={cn(
                'text-lg',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              No past analyses for this search
            </p>
            <Button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <FiFileText className="w-4 h-4" />
              Create First Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border h-full flex flex-col',
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      )}
    >
      <CardHeader
        className={cn(
          'py-4 flex-shrink-0',
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        )}
      >
        <div className="flex justify-between items-center">
          <h2
            className={cn(
              'text-md font-semibold',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}
          >
            Past Analyses for This Search
          </h2>
          <Button
            size="sm"
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <FiFileText className="w-4 h-4" />
            Create New Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          className="h-full overflow-y-auto p-4"
          style={{
            scrollbarWidth: 'thin',
            msOverflowStyle: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex flex-col space-y-3">
            {pastAnalyses.map(analysis => (
              <div
                key={analysis.id}
                className={cn(
                  'p-4 border rounded-md cursor-pointer transition-colors',
                  isDarkMode
                    ? 'border-gray-600 hover:bg-gray-800'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
                onClick={() => onViewAnalysis(analysis.analysis)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <FiClock
                        className={cn(
                          'w-4 h-4',
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        )}
                      />
                      <p
                        className={cn(
                          'text-sm',
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        )}
                      >
                        {format(
                          new Date(analysis.createdAt),
                          'MMM dd, yyyy h:mm a'
                        )}
                      </p>
                    </div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      )}
                    >
                      References:{' '}
                      {analysis.referenceNumbers
                        .map(ref => ref.replace(/-/g, ''))
                        .join(', ')}
                    </p>
                    <Badge
                      className={cn(
                        'text-xs w-fit',
                        getDeterminationBadgeClass(
                          analysis.analysis.patentabilityDetermination
                        )
                      )}
                    >
                      {analysis.analysis.patentabilityDetermination ||
                        'Unknown'}
                    </Badge>
                  </div>
                  <FiChevronRight
                    className={cn(
                      'w-5 h-5',
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
