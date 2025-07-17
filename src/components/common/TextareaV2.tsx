import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextareaV2Props {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  rows?: number;
  className?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export default function TextareaV2({
  placeholder,
  value,
  defaultValue,
  onChange,
  size = 'md',
  disabled = false,
  rows = 4,
  className,
  resize = 'vertical',
  ...props
}: TextareaV2Props) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-1 min-h-[60px]',
    md: 'text-sm px-3 py-2 min-h-[80px]',
    lg: 'text-base px-4 py-3 min-h-[100px]',
  };

  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  };

  return (
    <Textarea
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      className={cn(sizeClasses[size], resizeClasses[resize], className)}
      {...props}
    />
  );
}
