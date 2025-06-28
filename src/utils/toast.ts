import { UseToastOptions, useToast as useChakraToast } from '@chakra-ui/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ShowToastOptions extends Omit<UseToastOptions, 'status'> {
  type?: ToastType;
  title: string;
  description?: string;
}

const DEFAULT_DURATIONS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

export const useToast = () => {
  const toast = useChakraToast();

  const showToast = ({
    type = 'info',
    title,
    description,
    duration = DEFAULT_DURATIONS[type],
    ...rest
  }: ShowToastOptions) => {
    toast({
      title,
      description,
      status: type,
      duration,
      isClosable: true,
      position: 'bottom-right',
      ...rest,
    });
  };

  return showToast;
};

// Helper functions for common toast types
export const showSuccessToast = (
  toast: ReturnType<typeof useToast>,
  title: string,
  description?: string
) => {
  toast({ type: 'success', title, description });
};

export const showErrorToast = (
  toast: ReturnType<typeof useToast>,
  title: string,
  description?: string
) => {
  toast({ type: 'error', title, description });
};

export const showWarningToast = (
  toast: ReturnType<typeof useToast>,
  title: string,
  description?: string
) => {
  toast({ type: 'warning', title, description });
};

export const showInfoToast = (
  toast: ReturnType<typeof useToast>,
  title: string,
  description?: string
) => {
  toast({ type: 'info', title, description });
};
