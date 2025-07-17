import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ClaimVersion } from '../../../types/claimTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useThemeContext } from '@/contexts/ThemeContext';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ClaimVersion[];
  onRestore: (version: ClaimVersion) => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRestore,
}) => {
  const { isDarkMode } = useThemeContext();

  const formatDate = (dateString: string | number) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Claim Version History
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        {versions.length === 0 ? (
          <div
            className={cn(
              'p-4 text-center',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}
          >
            No version history available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 border rounded-md',
                  isDarkMode
                    ? 'border-gray-600 bg-gray-800'
                    : 'border-gray-200 bg-white'
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={index === 0 ? 'default' : 'secondary'}
                      className={cn(
                        index === 0
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
                        isDarkMode && index === 0
                          ? 'bg-green-900/30 text-green-300'
                          : '',
                        isDarkMode && index !== 0
                          ? 'bg-blue-900/30 text-blue-300'
                          : ''
                      )}
                    >
                      {index === 0
                        ? 'Latest'
                        : `Version ${versions.length - index}`}
                    </Badge>
                    <span
                      className={cn(
                        'text-sm',
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      {formatDate(version.timestamp)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={index === 0 ? 'outline' : 'default'}
                    disabled={index === 0}
                    onClick={() => onRestore(version)}
                    className={cn(
                      index === 0
                        ? 'border-blue-300 text-blue-600 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    Revert to this version
                  </Button>
                </div>

                <p className="font-normal mb-1">{version.description}</p>

                <Accordion type="single" collapsible>
                  <AccordionItem value="claims" className="border-none">
                    <AccordionTrigger className="px-0 py-1 hover:no-underline">
                      <div className="flex-1 text-left">
                        <span
                          className={cn(
                            'text-sm',
                            isDarkMode ? 'text-blue-400' : 'text-blue-500'
                          )}
                        >
                          View Claims ({Object.keys(version.claims).length})
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <div className="rounded-md overflow-hidden">
                        <div className="space-y-2">
                          {Object.entries(version.claims).map(([num, text]) => (
                            <div
                              key={num}
                              className={cn(
                                'p-2 rounded-md text-sm',
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                              )}
                            >
                              <p className="font-normal mb-1">Claim {num}</p>
                              <p>{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistoryModal;
