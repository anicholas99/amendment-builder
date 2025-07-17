import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectDashboardHeaderProps {
  projectCount: number;
  onOpenNewProjectModal: () => void;
  tenantName?: string;
}

export const ProjectDashboardHeader: React.FC<ProjectDashboardHeaderProps> = ({
  projectCount,
  onOpenNewProjectModal,
  tenantName,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="w-full max-w-full mb-6">
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-foreground">
            Projects Dashboard{tenantName ? ` (${tenantName})` : ''}
          </h1>
          <p className="text-base text-muted-foreground">
            Manage your invention projects and generate patent documents
          </p>
        </div>
        <div className="mt-4">
          <div className="flex flex-row items-center space-x-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-xl font-semibold text-foreground">
                {projectCount}
              </p>
            </div>
            <Button
              onClick={onOpenNewProjectModal}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="default"
            >
              <FiPlus className="mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
