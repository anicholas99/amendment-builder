import { useToast as useRadixToast } from './use-toast';
import type { ToastActionElement } from '@/components/ui/toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: ToastActionElement;
}

export function useToast() {
  const { toast } = useRadixToast();

  const showToast = {
    success: (title: string, options?: Omit<ToastOptions, 'title'>) => {
      return toast({
        title,
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
        variant: 'success',
      });
    },

    error: (title: string, options?: Omit<ToastOptions, 'title'>) => {
      return toast({
        title,
        description: options?.description,
        duration: options?.duration || 6000,
        action: options?.action,
        variant: 'destructive',
      });
    },

    warning: (title: string, options?: Omit<ToastOptions, 'title'>) => {
      return toast({
        title,
        description: options?.description,
        duration: options?.duration || 5000,
        action: options?.action,
        variant: 'warning',
      });
    },

    info: (title: string, options?: Omit<ToastOptions, 'title'>) => {
      return toast({
        title,
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
        variant: 'info',
      });
    },

    // Basic toast function
    show: (options: ToastOptions) => {
      return toast({
        title: options.title,
        description: options.description,
        duration: options.duration || 4000,
        action: options.action,
      });
    },
  };

  return showToast;
}
