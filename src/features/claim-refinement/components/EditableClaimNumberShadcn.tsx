import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useUpdateClaimNumberMutation } from '@/hooks/api/useClaims';
import { Input } from '@/components/ui/input';

interface EditableClaimNumberShadcnProps {
  claimId: string;
  claimNumber: number;
  getFontSize?: (baseSize: string) => string;
}

/**
 * Inline editable claim number component - ShadCN/Tailwind version
 * Click to edit the claim number with proper validation and conflict handling
 */
export const EditableClaimNumberShadcn: React.FC<
  EditableClaimNumberShadcnProps
> = ({ claimId, claimNumber, getFontSize }) => {
  const { isDarkMode } = useThemeContext();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(claimNumber));
  const [lastSavedNumber, setLastSavedNumber] = useState(claimNumber);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const updateClaimNumberMutation = useUpdateClaimNumberMutation();

  // Update value when claimNumber prop changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setValue(String(claimNumber));
      setLastSavedNumber(claimNumber);
    }
  }, [claimNumber, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    // Don't allow editing temporary claims
    if (claimId.startsWith('temp-')) {
      toast({
        title: 'Cannot edit',
        description: 'Please wait for the claim to be saved first',
        status: 'info',
        duration: 2000,
      });
      return;
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    const newNumber = parseInt(value, 10);

    // Validation
    if (isNaN(newNumber) || newNumber < 1) {
      toast({
        title: 'Invalid claim number',
        description: 'Claim number must be a positive integer',
        status: 'error',
        duration: 3000,
      });
      setValue(String(lastSavedNumber));
      setIsEditing(false);
      return;
    }

    // No change
    if (newNumber === lastSavedNumber) {
      setIsEditing(false);
      return;
    }

    // Update the claim number
    logger.info('[EditableClaimNumberShadcn] Updating claim number', {
      claimId,
      oldNumber: lastSavedNumber,
      newNumber,
    });

    // Exit edit mode immediately for better UX
    setIsEditing(false);
    setLastSavedNumber(newNumber);

    updateClaimNumberMutation.mutate(
      { claimId, number: newNumber },
      {
        onError: () => {
          // Revert to the last known good value on error
          setValue(String(claimNumber));
          setLastSavedNumber(claimNumber);
        },
      }
    );
  };

  const handleCancel = () => {
    setValue(String(lastSavedNumber));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <div className="inline-block min-w-fit">
        <Input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-12 text-left font-bold text-sm h-auto min-h-auto leading-[1.8] px-1 py-0',
            isDarkMode
              ? 'bg-gray-800 border-blue-300 focus:border-blue-300 focus:ring-blue-300'
              : 'bg-white border-blue-400 focus:border-blue-400 focus:ring-blue-400',
            getFontSize ? `text-${getFontSize('sm')}` : 'text-sm'
          )}
        />
      </div>
    );
  }

  return (
    <span
      onClick={handleClick}
      className={cn(
        'cursor-pointer px-1 py-0 m-0 rounded-md transition-colors font-bold inline-block align-baseline leading-[1.8]',
        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
        updateClaimNumberMutation.isPending ? 'opacity-70' : 'opacity-100',
        getFontSize ? `text-${getFontSize('sm')}` : 'text-sm'
      )}
      title="Click to edit claim number"
    >
      {claimNumber}.
    </span>
  );
};

export default EditableClaimNumberShadcn;
