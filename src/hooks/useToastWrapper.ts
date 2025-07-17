'use client';

import { toast as shadcnToast } from '@/hooks/use-toast';

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
  (options: ToastOptions): {
    id: string;
    dismiss: () => void;
    update: (props: any) => void;
  };

  /**
   * Show a success toast
   */
  success: (options: Omit<ToastOptions, 'status'>) => {
    id: string;
    dismiss: () => void;
    update: (props: any) => void;
  };

  /**
   * Show an error toast
   */
  error: (options: Omit<ToastOptions, 'status'>) => {
    id: string;
    dismiss: () => void;
    update: (props: any) => void;
  };

  /**
   * Show a warning toast
   */
  warning: (options: Omit<ToastOptions, 'status'>) => {
    id: string;
    dismiss: () => void;
    update: (props: any) => void;
  };

  /**
   * Show an info toast
   */
  info: (options: Omit<ToastOptions, 'status'>) => {
    id: string;
    dismiss: () => void;
    update: (props: any) => void;
  };

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

// Map of active toasts
const activeToasts = new Map<string | number, { dismiss: () => void }>();

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
  const toast = (options: ToastOptions) => {
    // Map status to variant for shadcn toast
    const variant = options.status === 'error' ? 'destructive' : 'default';

    const result = shadcnToast({
      title: options.title,
      description: options.description,
      variant,
      duration: options.duration ?? 5000,
    });

    // Store the toast
    if (options.id) {
      activeToasts.set(options.id, result);
    }
    activeToasts.set(result.id, result);

    return result;
  };

  const typedToast = toast as ToastInstance;

  typedToast.success = options => toast({ ...options, status: 'success' });
  typedToast.error = options => toast({ ...options, status: 'error' });
  typedToast.warning = options => toast({ ...options, status: 'warning' });
  typedToast.info = options => toast({ ...options, status: 'info' });

  typedToast.close = (id: string | number) => {
    const toastId = id.toString();
    const toast = activeToasts.get(toastId);
    if (toast) {
      toast.dismiss();
      activeToasts.delete(toastId);
    }
  };

  typedToast.closeAll = () => {
    activeToasts.forEach(toast => toast.dismiss());
    activeToasts.clear();
  };

  typedToast.isActive = (id: string | number) => {
    return activeToasts.has(id.toString());
  };

  return typedToast;
};

export default useToast;
