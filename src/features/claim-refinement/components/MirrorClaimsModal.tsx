import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClaimType } from '@/hooks/api/useClaimMirroring';
import { FiCopy } from 'react-icons/fi';

interface MirrorClaimsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetType: ClaimType) => void;
  claimCount: number;
  isLoading?: boolean;
}

const CLAIM_TYPE_OPTIONS: Array<{
  value: ClaimType;
  label: string;
  description: string;
}> = [
  {
    value: 'system',
    label: 'System',
    description: 'A system comprising... (structural components)',
  },
  {
    value: 'method',
    label: 'Method',
    description: 'A method comprising... (steps/actions)',
  },
  {
    value: 'apparatus',
    label: 'Apparatus',
    description: 'An apparatus comprising... (physical components)',
  },
  {
    value: 'process',
    label: 'Process',
    description: 'A process for... (sequence of operations)',
  },
  {
    value: 'crm',
    label: 'Computer-Readable Medium',
    description:
      'A non-transitory computer-readable medium storing instructions...',
  },
];

const MirrorClaimsModal: React.FC<MirrorClaimsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  claimCount,
  isLoading = false,
}) => {
  const [selectedType, setSelectedType] = useState<ClaimType>('method');

  const handleConfirm = () => {
    onConfirm(selectedType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiCopy className="w-4 h-4" />
            <span>Mirror Claims</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2">
              Select the target claim type to mirror your{' '}
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
              >
                {claimCount}
              </Badge>{' '}
              claims:
            </p>
          </div>

          <RadioGroup
            value={selectedType}
            onValueChange={value => setSelectedType(value as ClaimType)}
            className="space-y-3"
          >
            {CLAIM_TYPE_OPTIONS.map(option => (
              <div
                key={option.value}
                className={cn(
                  'p-4 border rounded-md cursor-pointer transition-[background-color,border-color] duration-150',
                  'hover:border-blue-400',
                  selectedType === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-border bg-transparent'
                )}
                onClick={() => setSelectedType(option.value)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="cursor-pointer flex-1"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              The AI will transform your claims while preserving all technical
              elements and maintaining proper claim dependencies.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Mirroring Claims...' : 'Mirror Claims'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MirrorClaimsModal;
