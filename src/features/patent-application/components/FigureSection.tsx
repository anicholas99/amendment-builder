import React from 'react';
import { Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface Figure {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'diagram' | 'mermaid' | 'reactflow';
  elements?: { id: string; label: string; description: string }[];
}

interface FigureSectionProps {
  figures: Figure[];
  onAddFigure: () => void;
  onEditFigure: (id: string) => void;
  onViewFigure: (id: string) => void;
  FigureCarouselComponent: React.ComponentType<{ figures: Figure[] }>;
  ReferenceNumeralsComponent: React.ComponentType<{
    elements: Record<string, string>;
  }>;
}

/**
 * Component for displaying and managing figures
 */
const FigureSection: React.FC<FigureSectionProps> = ({
  figures,
  onAddFigure,
  onEditFigure,
  onViewFigure,
  FigureCarouselComponent,
  ReferenceNumeralsComponent,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Figures</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddFigure}>
            <Plus className="h-4 w-4 mr-2" />
            Add Figure
          </Button>
        </div>
      </div>

      <Tabs defaultValue="carousel" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="carousel">Carousel View</TabsTrigger>
          <TabsTrigger value="labels">Element Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="carousel" className="pt-4">
          <FigureCarouselComponent figures={figures} />

          {figures.length > 0 && (
            <div className="flex justify-center mt-4 gap-2">
              {figures.map((figure, index) => (
                <Button
                  key={figure.id}
                  size="sm"
                  variant={index === 0 ? 'default' : 'outline'}
                  onClick={() => onViewFigure(figure.id)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="labels" className="pt-4">
          {figures.length === 0 ? (
            <div
              className={cn(
                'p-4 border rounded-md text-center',
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No figures added yet. Add a figure to see its element labels
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {figures.map(figure => (
                <div
                  key={figure.id}
                  className={cn(
                    'p-4 border rounded-md shadow-sm',
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  )}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{figure.title}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditFigure(figure.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {figure.elements && figure.elements.length > 0 ? (
                    <ReferenceNumeralsComponent
                      elements={figure.elements.reduce(
                        (acc, el) => {
                          acc[el.id] = el.description;
                          return acc;
                        },
                        {} as Record<string, string>
                      )}
                    />
                  ) : (
                    <p
                      className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                    >
                      No element labels for this figure.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FigureSection;
