import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ViewLayout from '../components/layouts/ViewLayout';
import { LoadingState } from '@/components/common/LoadingState';
import { useBulkPatentLookup } from '@/hooks/api/usePatentLookup';
import { useToast } from '@/hooks/useToastWrapper';
import { useThemeContext } from '@/contexts/ThemeContext';

/**
 * Patent Bulk Lookup Page
 *
 * This page allows looking up multiple patents at once using PatBase.
 */
export default function PatentLookup() {
  const { isDarkMode } = useThemeContext();
  const [patentReferences, setPatentReferences] = useState(
    'US20150148005A1\nUS9467515B1\nUS73404388B2'
  );

  // React Query hook
  const patentLookup = useBulkPatentLookup();
  const toast = useToast();

  // Clean patent reference numbers
  const cleanPatentNumbers = (inputText: string): string[] => {
    return inputText
      .split(/[\n,;]/) // Split by newline, comma, or semicolon
      .map(ref => ref.trim())
      .filter(ref => ref.length > 0); // Remove empty lines
  };

  // Clean up title text
  const cleanTitle = (title: string, patentNumber: string): string => {
    if (!title) return 'No title available';

    // Remove common patent number formats from the title
    // Format 1: US-20150148005-A1
    let cleaned = title.replace(/^[A-Z]{2}-\d+-[A-Z]\d\s*/, '');

    // Format 2: US20150148005A1
    const cleanNumber = patentNumber.replace(/-/g, '');
    cleaned = cleaned.replace(new RegExp(cleanNumber, 'i'), '');

    // Remove additional common patent number patterns
    cleaned = cleaned.replace(/^[A-Z]{2}\d+[A-Z]\d\s*/, '');

    return cleaned.trim() || 'No title available';
  };

  // Lookup patents using the enhance API
  const lookupPatents = () => {
    const references = cleanPatentNumbers(patentReferences);

    if (references.length === 0) {
      // Use manual toast for validation error
      toast({
        title: 'Validation Error',
        description: 'Please enter at least one patent reference number',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      return;
    }

    patentLookup.mutate(references);
  };

  // Header content for ViewLayout
  const header = (
    <div className="flex justify-between items-center px-8 py-4">
      <h1 className="text-2xl font-semibold">Patent Bulk Lookup</h1>
    </div>
  );

  // Main content for ViewLayout
  const mainContent = (
    <div className="container max-w-full p-4 h-full overflow-y-auto">
      <div className="space-y-8">
        {patentLookup.error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-md">
            <p className="text-red-800 dark:text-red-200">
              {patentLookup.error.message}
            </p>
          </div>
        )}

        {/* Patent References Input */}
        <div
          className={cn(
            'p-4 border rounded-lg',
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          )}
        >
          <h2 className="text-lg font-semibold mb-4">Bulk Patent Lookup</h2>
          <p
            className={cn(
              'mb-4',
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            )}
          >
            Enter patent reference numbers (one per line or comma-separated) to
            retrieve details from PatBase.
          </p>

          <div className="space-y-4 mb-4">
            <Textarea
              value={patentReferences}
              onChange={e => setPatentReferences(e.target.value)}
              placeholder="Enter patent numbers (e.g., US9467515B1)"
              rows={5}
              className={cn(
                isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-white'
              )}
            />

            <Button
              className="w-full"
              onClick={lookupPatents}
              disabled={patentLookup.isPending}
            >
              {patentLookup.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Looking up...
                </>
              ) : (
                'Lookup Patents'
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Results Table */}
        {(patentLookup.isPending || patentLookup.data) && (
          <div
            className={cn(
              'p-4 border rounded-lg',
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            )}
          >
            <h2 className="text-lg font-semibold mb-4">Results</h2>

            {patentLookup.isPending ? (
              <LoadingState
                variant="spinner"
                message="Looking up patent details..."
                minHeight="200px"
              />
            ) : patentLookup.data ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patent Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patentLookup.data.results.map(
                      (result: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <span className="font-normal">
                              {result.referenceNumber}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            {result.found ? (
                              <span className="line-clamp-2">
                                {cleanTitle(
                                  result.title || '',
                                  result.referenceNumber || result.patentNumber
                                )}
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                )}
                              >
                                Not available
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {result.publicationDate || 'N/A'}
                          </TableCell>
                          <TableCell>{result.assignee || 'N/A'}</TableCell>
                          <TableCell>
                            {result.found ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Found
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Not Found</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ViewLayout
      header={header}
      mainContent={mainContent}
      sidebarContent={null}
    />
  );
}
