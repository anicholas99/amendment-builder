import React from 'react';
import { logger } from '@/utils/clientLogger';
import { isDevelopment } from '@/config/environment.client';

/**
 * Type definitions for theme-aware components
 */

/**
 * Semantic color tokens available in the theme
 */
export type SemanticColorToken =
  // Background tokens
  | 'bg.primary'
  | 'bg.secondary'
  | 'bg.card'
  | 'bg.hover'
  | 'bg.selected'
  | 'bg.focus'
  // Text tokens
  | 'text.primary'
  | 'text.secondary'
  | 'text.tertiary'
  // Border tokens
  | 'border.primary'
  | 'border.light';

/**
 * Props that should use semantic color tokens
 */
export interface ThemeAwareColorProps {
  color?: SemanticColorToken;
  bg?: SemanticColorToken;
  backgroundColor?: SemanticColorToken;
  borderColor?: SemanticColorToken;
  borderTopColor?: SemanticColorToken;
  borderRightColor?: SemanticColorToken;
  borderBottomColor?: SemanticColorToken;
  borderLeftColor?: SemanticColorToken;
}

/**
 * Utility type to enforce semantic tokens from the theme system
 */
export type WithSemanticTokens<T> = Omit<T, keyof ThemeAwareColorProps> &
  ThemeAwareColorProps;

/**
 * Text variants for consistent typography
 */
export type TextVariant = 'primary' | 'secondary' | 'tertiary';

/**
 * Container variants for consistent layouts
 */
export type ContainerVariant = 'primary' | 'secondary' | 'card';

/**
 * Mapping of container variants to background tokens
 */
export const containerVariantMap: Record<ContainerVariant, SemanticColorToken> =
  {
    primary: 'bg.primary',
    secondary: 'bg.secondary',
    card: 'bg.card',
  };

/**
 * Mapping of text variants to color tokens
 */
export const textVariantMap: Record<TextVariant, SemanticColorToken> = {
  primary: 'text.primary',
  secondary: 'text.secondary',
  tertiary: 'text.tertiary',
};

/**
 * Type guard to check if a color value is a semantic token
 */
export const isSemanticColorToken = (
  value: string
): value is SemanticColorToken => {
  const semanticTokens: SemanticColorToken[] = [
    'bg.primary',
    'bg.secondary',
    'bg.card',
    'bg.hover',
    'bg.selected',
    'bg.focus',
    'text.primary',
    'text.secondary',
    'text.tertiary',
    'border.primary',
    'border.light',
  ];

  return semanticTokens.includes(value as SemanticColorToken);
};

/**
 * Validation function to ensure semantic tokens are used
 * Throws an error in development if a non-semantic color is used
 */
export const validateSemanticToken = (
  propName: string,
  value: string | undefined
): void => {
  if (isDevelopment && value) {
    // Allow semantic tokens
    if (isSemanticColorToken(value)) return;

    // Allow theme built-in semantic values
    if (
      value.includes('Alpha') ||
      value === 'transparent' ||
      value === 'current'
    )
      return;

    // Allow color mode responsive objects
    if (value.includes('_dark') || value.includes('_light')) return;

    // Warn about hard-coded colors
    const hardCodedPatterns = [
      /^white$/,
      /^black$/,
      /^gray\.\d+$/,
      /^#[0-9a-fA-F]{3,6}$/,
      /^rgb/,
      /^hsl/,
    ];

    if (hardCodedPatterns.some(pattern => pattern.test(value))) {
      logger.warn(
        `[Dark Mode Warning] Hard-coded color "${value}" used for ${propName}. ` +
          `Consider using semantic tokens instead. See DARK_MODE_BEST_PRACTICES.md`
      );
    }
  }
};

/**
 * HOC to add dark mode validation to components
 */
export function withDarkModeValidation<P extends ThemeAwareColorProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    if (isDevelopment) {
      validateSemanticToken('color', props.color);
      validateSemanticToken('bg', props.bg);
      validateSemanticToken('backgroundColor', props.backgroundColor);
      validateSemanticToken('borderColor', props.borderColor);
    }

    return React.createElement(Component, props);
  };

  return WrappedComponent;
}
