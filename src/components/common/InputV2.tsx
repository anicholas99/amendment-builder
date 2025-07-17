import React from 'react';
import {
  Input as ShadcnInput,
  InputProps as ShadcnInputProps,
} from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Map sizes to classes
const sizeMap = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm', // default
  lg: 'h-12 px-4 text-base',
};

const variantMap = {
  outline: 'border-input', // default
  filled: 'bg-muted border-transparent',
  flushed: 'border-0 border-b-2 border-input rounded-none bg-transparent',
  unstyled: 'border-0 bg-transparent p-0 h-auto',
};

export interface InputV2Props extends Omit<ShadcnInputProps, 'size'> {
  // Compatible props
  size?: keyof typeof sizeMap;
  variant?: keyof typeof variantMap;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  focusBorderColor?: string;
  errorBorderColor?: string;

  // Additional shadcn props
  shadcnClassName?: string;
}

/**
 * Input component that provides compatibility with shadcn/ui styling
 * Supports common input patterns used throughout the application
 */
const InputV2: React.FC<InputV2Props> = ({
  size = 'md',
  variant = 'outline',
  isInvalid = false,
  isDisabled = false,
  isReadOnly = false,
  focusBorderColor,
  errorBorderColor,
  shadcnClassName,
  className,
  ...props
}) => {
  const sizeClasses = sizeMap[size];
  const variantClasses = variantMap[variant];

  const combinedClassName = cn(
    sizeClasses,
    variantClasses,
    isInvalid && 'border-destructive focus-visible:ring-destructive',
    isDisabled && 'cursor-not-allowed opacity-50',
    isReadOnly && 'cursor-default',
    shadcnClassName,
    className
  );

  return (
    <ShadcnInput
      className={combinedClassName}
      disabled={isDisabled}
      readOnly={isReadOnly}
      {...props}
    />
  );
};

export default InputV2;
