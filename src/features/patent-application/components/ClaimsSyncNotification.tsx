import React from 'react';
import { Check, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClaimsSyncNotificationProps {
  hasClaimsChanged: boolean;
}

export const ClaimsSyncNotification: React.FC<ClaimsSyncNotificationProps> = ({
  hasClaimsChanged,
}) => {
  if (!hasClaimsChanged) return null;

  return (
    <div className="border border-blue-200 rounded-md p-4 bg-blue-50 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 mt-1" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Claims Changed</span>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-100"
              >
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>Ready to Sync</span>
                </div>
              </Badge>
            </div>
            <p className="text-sm text-gray-700">
              Your refined claims from the claim refinement view are ready to
              sync.
            </p>
            <p className="text-sm text-gray-600 italic">
              The Claims section and other dependent sections will be updated to
              match your refined claims.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
