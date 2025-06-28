import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isSidebarCollapsed: boolean;
  isSidebarHidden: boolean;
  toggleSidebar: () => void;
  toggleSidebarVisibility: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application to share sidebar state
 */
export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}) => {
  // Simple React state - no localStorage needed!
  // Sidebar defaults to expanded (false) and visible (false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarHidden(prev => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarCollapsed,
        isSidebarHidden,
        toggleSidebar,
        toggleSidebarVisibility,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Custom hook to use the sidebar context
 */
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
