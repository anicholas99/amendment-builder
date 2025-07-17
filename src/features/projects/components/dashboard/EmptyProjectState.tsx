import React from 'react';
import { Button } from '@/components/ui/button';
import {
  FiFileText,
  FiPlus,
  FiZap,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';
import { useThemeContext } from '../../../../contexts/ThemeContext';

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

interface EmptyProjectStateProps {
  onOpenNewProjectModal: () => void;
}

export const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({
  onOpenNewProjectModal,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="flex justify-center items-center p-12 min-h-[400px]">
      <div className="text-center max-w-xl w-full">
        <div className="flex flex-col items-center space-y-6">
          {/* Clean Icon Design */}
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <FiFileText className="text-2xl text-blue-600 dark:text-blue-400" />
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ready to Create Your First Project?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Transform your innovative ideas into comprehensive patent
              applications with our AI-powered tools.
            </p>
          </div>

          {/* Simple feature highlights */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md text-center">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto">
                <FiZap className="text-blue-600 dark:text-blue-400 text-sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                AI-Powered
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                <FiTarget className="text-green-600 dark:text-green-400 text-sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Precise Claims
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto">
                <FiTrendingUp className="text-purple-600 dark:text-purple-400 text-sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Fast Process
              </p>
            </div>
          </div>

          {/* Clean Create Button */}
          <Button
            onClick={onOpenNewProjectModal}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 px-6 py-2"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Create Your First Project
          </Button>

          {/* Simple helpful text */}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Get started in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};
