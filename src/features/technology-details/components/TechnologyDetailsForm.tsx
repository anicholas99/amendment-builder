import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';

interface TechnologyDetail {
  id: string;
  title: string;
  description: string;
  category?: string;
}

interface TechnologyDetailsFormProps {
  details: TechnologyDetail[];
  onAddDetail: () => void;
  onUpdateDetail: (id: string, field: string, value: string) => void;
  onDeleteDetail: (id: string) => void;
  inventionTitle: string;
  inventionDescription: string;
  onUpdateInvention: (field: string, value: string) => void;
  problemSolved: string;
  onUpdateProblemSolved: (value: string) => void;
  advantages: string[];
  onAddAdvantage: () => void;
  onUpdateAdvantage: (index: number, value: string) => void;
  onDeleteAdvantage: (index: number) => void;
}

/**
 * Form component for entering and managing technology details
 */
const TechnologyDetailsForm: React.FC<TechnologyDetailsFormProps> = ({
  details,
  onAddDetail,
  onUpdateDetail,
  onDeleteDetail,
  inventionTitle,
  inventionDescription,
  onUpdateInvention,
  problemSolved,
  onUpdateProblemSolved,
  advantages,
  onAddAdvantage,
  onUpdateAdvantage,
  onDeleteAdvantage,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="w-full p-4">
      <div className="space-y-6">
        {/* Basic Invention Information */}
        <div>
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invention-title">Invention Title</Label>
              <Input
                id="invention-title"
                value={inventionTitle}
                onChange={e => onUpdateInvention('title', e.target.value)}
                placeholder="Enter the title of your invention"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invention-description">
                Invention Description
              </Label>
              <Textarea
                id="invention-description"
                value={inventionDescription}
                onChange={e => onUpdateInvention('description', e.target.value)}
                placeholder="Provide a brief description of your invention"
                className="min-h-[100px] resize-y"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Problem Solved */}
        <div>
          <h2 className="text-xl font-bold mb-4">Problem Solved</h2>

          <div className="space-y-2">
            <Label htmlFor="problem-solved">
              What problem does your invention solve?
            </Label>
            <Textarea
              id="problem-solved"
              value={problemSolved}
              onChange={e => onUpdateProblemSolved(e.target.value)}
              placeholder="Describe the problem that your invention addresses"
              className="min-h-[100px] resize-y"
            />
          </div>
        </div>

        <Separator />

        {/* Advantages */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Advantages</h2>
            <Button
              variant="outline"
              onClick={onAddAdvantage}
              className="flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Advantage</span>
            </Button>
          </div>

          <div className="space-y-3">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                >
                  {index + 1}
                </Badge>
                <Input
                  value={advantage}
                  onChange={e => onUpdateAdvantage(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteAdvantage(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50"
                >
                  <FiTrash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {advantages.length === 0 && (
              <div
                className={cn(
                  'p-4 border rounded-md text-center',
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800/50 text-gray-400'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                )}
              >
                No advantages added yet. Click "Add Advantage" to add one.
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Technical Details */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Technical Details</h2>
            <Button
              variant="outline"
              onClick={onAddDetail}
              className="flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Detail</span>
            </Button>
          </div>

          <div className="space-y-4">
            {details.map(detail => (
              <div
                key={detail.id}
                className="p-4 border rounded-md shadow-sm bg-card border-border"
              >
                <div className="flex justify-between items-start mb-2 space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`detail-title-${detail.id}`}>Title</Label>
                    <Input
                      id={`detail-title-${detail.id}`}
                      value={detail.title}
                      onChange={e =>
                        onUpdateDetail(detail.id, 'title', e.target.value)
                      }
                      placeholder="Detail title"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteDetail(detail.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 mt-7"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mt-3">
                  <Label htmlFor={`detail-description-${detail.id}`}>
                    Description
                  </Label>
                  <Textarea
                    id={`detail-description-${detail.id}`}
                    value={detail.description}
                    onChange={e =>
                      onUpdateDetail(detail.id, 'description', e.target.value)
                    }
                    placeholder="Detailed description"
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {detail.category && (
                  <div className="space-y-2 mt-3">
                    <Label htmlFor={`detail-category-${detail.id}`}>
                      Category
                    </Label>
                    <Input
                      id={`detail-category-${detail.id}`}
                      value={detail.category}
                      onChange={e =>
                        onUpdateDetail(detail.id, 'category', e.target.value)
                      }
                      placeholder="Category (optional)"
                    />
                  </div>
                )}
              </div>
            ))}

            {details.length === 0 && (
              <div
                className={cn(
                  'p-4 border rounded-md text-center',
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800/50 text-gray-400'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                )}
              >
                No technical details added yet. Click "Add Detail" to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyDetailsForm;
