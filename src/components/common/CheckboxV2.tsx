import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface CheckboxV2Props {
  isChecked?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  isDisabled?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function CheckboxV2({
  isChecked,
  checked,
  defaultChecked,
  onChange,
  onCheckedChange,
  isDisabled = false,
  disabled = false,
  size = 'md',
  colorScheme = 'blue',
  children,
  className,
  ...props
}: CheckboxV2Props) {
  const isDisabledFinal = isDisabled || disabled;
  const checkedValue = isChecked ?? checked;

  const handleCheckedChange = (newChecked: boolean) => {
    onChange?.(newChecked);
    onCheckedChange?.(newChecked);
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={checkedValue}
        defaultChecked={defaultChecked}
        onCheckedChange={handleCheckedChange}
        disabled={isDisabledFinal}
        className={`${sizeClasses[size]} ${className || ''}`}
        {...props}
      />
      {children && (
        <label
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isDisabledFinal ? 'opacity-50' : ''}`}
        >
          {children}
        </label>
      )}
    </div>
  );
}
