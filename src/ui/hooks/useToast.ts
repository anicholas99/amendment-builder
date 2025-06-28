import { useToast as useChakraToast } from '@chakra-ui/react';

export interface ToastOptions {
  /**
   * The title of the toast
   */
  title?: string;

  /**
   * The description/message of the toast
   */
  description?: string;

  /**
   * The status/type of the toast
   */
  status?: 'success' | 'error' | 'warning' | 'info';

  /**
   * How long the toast should remain visible (in ms)
   */
  duration?: number;

  /**
   * Whether the toast can be dismissed by clicking the close button
   */
  isClosable?: boolean;

  /**
   * Position where the toast should appear
   */
  position?:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right';

  /**
   * Custom ID for the toast (useful for preventing duplicates)
   */
  id?: string;

  /**
   * Custom variant
   */
  variant?: 'solid' | 'subtle' | 'left-accent' | 'top-accent';
}

export interface ToastInstance {
  /**
   * Show a toast notification
   */
  (options: ToastOptions): string | number | undefined;

  /**
   * Show a success toast
   */
  success: (
    options: Omit<ToastOptions, 'status'>
  ) => string | number | undefined;

  /**
   * Show an error toast
   */
  error: (options: Omit<ToastOptions, 'status'>) => string | number | undefined;

  /**
   * Show a warning toast
   */
  warning: (
    options: Omit<ToastOptions, 'status'>
  ) => string | number | undefined;

  /**
   * Show an info toast
   */
  info: (options: Omit<ToastOptions, 'status'>) => string | number | undefined;

  /**
   * Close a specific toast by ID
   */
  close: (id: string | number) => void;

  /**
   * Close all toasts
   */
  closeAll: () => void;

  /**
   * Check if a toast with the given ID is active
   */
  isActive: (id: string | number) => boolean;
}

/**
 * Hook for displaying toast notifications
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Basic usage
 * toast({
 *   title: 'Success!',
 *   description: 'Your changes have been saved.',
 *   status: 'success',
 *   duration: 3000,
 *   isClosable: true,
 * });
 *
 * // Convenience methods
 * toast.success({ title: 'Saved!' });
 * toast.error({ title: 'Something went wrong' });
 * ```
 */
export const useToast = (): ToastInstance => {
  const chakraToast = useChakraToast();

  const toast = (options: ToastOptions) => {
    return chakraToast({
      title: options.title,
      description: options.description,
      status: options.status || 'info',
      duration: options.duration ?? 5000,
      isClosable: options.isClosable ?? true,
      position: options.position || 'bottom-right',
      id: options.id,
      variant: options.variant || 'solid',
    });
  };

  const typedToast = toast as ToastInstance;

  typedToast.success = options => toast({ ...options, status: 'success' });
  typedToast.error = options => toast({ ...options, status: 'error' });
  typedToast.warning = options => toast({ ...options, status: 'warning' });
  typedToast.info = options => toast({ ...options, status: 'info' });

  typedToast.close = chakraToast.close;
  typedToast.closeAll = chakraToast.closeAll;
  typedToast.isActive = chakraToast.isActive;

  return typedToast;
};

export default useToast;
