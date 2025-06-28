import React, { useRef, useEffect } from 'react';
import { Box, IconButton, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FigureNavigationProps } from './types';

/**
 * Component for figure dots navigation and arrow controls
 */
const FigureNavigation: React.FC<FigureNavigationProps> = ({
  figureKeys,
  currentIndex,
  onNavigate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Theme-aware colors for navigation buttons
  const buttonBg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(26, 32, 44, 0.9)'
  );
  const buttonHoverBg = useColorModeValue(
    'rgba(255, 255, 255, 0.95)',
    'rgba(45, 55, 72, 0.95)'
  );
  const iconColor = useColorModeValue('gray.700', 'gray.200');

  // Scroll the active dot into view when currentIndex changes
  useEffect(() => {
    if (scrollRef.current && figureKeys.length > 5) {
      const dotWidth = 40; // Approximate width of each dot including margin
      const scrollPos =
        currentIndex * dotWidth -
        scrollRef.current.clientWidth / 2 +
        dotWidth / 2;
      scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [currentIndex, figureKeys.length]);

  // Don't render navigation for a single figure
  if (figureKeys.length <= 1) return null;

  return (
    <>
      {/* Navigation Arrows */}
      <Box
        position="absolute"
        left={0}
        right={0}
        top="0"
        bottom="0"
        className="pointer-events-none"
      >
        <IconButton
          icon={<Icon as={FiChevronLeft} />}
          aria-label="Previous figure"
          variant="ghost"
          size="sm"
          isDisabled={currentIndex === 0}
          onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
          position="absolute"
          left="8px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={1}
          bg={buttonBg}
          color={iconColor}
          borderRadius="full"
          boxShadow="sm"
          pointerEvents="auto"
          _hover={{
            bg: buttonHoverBg,
            transform: 'translateY(-50%) scale(1.05)',
          }}
          _active={{
            transform: 'translateY(-50%) scale(0.95)',
          }}
          transition="all 0.2s"
        />
        <IconButton
          icon={<Icon as={FiChevronRight} />}
          aria-label="Next figure"
          variant="ghost"
          size="sm"
          isDisabled={currentIndex === figureKeys.length - 1}
          onClick={() =>
            currentIndex < figureKeys.length - 1 && onNavigate(currentIndex + 1)
          }
          position="absolute"
          right="8px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={1}
          bg={buttonBg}
          color={iconColor}
          borderRadius="full"
          boxShadow="sm"
          pointerEvents="auto"
          _hover={{
            bg: buttonHoverBg,
            transform: 'translateY(-50%) scale(1.05)',
          }}
          _active={{
            transform: 'translateY(-50%) scale(0.95)',
          }}
          transition="all 0.2s"
        />
      </Box>
    </>
  );
};

export default FigureNavigation;
