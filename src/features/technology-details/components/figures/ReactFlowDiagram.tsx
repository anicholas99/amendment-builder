import React from 'react';
import { cn } from '@/lib/utils';

interface ReactFlowDiagramProps {
  className?: string;
  children?: React.ReactNode;
  initialNodes?: unknown[];
  initialEdges?: unknown[];
  title?: string;
  readOnly?: boolean;
  onDiagramChange?: (nodes: unknown[], edges: unknown[]) => void;
}

export const ReactFlowDiagram: React.FC<ReactFlowDiagramProps> = ({
  className,
  children,
  initialNodes = [],
  initialEdges = [],
  title,
  readOnly,
  onDiagramChange,
}) => {
  // Call onDiagramChange with initial data when component mounts
  React.useEffect(() => {
    if (onDiagramChange) {
      onDiagramChange(initialNodes, initialEdges);
    }
  }, [initialNodes, initialEdges, onDiagramChange]);

  return (
    <div
      className={cn(
        'w-full h-full bg-gray-50 dark:bg-gray-900',
        'border border-border rounded-lg',
        'flex items-center justify-center',
        className
      )}
    >
      {children || (
        <div className="text-center p-8">
          {title && (
            <h3 className="text-lg font-medium text-foreground mb-2">
              {title}
            </h3>
          )}
          <p className="text-muted-foreground text-sm">
            React Flow diagram placeholder
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Diagram components will be rendered here
            {readOnly && ' (Read Only)'}
          </p>
        </div>
      )}
    </div>
  );
};
