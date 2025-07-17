import React from 'react';
import { FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import PriorArtSelector from './PriorArtSelector';
import { motion } from 'framer-motion';

type SavedPriorArt = {
  id: string;
  patentNumber: string;
  title?: string | null;
  abstract?: string | null;
  authors?: string | null;
  year?: string | null;
  notes?: string | null;
  claim1?: string | null;
  summary?: string | null;
};

interface PatentGenerationPlaceholderProps {
  onGenerate: (selectedRefs?: string[]) => void;
  isGenerating: boolean;
  generationProgress?: number;
  priorArtItems?: SavedPriorArt[];
}

const PatentGenerationPlaceholder: React.FC<
  PatentGenerationPlaceholderProps
> = ({
  onGenerate,
  isGenerating,
  generationProgress = 0,
  priorArtItems = [],
}) => {
  const { isDarkMode } = useThemeContext();
  const [includePriorArt, setIncludePriorArt] = React.useState(false);
  const [selectedPriorArtIds, setSelectedPriorArtIds] = React.useState<
    string[]
  >([]);

  // Helper function to get progress text based on percentage
  const getProgressText = (progress: number) => {
    if (progress < 5) return 'Starting generation process...';
    if (progress < 15) return 'Analyzing invention details...';
    if (progress < 25) return 'Drafting field of invention...';
    if (progress < 35) return 'Writing background section...';
    if (progress < 50) return 'Creating detailed summary...';
    if (progress < 60) return 'Processing figure descriptions...';
    if (progress < 75) return 'Generating technical description...';
    if (progress < 85) return 'Formatting claims...';
    if (progress < 95) return 'Finalizing abstract...';
    if (progress < 97) return 'Compiling patent sections...';
    if (progress < 99) return 'Preparing document for review...';
    if (progress < 100) return 'Finalizing patent application...';
    return 'Patent application ready!';
  };

  // Calculate estimated time remaining
  const getTimeEstimate = (progress: number) => {
    if (progress === 0) return 'about 1 minute';
    if (progress === 100) return 'ready';
    if (progress >= 95) return 'a few seconds'; // Content loading phase

    const totalSeconds = 65;
    const remainingSeconds = Math.max(
      0,
      ((100 - progress) / 100) * totalSeconds
    );

    if (remainingSeconds < 5) return 'a few seconds';
    if (remainingSeconds < 30) return `${Math.round(remainingSeconds)} seconds`;
    return `${Math.round(remainingSeconds / 10) * 10} seconds`;
  };

  const handleGenerate = () => {
    // Pass selected prior art IDs only if the user chose to include them
    const refsToInclude =
      includePriorArt && selectedPriorArtIds.length > 0
        ? selectedPriorArtIds
        : undefined;

    onGenerate(refsToInclude);
  };

  if (isGenerating) {
    // Generation in progress view
    return (
      <div
        className={cn(
          'h-full flex items-center justify-center p-4 sm:p-6 md:p-8',
          'transition-opacity duration-300 ease-in-out',
          generationProgress >= 100 ? 'opacity-80' : 'opacity-100'
        )}
      >
        <div className="flex flex-col items-center gap-6 max-w-full sm:max-w-[450px] text-center">
          <div className="relative">
            <FileText
              className={cn(
                'h-[60px] w-[60px] sm:h-20 sm:w-20 text-blue-500',
                'animate-pulse'
              )}
            />
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2
              className={cn(
                'text-lg sm:text-xl font-semibold',
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              )}
            >
              Generating Your Patent Application
            </h2>
            <p
              className={cn(
                'text-sm',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              {getProgressText(generationProgress)}
            </p>
          </div>

          {/* Animated progress bar */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Progress
              value={generationProgress}
              size="lg"
              className="h-3 bg-gray-100 dark:bg-gray-800"
              animated={true}
              showShimmer={true}
              colorScheme="blue"
            />
          </motion.div>

          <div className="flex flex-col gap-2 text-center">
            <motion.p
              className={cn(
                'text-xs',
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              Estimated time: {getTimeEstimate(generationProgress)}
            </motion.p>
            {generationProgress >= 95 && (
              <motion.p
                className={cn(
                  'text-xs font-medium',
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                Preparing your document...
              </motion.p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Ready to generate view - top-aligned to ensure button visibility
  return (
    <div className="h-full p-2 sm:p-3 md:p-4 pt-4 sm:pt-6 md:pt-8">
      <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 max-w-full sm:max-w-[500px] md:max-w-[600px] w-full mx-auto text-center">
        <FileText
          className={cn(
            'h-10 w-10 sm:h-[50px] sm:w-[50px] md:h-[60px] md:w-[60px] lg:h-[70px] lg:w-[70px]',
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          )}
        />

        <div className="flex flex-col gap-1 sm:gap-2">
          <h2
            className={cn(
              'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            )}
          >
            Ready to Generate Patent
          </h2>
          <p
            className={cn(
              'text-xs sm:text-sm md:text-base px-2',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            Transform your technology details and claims into a complete,
            professionally formatted patent application.
          </p>
        </div>

        {/* Prior Art Section - Improved design */}
        {priorArtItems.length > 0 && (
          <Card
            className={cn(
              'w-full transition-all duration-200 overflow-hidden',
              includePriorArt ? 'border-2 border-blue-300' : 'border',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            )}
          >
            <CardContent className="py-3 sm:py-4 px-3 sm:px-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-prior-art"
                    checked={includePriorArt}
                    onCheckedChange={checked =>
                      setIncludePriorArt(checked as boolean)
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor="include-prior-art"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={cn(
                        'text-sm sm:text-sm md:text-base font-medium',
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      )}
                    >
                      Include prior art references
                    </span>
                    <Info
                      className={cn(
                        'h-3 w-3 sm:h-3.5 sm:w-3.5',
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      )}
                    />
                  </label>
                </div>

                {includePriorArt && (
                  <>
                    <p
                      className={cn(
                        'text-xs sm:text-xs pl-5 sm:pl-6',
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      Add saved prior art references to strengthen your patent
                      by demonstrating novelty and providing technical context.
                    </p>
                    <div
                      className={cn(
                        'rounded-md border overflow-hidden',
                        isDarkMode
                          ? 'bg-gray-900 border-gray-700'
                          : 'bg-white border-gray-200'
                      )}
                    >
                      <PriorArtSelector
                        priorArtItems={priorArtItems}
                        selectedIds={selectedPriorArtIds}
                        onChange={setSelectedPriorArtIds}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          size="default"
          onClick={handleGenerate}
          className={cn(
            'w-full max-w-[260px] sm:max-w-[280px] md:max-w-[300px]',
            'h-9 sm:h-10 md:h-11',
            'text-sm sm:text-base',
            'mt-2'
          )}
        >
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px] mr-2" />
          Generate Patent Application
        </Button>
      </div>
    </div>
  );
};

export default PatentGenerationPlaceholder;
