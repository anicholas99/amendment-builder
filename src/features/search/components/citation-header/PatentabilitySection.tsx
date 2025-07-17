import React from 'react';
import { FiBarChart2, FiRefreshCw, FiX } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface PatentabilitySectionProps {
  showPatentabilityDashboard?: boolean;
  patentabilityScore?: number | null;
  onTogglePatentability?: (isEnabled: boolean) => void;
  onRunPatentabilityAnalysis?: () => void;
  onCombinedAnalysis?: () => void;
  hasReferences: boolean;
}

export function PatentabilitySection({
  showPatentabilityDashboard = false,
  patentabilityScore,
  onTogglePatentability,
  onRunPatentabilityAnalysis,
  onCombinedAnalysis,
  hasReferences,
}: PatentabilitySectionProps) {
  const { isDarkMode } = useThemeContext();

  if (!hasReferences) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 65)
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 50)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="flex items-center gap-1 mr-3">
      {/* Always show score badge when dashboard is hidden and we have a patentability score value */}
      {!showPatentabilityDashboard && patentabilityScore !== undefined && (
        <div className="flex items-center gap-2 mr-1">
          <Badge
            className={cn(
              'flex items-center gap-1 p-1',
              getScoreColor(patentabilityScore ?? 0)
            )}
          >
            <FiBarChart2 className="w-3 h-3" />
            <span>Patentability: {patentabilityScore ?? 0}/100</span>
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRunPatentabilityAnalysis}
            className={cn(
              'flex items-center gap-1 px-2 py-1 h-6',
              isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            )}
            title="Re-analyze patentability"
          >
            <FiRefreshCw className="w-3 h-3" />
            Re-analyze
          </Button>
        </div>
      )}

      {/* Show Analysis Button - only when dashboard is hidden */}
      {!showPatentabilityDashboard && (
        <Button
          size="sm"
          className="ml-1 h-6 px-2 py-1 text-xs"
          onClick={onCombinedAnalysis}
        >
          Combined Analysis
        </Button>
      )}

      {/* Add Close button - visible when dashboard is shown */}
      {showPatentabilityDashboard && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onTogglePatentability && onTogglePatentability(false)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 h-6 mr-1',
            isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          )}
        >
          <FiX className="w-3 h-3" />
          Close
        </Button>
      )}

      {patentabilityScore !== null && patentabilityScore !== undefined && (
        <p
          className={cn(
            'text-sm font-medium ml-2',
            isDarkMode ? 'text-blue-300' : 'text-blue-700'
          )}
        >
          Patentability Score: {Math.round(patentabilityScore)}%
        </p>
      )}
    </div>
  );
}
