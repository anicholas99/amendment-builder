import React from 'react';
import { cn } from '@/lib/utils';
import { FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface CombinedAnalysisBreadcrumbProps {
  onBack: () => void;
}

export const CombinedAnalysisBreadcrumb: React.FC<
  CombinedAnalysisBreadcrumbProps
> = ({ onBack }) => {
  const { isDarkMode } = useThemeContext();

  return (
    <nav className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Citations
          </Button>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Citations</span>
            <FiChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              Combined Examiner Analysis
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
