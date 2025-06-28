/**
 * Loading Overlay Component
 *
 * Professional loading overlay component to display during project switching or tenant switching
 * Implemented using React best practices and Chakra UI components
 */
import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Spinner,
  useColorModeValue,
  Center,
  Portal,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Professional loading overlay component to display during project switching or tenant switching
 * Implemented using React best practices and Chakra UI components
 */
interface LoadingOverlayProps {
  isSwitchingTenant?: boolean;
  title?: string;
  subtitle?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isSwitchingTenant = false,
  title,
  subtitle,
}) => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const dotColor = useColorModeValue('blue.500', 'blue.400');

  // Set appropriate messages based on props or defaults
  const titleText =
    title ?? (isSwitchingTenant ? 'Switching Tenant' : 'Loading Project');
  const subtitleText =
    subtitle ??
    (isSwitchingTenant
      ? 'Redirecting to the selected tenant...'
      : 'Preparing your patent project data...');

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={bgColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
          >
            <VStack spacing={6}>
              {/* Spinner */}
              <Box position="relative">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color={spinnerColor}
                  size="xl"
                  w={20}
                  h={20}
                />
              </Box>

              {/* Title */}
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={textColor}
                textAlign="center"
              >
                {titleText}
              </Text>

              {/* Subtitle */}
              <Text
                fontSize="md"
                color={subtitleColor}
                textAlign="center"
                maxW="md"
                px={4}
              >
                {subtitleText}
              </Text>

              {/* Loading dots animation */}
              <HStack spacing={2}>
                {[0, 1, 2].map(index => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.3,
                      ease: 'easeInOut',
                    }}
                  >
                    <Box w={2} h={2} bg={dotColor} borderRadius="full" />
                  </motion.div>
                ))}
              </HStack>
            </VStack>
          </Box>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};
