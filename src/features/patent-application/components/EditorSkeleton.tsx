import React from 'react';
import { LoadingState } from '@/components/common/LoadingState';

interface EditorSkeletonProps {
  message?: string;
}

export const EditorSkeleton: React.FC<EditorSkeletonProps> = ({ 
  message = "Loading patent content..." 
}) => {
  return (
    <div className="flex-1 p-4">
      <LoadingState
        variant="spinner"
        message={message}
        minHeight="100%"
        size="md"
      />
    </div>
  );
};
