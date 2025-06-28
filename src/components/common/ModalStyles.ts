/**
 * Centralized Modal Styles Configuration
 *
 * Ensures consistent styling across all modals in the application
 * Following the established design patterns
 */

export const modalStyles = {
  overlay: {
    // backdropFilter: 'blur(8px)', // Removed for performance
  },
  header: {
    as: 'h3' as const,
    pb: 3,
    borderBottomWidth: '1px',
    fontSize: 'lg',
    fontWeight: 'semibold',
  },
  body: {
    py: 6,
  },
  footer: {
    borderTopWidth: '1px',
  },
} as const;

// Common modal size presets
export const modalSizes = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
  extraLarge: 'xl',
  doubleExtraLarge: '2xl',
  fourExtraLarge: '4xl',
} as const;

// Button patterns for modals
export const modalButtonStyles = {
  primary: {
    colorScheme: 'blue',
    size: 'sm' as const,
  },
  secondary: {
    variant: 'ghost' as const,
    size: 'sm' as const,
  },
} as const;
