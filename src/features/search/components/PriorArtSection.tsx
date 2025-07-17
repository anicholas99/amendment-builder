import React from 'react';
import { cn } from '@/lib/utils';
import { FiExternalLink, FiTrash2, FiInfo } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThemeContext } from '@/contexts/ThemeContext';

interface PriorArtReference {
  id: string;
  title: string;
  url: string;
  description: string;
  relevance?: string[];
}

interface PriorArtSectionProps {
  priorArtReferences: PriorArtReference[];
  selectedPriorArt: string | null;
  onSelectPriorArt: (id: string | null) => void;
  onDeletePriorArt: (id: string) => void;
  onOpenPriorArtModal: () => void;
}

/**
 * Component for displaying and managing prior art references
 */
const PriorArtSection: React.FC<PriorArtSectionProps> = ({
  priorArtReferences,
  selectedPriorArt,
  onSelectPriorArt,
  onDeletePriorArt,
  onOpenPriorArtModal,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Prior Art References</h2>
        <Button variant="outline" onClick={onOpenPriorArtModal}>
          Add Reference
        </Button>
      </div>

      {priorArtReferences.length === 0 ? (
        <div
          className={cn(
            'p-4 border rounded-md',
            isDarkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-gray-50'
          )}
        >
          <p
            className={cn(
              'text-center',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            No prior art references added yet. Click "Add Reference" to add one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {priorArtReferences.map(reference => (
            <div
              key={reference.id}
              className={cn(
                'p-4 border rounded-md shadow-sm cursor-pointer transition-colors',
                selectedPriorArt === reference.id
                  ? isDarkMode
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-blue-50 border-blue-300'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-blue-300'
              )}
              onClick={() =>
                onSelectPriorArt(
                  selectedPriorArt === reference.id ? null : reference.id
                )
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold">{reference.title}</h3>

                  {reference.url && (
                    <div className="flex items-center gap-1">
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        {reference.url.substring(0, 50)}
                        {reference.url.length > 50 ? '...' : ''}
                      </a>
                      <FiExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  )}

                  <p
                    className={cn(
                      'text-sm line-clamp-2',
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    {reference.description}
                  </p>

                  {reference.relevance && reference.relevance.length > 0 && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FiInfo
                              className={cn(
                                'w-4 h-4',
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Relevance to the invention</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {reference.relevance.map((item, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  onClick={e => {
                    e.stopPropagation();
                    onDeletePriorArt(reference.id);
                  }}
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorArtSection;
