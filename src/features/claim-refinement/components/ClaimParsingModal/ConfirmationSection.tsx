import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ConfirmationSectionProps } from './types';

const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  emphasizedElementsCount,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h3 className="text-lg font-semibold">Search Executed!</h3>
      <p
        className={cn(
          'text-center',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}
      >
        Your search has been executed with {emphasizedElementsCount} emphasized
        elements.
        <br />
        The results will be available shortly.
      </p>
    </div>
  );
};

export default ConfirmationSection;
