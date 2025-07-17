import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProjectTransitionContextType {
  isTransitioning: boolean;
  transitionData: {
    projectName?: string;
    targetView?: string;
  } | null;
  startTransition: (projectName?: string, targetView?: string) => void;
  endTransition: () => void;
}

const ProjectTransitionContext = createContext<
  ProjectTransitionContextType | undefined
>(undefined);

export const ProjectTransitionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    projectName?: string;
    targetView?: string;
  } | null>(null);

  const startTransition = useCallback(
    (projectName?: string, targetView?: string) => {
      setIsTransitioning(true);
      setTransitionData({ projectName, targetView });
    },
    []
  );

  const endTransition = useCallback(() => {
    // Add a small delay before ending to ensure smooth transition
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionData(null);
    }, 300);
  }, []);

  return (
    <ProjectTransitionContext.Provider
      value={{
        isTransitioning,
        transitionData,
        startTransition,
        endTransition,
      }}
    >
      {children}
    </ProjectTransitionContext.Provider>
  );
};

export const useProjectTransition = () => {
  const context = useContext(ProjectTransitionContext);
  if (!context) {
    throw new Error(
      'useProjectTransition must be used within ProjectTransitionProvider'
    );
  }
  return context;
};
