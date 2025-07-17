import React from 'react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';

/**
 * Represents an issue found in the document
 */
interface Issue {
  type: 'error' | 'warning';
  message: string;
  location: string;
  suggestion?: string;
}

interface IssueIndicatorProps {
  location: string;
  issues: Issue[];
  onApplyFix: (issue: Issue) => void;
}

/**
 * Displays an indicator for issues found in a specific location
 * with a popover showing details and options to fix
 */
const IssueIndicator: React.FC<IssueIndicatorProps> = ({
  location,
  issues,
  onApplyFix,
}) => {
  // Don't render anything if there are no issues
  if (issues.length === 0) return null;

  const { isDarkMode } = useThemeContext();
  const hasErrors = issues.some(issue => issue.type === 'error');
  const issueCount = issues.length;
  const issueType = hasErrors ? 'error' : 'warning';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'ml-2 h-8 w-8 p-0 hover:scale-105 transition-transform',
            hasErrors
              ? 'text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
              : 'text-yellow-500 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
            'focus:ring-2 focus:ring-offset-2',
            hasErrors
              ? 'focus:ring-red-200 dark:focus:ring-red-700'
              : 'focus:ring-yellow-200 dark:focus:ring-yellow-700'
          )}
          aria-label={`${issueCount} ${issueType} ${issueCount === 1 ? 'issue' : 'issues'} at ${location}`}
          data-testid={`issue-indicator-${location}`}
        >
          <FiAlertCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-80 shadow-lg focus:outline-none',
          hasErrors
            ? 'border-red-200 dark:border-red-800'
            : 'border-yellow-200 dark:border-yellow-800'
        )}
        side="right"
        sideOffset={8}
      >
        <div
          className={cn(
            'rounded-t-md px-4 py-3 flex items-center font-bold',
            hasErrors
              ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
              : 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
          )}
        >
          <FiAlertCircle
            className={cn(
              'mr-2 h-4 w-4',
              hasErrors
                ? 'text-red-500 dark:text-red-400'
                : 'text-yellow-500 dark:text-yellow-400'
            )}
          />
          {issueCount} {issueCount === 1 ? 'Issue' : 'Issues'} Found at{' '}
          {location}
        </div>
        <div className="p-0">
          <div className="divide-y">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={cn(
                  'p-4',
                  issue.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900'
                    : 'bg-yellow-50 dark:bg-yellow-900'
                )}
                role="alertdialog"
                aria-labelledby={`issue-title-${index}`}
                aria-describedby={`issue-description-${index}`}
              >
                <p
                  className={cn(
                    'font-medium',
                    issue.type === 'error'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  )}
                  id={`issue-title-${index}`}
                >
                  {issue.message}
                </p>
                {issue.suggestion && (
                  <p
                    className={cn(
                      'text-sm mt-1',
                      issue.type === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    )}
                    id={`issue-description-${index}`}
                  >
                    Suggestion: {issue.suggestion}
                  </p>
                )}
                {issue.type === 'warning' && (
                  <Button
                    size="sm"
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    onClick={() => onApplyFix(issue)}
                    aria-label={`Apply fix for issue: ${issue.message}`}
                  >
                    Apply Fix
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(IssueIndicator);
export type { Issue, IssueIndicatorProps };
