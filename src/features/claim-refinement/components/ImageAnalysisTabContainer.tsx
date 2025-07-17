import React from 'react';
import { Separator } from '@/components/ui/separator';
import {
  FiImage,
  FiSearch,
  FiUploadCloud,
  FiEye,
  FiTarget,
  FiShield,
} from 'react-icons/fi';

interface ImageAnalysisTabContainerProps {
  projectId: string;
}

/**
 * Image Analysis tab container for visual prior art search
 * Currently displays "Coming Soon" message with feature preview
 */
const ImageAnalysisTabContainer: React.FC<ImageAnalysisTabContainerProps> = ({
  projectId,
}) => {
  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{
        scrollbarWidth: 'thin',
        msOverflowStyle: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center py-6">
          <FiImage className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Image Analysis
          </h2>
          <p className="text-sm text-muted-foreground italic">Coming Soon</p>
        </div>

        <Separator className="border-border" />

        {/* Feature Preview */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center px-4">
            Advanced computer vision analysis for patent figures and drawings
          </p>

          {/* Feature Cards */}
          <div className="space-y-3 mt-4">
            <div className="p-4 rounded-md bg-muted border border-border w-full">
              <div className="flex items-start space-x-3">
                <FiUploadCloud className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Upload & Analyze Figures
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload your invention drawings and automatically analyze
                    them for similar figures in existing patents
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-md bg-muted border border-border w-full">
              <div className="flex items-start space-x-3">
                <FiSearch className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Visual Prior Art Search
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Search patent databases using image similarity to find
                    visually similar technical drawings and diagrams
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-md bg-muted border border-border w-full">
              <div className="flex items-start space-x-3">
                <FiEye className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Element Detection
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatically identify and label key components in your
                    figures with reference numerals
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-md bg-muted border border-border w-full">
              <div className="flex items-start space-x-3">
                <FiTarget className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Modification Guidance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get AI-powered suggestions on how to modify your figures to
                    distinguish them from prior art
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-md bg-muted border border-border w-full">
              <div className="flex items-start space-x-3">
                <FiShield className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Patentability Assessment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Evaluate the visual distinctiveness of your figures compared
                    to existing patent drawings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-xs text-muted-foreground text-center mt-6 italic">
          This feature is under development and will be available in a future
          release
        </p>
      </div>
    </div>
  );
};

export default ImageAnalysisTabContainer;
