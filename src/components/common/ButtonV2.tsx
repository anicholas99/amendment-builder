import React from 'react';
import {
  Button as ShadcnButton,
  ButtonProps as ShadcnButtonProps,
} from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// Map color schemes to shadcn variants and classes
const colorSchemeMap = {
  blue: { variant: 'default' as const, className: '' },
  red: { variant: 'destructive' as const, className: '' },
  green: {
    variant: 'default' as const,
    className: 'bg-green-600 hover:bg-green-700 text-white',
  },
  orange: {
    variant: 'default' as const,
    className: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  gray: { variant: 'secondary' as const, className: '' },
};

const variantMap = {
  solid: 'default' as const,
  outline: 'outline' as const,
  ghost: 'ghost' as const,
  link: 'link' as const,
  secondary: 'outline' as const, // Maps to outline variant with gray color
};

export interface ButtonV2Props
  extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  // Compatible props
  colorScheme?: keyof typeof colorSchemeMap;
  variant?: keyof typeof variantMap;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;

  // Additional shadcn props
  shadcnVariant?: ShadcnButtonProps['variant'];
  shadcnSize?: ShadcnButtonProps['size'];
}

/**
 * Button component that provides compatibility with shadcn/ui styling
 * Supports all common button patterns used throughout the application
 */
const ButtonV2: React.FC<ButtonV2Props> = ({
  children,
  colorScheme = 'blue',
  variant = 'solid',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  loadingText,
  leftIcon,
  rightIcon,
  shadcnVariant,
  shadcnSize,
  className,
  onClick,
  ...props
}) => {
  // Map sizes to shadcn sizes
  const sizeMap = {
    sm: 'sm' as const,
    md: 'default' as const,
    lg: 'lg' as const,
  };

  // Handle secondary variant (which should be gray + outline)
  const effectiveColorScheme = variant === 'secondary' ? 'gray' : colorScheme;

  // Determine shadcn variant and classes
  const colorConfig =
    colorSchemeMap[effectiveColorScheme] || colorSchemeMap.blue;
  const mappedVariant =
    shadcnVariant ||
    (variant === 'solid' ? colorConfig.variant : variantMap[variant]);
  const mappedSize = shadcnSize || sizeMap[size];

  // Handle disabled state (isLoading also disables)
  const disabled = isDisabled || isLoading;

  // Handle click with loading/disabled check
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <ShadcnButton
      variant={mappedVariant}
      size={mappedSize}
      disabled={disabled}
      className={cn(
        colorConfig.className,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
      )}

      {/* Left icon (only if not loading) */}
      {!isLoading && leftIcon && (
        <span className="mr-2 flex items-center">{leftIcon}</span>
      )}

      {/* Button text */}
      {isLoading && loadingText ? loadingText : children}

      {/* Right icon (only if not loading) */}
      {!isLoading && rightIcon && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )}
    </ShadcnButton>
  );
};

export default ButtonV2;
