import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * TechInput - Domain-specific component for technology input
 * Uses framework-agnostic design system components to maintain consistency
 * and enable easy framework migrations in the future.
 */
export interface TechInputProps {
  /** Initial value for the technology description */
  initialValue?: string;
  /** Callback when technology is submitted */
  onSubmit?: (value: string) => void;
  /** Whether the input is in loading state */
  loading?: boolean;
}

export const TechInput: React.FC<TechInputProps> = ({
  initialValue = '',
  onSubmit,
  loading = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!value.trim()) {
      setError('Technology description is required');
      return;
    }

    setError(undefined);
    onSubmit?.(value);
  };

  const canSubmit = value.trim() && !error;

  return (
    <div className="p-4 border border-border rounded-md shadow-sm bg-card">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          Technology Description
        </h3>
        <div className="space-y-2">
          <Label htmlFor="tech-description">Describe your technology</Label>
          <Input
            id="tech-description"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter technology description..."
            className={cn(error && 'border-red-500 focus:ring-red-500')}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Analyzing...' : 'Analyze Technology'}
        </Button>
      </div>
    </div>
  );
};

TechInput.displayName = 'TechInput';
