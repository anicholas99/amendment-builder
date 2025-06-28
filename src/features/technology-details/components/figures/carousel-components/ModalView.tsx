import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';

export interface ModalViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * A reusable modal component for displaying content
 */
const ModalView: React.FC<ModalViewProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const [isClosing, setIsClosing] = React.useState(false);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleClose = React.useCallback(() => {
    if (!isMountedRef.current || isClosing) return;

    // Set closing state to prevent multiple close attempts
    setIsClosing(true);

    // Small delay to let any pending scroll events finish
    setTimeout(() => {
      if (isMountedRef.current) {
        onClose();
        setIsClosing(false);
      }
    }, 50);
  }, [onClose, isClosing]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="6xl"
      motionPreset="scale"
      isCentered
      closeOnOverlayClick={!isClosing}
      closeOnEsc={!isClosing}
      preserveScrollBarGap
      blockScrollOnMount
      returnFocusOnClose
    >
      <ModalOverlay />
      <ModalContent bg={bgColor} maxHeight="95vh" maxW="95vw">
        <ModalHeader as="h3" borderBottomWidth="1px">
          {title}
        </ModalHeader>

        <ModalBody
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding={6}
          overflow="auto"
        >
          {children}
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <Button
            colorScheme="blue"
            onClick={handleClose}
            isDisabled={isClosing}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalView;
