import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToastWrapper';
import { useProjectActions } from '../../hooks/useProjectActions';
import { ProjectApiService } from '@/client/services/project.client-service';

interface USPTOApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentApplicationNumber?: string;
}

export const USPTOApplicationModal: React.FC<USPTOApplicationModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentApplicationNumber = '',
}) => {
  const [applicationNumber, setApplicationNumber] = useState(currentApplicationNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const formatApplicationNumber = (value: string) => {
    // Remove any non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
    
    // Format as XX/XXX,XXX
    if (cleaned.length >= 8) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 5)},${cleaned.slice(5, 8)}${cleaned.slice(8)}`;
    }
    return cleaned;
  };

  const handleApplicationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatApplicationNumber(e.target.value);
    setApplicationNumber(formatted);
    setError('');
  };

  const validateApplicationNumber = (number: string): boolean => {
    // Remove formatting for validation
    const cleaned = number.replace(/[^0-9]/g, '');
    
    // US application numbers are typically 8 digits
    if (cleaned.length !== 8 && cleaned.length !== 11) {
      setError('Application number must be 8 or 11 digits');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!applicationNumber.trim()) {
      setError('Please enter an application number');
      return;
    }

    if (!validateApplicationNumber(applicationNumber)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await ProjectApiService.updatePatentApplication(projectId, {
        applicationNumber: applicationNumber.trim(),
      });

      if (response.success) {
        toast.success({
          title: 'Application Number Added',
          description: `USPTO application number ${applicationNumber} has been linked to this project.`,
        });
        onClose();
        // Reload page to refresh project data
        window.location.reload();
      } else {
        setError('Failed to update project. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while updating the project.');
      console.error('Error updating application number:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Link USPTO Application
          </DialogTitle>
          <DialogDescription>
            Add a USPTO application number to fetch prosecution history data for "{projectName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="application-number">Application Number</Label>
            <Input
              id="application-number"
              placeholder="12/345,678"
              value={applicationNumber}
              onChange={handleApplicationNumberChange}
              disabled={isLoading}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the US application number (e.g., 12/345,678 or 12345678)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Once linked, you'll be able to:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>View the full prosecution timeline</li>
                <li>Access USPTO documents directly</li>
                <li>Download office actions and responses</li>
                <li>Analyze rejection data</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Application Number'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};