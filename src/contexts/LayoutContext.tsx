import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface LayoutContextType {
  mainPanelWidth: number | string;
  setMainPanelWidth: (width: number | string) => void;
  isProductivityMode: boolean;
  toggleProductivityMode: () => void;
  isHeaderHidden: boolean;
  toggleHeaderVisibility: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages layout settings across the application
 * Stores panel width as percentage for responsive behavior across different screen sizes
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  // Initialize with localStorage value or default to 50%
  const [mainPanelWidth, setMainPanelWidth] = useState<number | string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mainPanelWidth');
      // Ensure we always use percentage for responsive behavior
      if (saved && saved.endsWith('%')) {
        return saved;
      }
    }
    return '50%';
  });

  // Productivity mode state with localStorage persistence
  const [isProductivityMode, setIsProductivityMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productivityMode');
      return saved === 'true';
    }
    return false;
  });

  // Header visibility state with localStorage persistence
  const [isHeaderHidden, setIsHeaderHidden] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('headerHidden');
      return saved === 'true';
    }
    return false;
  });

  // Persist main panel width preference
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof mainPanelWidth === 'string' &&
      mainPanelWidth.endsWith('%')
    ) {
      localStorage.setItem('mainPanelWidth', mainPanelWidth);
    }
  }, [mainPanelWidth]);

  // Persist productivity mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('productivityMode', isProductivityMode.toString());
    }
  }, [isProductivityMode]);

  // Persist header visibility preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('headerHidden', isHeaderHidden.toString());
    }
  }, [isHeaderHidden]);

  const toggleProductivityMode = () => {
    setIsProductivityMode(prev => !prev);
  };

  const toggleHeaderVisibility = () => {
    setIsHeaderHidden(prev => !prev);
  };

  return (
    <LayoutContext.Provider
      value={{
        mainPanelWidth,
        setMainPanelWidth,
        isProductivityMode,
        toggleProductivityMode,
        isHeaderHidden,
        toggleHeaderVisibility,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * Hook to use the layout context
 * @returns LayoutContextType with current layout settings
 */
export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
