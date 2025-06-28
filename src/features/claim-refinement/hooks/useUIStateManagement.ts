import { useState } from 'react';
import { useToast } from '@/ui/hooks/useToast';

/**
 * Custom hook for managing UI state
 */
export const useUIStateManagement = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState<string>('0');

  // Modal states
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Toast for notifications
  const toast = useToast();

  /**
   * Show a notification toast
   * @param title The title of the toast
   * @param description The description of the toast
   * @param status The status of the toast (info, warning, success, error)
   * @param duration The duration of the toast in milliseconds
   */
  const showNotification = (
    title: string,
    description: string,
    status: 'info' | 'warning' | 'success' | 'error' = 'info',
    duration: number = 5000
  ) => {
    toast({
      title,
      description,
      status,
      duration,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  /**
   * Toggle the sidebar open/closed
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * Resize the sidebar
   * @param width The new width of the sidebar
   */
  const resizeSidebar = (width: number) => {
    // Ensure the width is within reasonable bounds
    const clampedWidth = Math.max(200, Math.min(500, width));
    setSidebarWidth(clampedWidth);
  };

  /**
   * Start a loading operation
   * @param message The loading message to display
   */
  const startLoading = (message: string = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  /**
   * Stop a loading operation
   */
  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  /**
   * Open a modal
   * @param modalType The type of modal to open ('help', 'export', 'settings')
   */
  const openModal = (modalType: 'help' | 'export' | 'settings') => {
    switch (modalType) {
      case 'help':
        setIsHelpModalOpen(true);
        break;
      case 'export':
        setIsExportModalOpen(true);
        break;
      case 'settings':
        setIsSettingsModalOpen(true);
        break;
    }
  };

  /**
   * Close a modal
   * @param modalType The type of modal to close ('help', 'export', 'settings')
   */
  const closeModal = (modalType: 'help' | 'export' | 'settings') => {
    switch (modalType) {
      case 'help':
        setIsHelpModalOpen(false);
        break;
      case 'export':
        setIsExportModalOpen(false);
        break;
      case 'settings':
        setIsSettingsModalOpen(false);
        break;
    }
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Modal states
    isHelpModalOpen,
    isExportModalOpen,
    isSettingsModalOpen,
    openModal,
    closeModal,

    // Sidebar states
    isSidebarOpen,
    sidebarWidth,
    toggleSidebar,
    resizeSidebar,

    // Loading states
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,

    // Notifications
    showNotification,
  };
};

export default useUIStateManagement;
