import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  mainPanelWidth: number | string;
  setMainPanelWidth: (width: number | string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages layout settings across the application
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  // Set an even default (50%) so the main and sidebar panels start equally sized
  const [mainPanelWidth, setMainPanelWidth] = useState<number | string>('50%');

  return (
    <LayoutContext.Provider
      value={{
        mainPanelWidth,
        setMainPanelWidth,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * Custom hook to use the layout context
 */
export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
