import { toast } from 'sonner';

export interface UseToastOptions {
  title?: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
  position?:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right';
}

export interface ToastInstance {
  (options: UseToastOptions): string | number;
  success: (
    message: string,
    options?: Omit<UseToastOptions, 'status'>
  ) => string | number;
  error: (
    message: string,
    options?: Omit<UseToastOptions, 'status'>
  ) => string | number;
  warning: (
    message: string,
    options?: Omit<UseToastOptions, 'status'>
  ) => string | number;
  info: (
    message: string,
    options?: Omit<UseToastOptions, 'status'>
  ) => string | number;
}

/**
 * Custom toast hook that provides a theme-compatible API
 */
export const useToast = (): ToastInstance => {
  const showToast = (options: UseToastOptions) => {
    const { title, description, status = 'info', duration } = options;

    // Create the message - use title if available, otherwise description
    const message = title || description || '';
    const secondaryMessage = title && description ? description : undefined;

    const config = {
      duration: duration || 4000,
      description: secondaryMessage,
    };

    switch (status) {
      case 'success':
        return toast.success(message, config);
      case 'error':
        return toast.error(message, config);
      case 'warning':
        return toast.warning(message, config);
      case 'info':
      default:
        return toast(message, config);
    }
  };

  // Create the main function with convenience methods
  const toastFn = showToast as ToastInstance;

  toastFn.success = (
    message: string,
    options: Omit<UseToastOptions, 'status'> = {}
  ) => {
    return showToast({ ...options, title: message, status: 'success' });
  };

  toastFn.error = (
    message: string,
    options: Omit<UseToastOptions, 'status'> = {}
  ) => {
    return showToast({ ...options, title: message, status: 'error' });
  };

  toastFn.warning = (
    message: string,
    options: Omit<UseToastOptions, 'status'> = {}
  ) => {
    return showToast({ ...options, title: message, status: 'warning' });
  };

  toastFn.info = (
    message: string,
    options: Omit<UseToastOptions, 'status'> = {}
  ) => {
    return showToast({ ...options, title: message, status: 'info' });
  };

  return toastFn;
};

export default useToast;
