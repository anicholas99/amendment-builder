import React from 'react';
import { Info, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { QuerySectionProps } from './types';

const QuerySection: React.FC<QuerySectionProps> = React.memo(
  ({
    editableSearchQueries,
    handleQueryChange,
    onCopy,
    hasCopied,
    copyQuery,
    copiedQueryIndex,
  }) => {
    const { isDarkMode } = useThemeContext();

    return (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Review Search Queries</h3>
          <p
            className={cn(
              'text-sm mb-4',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            Based on your emphasized elements, we've generated the following
            search queries. You can edit these queries before executing the
            search.
          </p>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md mb-4">
            <p className="text-sm italic flex items-start">
              <Info className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
              The emphasized elements have been given priority in these queries
              with additional synonyms and variations. The final query combines
              all aspects of the claim.
            </p>
          </div>

          <Button size="sm" onClick={onCopy} variant="outline" className="mb-4">
            {hasCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied all queries!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy all queries
              </>
            )}
          </Button>
        </div>

        {editableSearchQueries.map((query, index) => (
          <div
            key={index}
            className={cn(
              'p-4 border rounded-md relative transition-shadow hover:shadow-md',
              isDarkMode
                ? 'bg-green-900/20 border-green-700'
                : 'bg-green-50 border-green-200'
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <Badge
                variant="secondary"
                className={cn(
                  'px-2 py-1',
                  isDarkMode
                    ? 'bg-green-800 text-green-200'
                    : 'bg-green-100 text-green-700'
                )}
              >
                {index === editableSearchQueries.length - 1
                  ? 'Consolidated Query'
                  : `Query ${index + 1}`}
              </Badge>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyQuery(index, query)}
                className={cn(copiedQueryIndex === index && 'text-green-600')}
              >
                {copiedQueryIndex === index ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <Textarea
              value={query}
              onChange={e => handleQueryChange(index, e.target.value)}
              className={cn(
                'resize-y',
                index === editableSearchQueries.length - 1
                  ? 'min-h-[200px]'
                  : 'min-h-[100px] max-h-[200px]'
              )}
              rows={Math.max(3, query.split('\n').length)}
              onInput={e => {
                // Auto-resize the textarea to fit content
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>
        ))}
      </div>
    );
  }
);

QuerySection.displayName = 'QuerySection';

export default QuerySection;
