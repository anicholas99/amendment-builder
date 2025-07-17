/**
 * Utility for smooth page transitions and component mounting animations
 * Uses existing Tailwind animation classes for consistency
 */

export const pageTransitions = {
  // Standard page entrance animation
  pageEnter: 'animate-fade-in-scale',

  // Staggered list item animations
  listItemEnter: (index: number) => ({
    animationDelay: `${index * 50}ms`,
    className: 'animate-slide-up',
  }),

  // Modal/dialog entrance
  modalEnter: 'animate-fade-in animate-zoom-in',

  // Sidebar/panel slide animations
  slideInLeft: 'animate-slide-in',
  slideInRight: 'animate-slide-in',

  // Loading state transitions
  loadingEnter: 'animate-fade-in',
  loadingExit: 'animate-fade-out',

  // Success state animation
  successPulse: 'animate-pulse-enhanced',

  // Hover scale for interactive elements
  hoverScale:
    'hover:scale-105 transition-transform duration-200 ease-smooth-out',

  // Subtle bounce for buttons
  buttonPress: 'active:scale-95 transition-transform duration-100',

  // Smooth opacity transitions
  fadeIn: 'opacity-0 animate-fade-in',
  fadeOut: 'opacity-100 animate-fade-out',

  // Staggered grid animations
  gridItemEnter: (index: number) => ({
    animationDelay: `${(index % 4) * 100}ms`,
    className: 'animate-fade-in-scale',
  }),
};

// Hook for programmatic animations
export const usePageTransition = () => {
  const triggerPageTransition = (element: HTMLElement) => {
    element.classList.add('animate-fade-in-scale');
    return new Promise<void>(resolve => {
      const handleAnimationEnd = () => {
        element.removeEventListener('animationend', handleAnimationEnd);
        resolve();
      };
      element.addEventListener('animationend', handleAnimationEnd);
    });
  };

  return { triggerPageTransition };
};

// Utility for responsive animation delays
export const getResponsiveDelay = (
  index: number,
  screenSize: 'sm' | 'md' | 'lg' = 'md'
) => {
  const delays = {
    sm: 25,
    md: 50,
    lg: 75,
  };
  return delays[screenSize] * index;
};

// Presets for common UI patterns
export const transitionPresets = {
  cardGrid: {
    container: 'space-y-4',
    item: (index: number) =>
      `${pageTransitions.fadeIn} ${pageTransitions.gridItemEnter(index).className}`,
    itemStyle: (index: number) => ({
      animationDelay: `${getResponsiveDelay(index)}ms`,
    }),
  },

  navigationMenu: {
    container: pageTransitions.slideInLeft,
    item: (index: number) =>
      `${pageTransitions.listItemEnter(index).className}`,
    itemStyle: (index: number) => ({ animationDelay: `${index * 25}ms` }),
  },

  formFields: {
    container: pageTransitions.pageEnter,
    field: (index: number) => `${pageTransitions.fadeIn}`,
    fieldStyle: (index: number) => ({ animationDelay: `${index * 100}ms` }),
  },

  dataTable: {
    container: pageTransitions.fadeIn,
    row: (index: number) => pageTransitions.listItemEnter(index).className,
    rowStyle: (index: number) => ({ animationDelay: `${index * 30}ms` }),
  },
};
