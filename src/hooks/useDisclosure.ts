import { useState, useCallback } from 'react';

/**
 * Provides a simple mechanism to control the open/closed state of components.
 */
export interface UseDisclosureProps {
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  id?: string;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  isControlled: boolean;
  getButtonProps: (props?: any) => any;
  getDisclosureProps: (props?: any) => any;
}

export const useDisclosure = (
  props: UseDisclosureProps = {}
): UseDisclosureReturn => {
  const {
    isOpen: isOpenProp,
    defaultIsOpen = false,
    onClose: onCloseProp,
    onOpen: onOpenProp,
    id,
  } = props;

  const [isOpenState, setIsOpenState] = useState(defaultIsOpen);
  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : isOpenState;

  const onOpen = useCallback(() => {
    if (!isControlled) {
      setIsOpenState(true);
    }
    onOpenProp?.();
  }, [isControlled, onOpenProp]);

  const onClose = useCallback(() => {
    if (!isControlled) {
      setIsOpenState(false);
    }
    onCloseProp?.();
  }, [isControlled, onCloseProp]);

  const onToggle = useCallback(() => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }, [isOpen, onOpen, onClose]);

  const getButtonProps = useCallback(
    (props: any = {}) => ({
      ...props,
      'aria-expanded': isOpen,
      'aria-controls': id,
      onClick: onToggle,
    }),
    [isOpen, id, onToggle]
  );

  const getDisclosureProps = useCallback(
    (props: any = {}) => ({
      ...props,
      hidden: !isOpen,
      id,
    }),
    [isOpen, id]
  );

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    isControlled,
    getButtonProps,
    getDisclosureProps,
  };
};

export default useDisclosure;
