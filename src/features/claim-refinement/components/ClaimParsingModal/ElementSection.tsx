import React from 'react';
import { Info, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ElementSectionProps } from './types';

const ElementSection: React.FC<ElementSectionProps> = ({
  editableParsedElements,
  handleElementLabelChange,
  handleElementEmphasisToggle,
  handleElementTextChange,
  handleRemoveElement,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Select Elements to Emphasize
        </h3>
        <p
          className={cn(
            'text-sm mb-4',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          We have parsed your claim into its elements. Please check any that you
          believe are particularly novel or need deeper coverage in the search.
          The system will still consider the entire claim, but the checked
          elements will receive extra emphasis in semantic queries.
        </p>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md mb-4">
          <p className="text-sm italic flex items-start">
            <Info className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
            We will search for the entire claim, focusing on the emphasized
            elements in our semantic queries.
          </p>
        </div>
      </div>

      <TooltipProvider>
        <div className="flex flex-col gap-3 w-full">
          {editableParsedElements.map((element, index) => (
            <div
              key={index}
              className={cn(
                'p-4 border rounded-md',
                isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
                element.emphasized
                  ? 'border-blue-400'
                  : isDarkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <Input
                    value={element.label}
                    onChange={e =>
                      handleElementLabelChange(index, e.target.value)
                    }
                    className="font-bold w-auto max-w-[150px] h-8"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`emphasis-${index}`} className="text-xs">
                        Emphasized
                      </Label>
                      <Switch
                        id={`emphasis-${index}`}
                        checked={element.emphasized}
                        onCheckedChange={() =>
                          handleElementEmphasisToggle(index)
                        }
                      />
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleRemoveElement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove this element from search</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <Textarea
                  value={element.text}
                  onChange={e => handleElementTextChange(index, e.target.value)}
                  className="min-h-[60px] resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ElementSection;
