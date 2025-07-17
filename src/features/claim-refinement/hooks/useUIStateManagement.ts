import { useReducer, useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';

// State shape - grouped by logical concerns
interface UIStateManagementState {
  // Tab state
  tab: {
    activeTab: string;
  };

  // Modal states
  modals: {
    isHelpOpen: boolean;
    isExportOpen: boolean;
    isSettingsOpen: boolean;
  };

  // Sidebar state
  sidebar: {
    isOpen: boolean;
    width: number;
  };

  // Loading state
  loading: {
    isLoading: boolean;
    message: string;
  };
}

// Action types
type UIStateManagementAction =
  // Tab actions
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  // Modal actions
  | { type: 'OPEN_HELP_MODAL' }
  | { type: 'CLOSE_HELP_MODAL' }
  | { type: 'OPEN_EXPORT_MODAL' }
  | { type: 'CLOSE_EXPORT_MODAL' }
  | { type: 'OPEN_SETTINGS_MODAL' }
  | { type: 'CLOSE_SETTINGS_MODAL' }
  // Sidebar actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'RESIZE_SIDEBAR'; payload: number }
  // Loading actions
  | { type: 'START_LOADING'; payload: string }
  | { type: 'STOP_LOADING' };

// Initial state
const initialState: UIStateManagementState = {
  tab: {
    activeTab: '0',
  },
  modals: {
    isHelpOpen: false,
    isExportOpen: false,
    isSettingsOpen: false,
  },
  sidebar: {
    isOpen: true,
    width: 300,
  },
  loading: {
    isLoading: false,
    message: '',
  },
};

// Reducer function
function uiStateManagementReducer(
  state: UIStateManagementState,
  action: UIStateManagementAction
): UIStateManagementState {
  switch (action.type) {
    // Tab actions
    case 'SET_ACTIVE_TAB':
      return { ...state, tab: { ...state.tab, activeTab: action.payload } };

    // Modal actions
    case 'OPEN_HELP_MODAL':
      return { ...state, modals: { ...state.modals, isHelpOpen: true } };
    case 'CLOSE_HELP_MODAL':
      return { ...state, modals: { ...state.modals, isHelpOpen: false } };
    case 'OPEN_EXPORT_MODAL':
      return { ...state, modals: { ...state.modals, isExportOpen: true } };
    case 'CLOSE_EXPORT_MODAL':
      return { ...state, modals: { ...state.modals, isExportOpen: false } };
    case 'OPEN_SETTINGS_MODAL':
      return { ...state, modals: { ...state.modals, isSettingsOpen: true } };
    case 'CLOSE_SETTINGS_MODAL':
      return { ...state, modals: { ...state.modals, isSettingsOpen: false } };

    // Sidebar actions
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen },
      };
    case 'RESIZE_SIDEBAR':
      // Ensure the width is within reasonable bounds
      const clampedWidth = Math.max(200, Math.min(500, action.payload));
      return { ...state, sidebar: { ...state.sidebar, width: clampedWidth } };

    // Loading actions
    case 'START_LOADING':
      return {
        ...state,
        loading: { isLoading: true, message: action.payload },
      };
    case 'STOP_LOADING':
      return { ...state, loading: { isLoading: false, message: '' } };

    default:
      return state;
  }
}

/**
 * Custom hook for managing UI state
 */
export const useUIStateManagement = () => {
  const [state, dispatch] = useReducer(uiStateManagementReducer, initialState);

  // Toast for notifications
  const toast = useToast();

  // Action creators - memoized for performance
  const setActiveTab = useCallback(
    (tab: string) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    []
  );

  const toggleSidebar = useCallback(
    () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    []
  );

  const resizeSidebar = useCallback(
    (width: number) => dispatch({ type: 'RESIZE_SIDEBAR', payload: width }),
    []
  );

  const startLoading = useCallback(
    (message: string = 'Loading...') =>
      dispatch({ type: 'START_LOADING', payload: message }),
    []
  );

  const stopLoading = useCallback(() => dispatch({ type: 'STOP_LOADING' }), []);

  /**
   * Open a modal
   * @param modalType The type of modal to open ('help', 'export', 'settings')
   */
  const openModal = useCallback((modalType: 'help' | 'export' | 'settings') => {
    switch (modalType) {
      case 'help':
        dispatch({ type: 'OPEN_HELP_MODAL' });
        break;
      case 'export':
        dispatch({ type: 'OPEN_EXPORT_MODAL' });
        break;
      case 'settings':
        dispatch({ type: 'OPEN_SETTINGS_MODAL' });
        break;
    }
  }, []);

  /**
   * Close a modal
   * @param modalType The type of modal to close ('help', 'export', 'settings')
   */
  const closeModal = useCallback(
    (modalType: 'help' | 'export' | 'settings') => {
      switch (modalType) {
        case 'help':
          dispatch({ type: 'CLOSE_HELP_MODAL' });
          break;
        case 'export':
          dispatch({ type: 'CLOSE_EXPORT_MODAL' });
          break;
        case 'settings':
          dispatch({ type: 'CLOSE_SETTINGS_MODAL' });
          break;
      }
    },
    []
  );

  /**
   * Show a notification toast
   * @param title The title of the toast
   * @param description The description of the toast
   * @param status The status of the toast (info, warning, success, error)
   * @param duration The duration of the toast in milliseconds
   */
  const showNotification = useCallback(
    (
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
    },
    [toast]
  );

  // Return flattened state for backward compatibility
  return {
    // Tab state
    activeTab: state.tab.activeTab,
    setActiveTab,

    // Modal states - maintain backward compatibility with original names
    isHelpModalOpen: state.modals.isHelpOpen,
    isExportModalOpen: state.modals.isExportOpen,
    isSettingsModalOpen: state.modals.isSettingsOpen,
    openModal,
    closeModal,

    // Sidebar states
    isSidebarOpen: state.sidebar.isOpen,
    sidebarWidth: state.sidebar.width,
    toggleSidebar,
    resizeSidebar,

    // Loading states
    isLoading: state.loading.isLoading,
    loadingMessage: state.loading.message,
    startLoading,
    stopLoading,

    // Notifications
    showNotification,
  };
};

export default useUIStateManagement;
