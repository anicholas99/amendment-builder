import React, { useState, useRef, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { isDevelopment } from '@/config/environment.client';
import { FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { PriorArtReference } from '../../../types/claimTypes';
import { useQueueCitationExtraction } from '@/hooks/api/useCitationExtraction';
import { useToast } from '@/hooks/useToastWrapper';

// shadcn/ui imports
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack, HStack } from '@/components/ui/stack';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SimpleGrid } from '@/components/ui/grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormLabel } from '@/components/ui/form';

interface CitationExtractionPanelProps {
  parsedElements: string[];
  references: PriorArtReference[];
  claimSetVersionId?: string;
}

interface CitationResult {
  claimElement?: string;
  citation?: string;
  rankPercentage?: number;
}

interface ReferenceResult {
  reference: string;
  citations: CitationResult[];
}

/**
 * Component for displaying and managing citation extraction in a dedicated panel
 */
const CitationExtractionPanel: React.FC<CitationExtractionPanelProps> = ({
  parsedElements,
  references,
  claimSetVersionId = '',
}) => {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(40);
  const [extractionCompleted] = useState<boolean>(false);
  const [citationResults] = useState<ReferenceResult[]>([]);

  const toast = useToast();

  // React Query mutation
  const queueCitationMutation = useQueueCitationExtraction({
    onSuccess: data => {
      if (!data.success) {
        // The hook already shows a toast, but we can add additional handling if needed
        logger.error('Citation extraction failed', data);
      }
    },
    onError: error => {
      // The hook already shows a toast, but we can add additional handling if needed
      logger.error('Citation extraction error:', error);
    },
  });

  // Derive states from mutation
  const isLoading = queueCitationMutation.isPending;
  const error = queueCitationMutation.error;
  const jobId = queueCitationMutation.data?.jobId
    ? String(queueCitationMutation.data.jobId)
    : null;
  const jobStatus: 'idle' | 'processing' | 'completed' | 'failed' =
    queueCitationMutation.isSuccess
      ? 'completed'
      : queueCitationMutation.isPending
        ? 'processing'
        : queueCitationMutation.isError
          ? 'failed'
          : 'idle';

  const handleExtractCitations = async () => {
    const topReferences = getTopReferences();
    if (topReferences.length === 0) {
      toast({
        title: 'No References',
        description: 'No references available for citation extraction',
        status: 'error',
      });
      return;
    }

    const searchInputs = parsedElements;
    const referenceNumber = topReferences[0].number;

    queueCitationMutation.mutate({
      searchInputs,
      filterReferenceNumber: referenceNumber,
      threshold: selectedThreshold,
      searchHistoryId: '', // You may need to get this from somewhere
      claimSetVersionId: claimSetVersionId || '',
    });
  };

  const renderStatusBadge = () => {
    switch (jobStatus) {
      case 'processing':
        return (
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
          >
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
          >
            Completed
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const getElementsForExtraction = () => {
    return parsedElements;
  };

  const getTopReferences = () => {
    return references.slice(0, 5);
  };

  return (
    <VStack className="space-y-6 items-stretch w-full">
      {/* Control Section */}
      <Card className="rounded-lg border">
        <CardHeader className="bg-muted/50 border-b py-4">
          <HStack className="justify-between">
            <CardTitle className="text-lg">
              Citation Extraction Controls
            </CardTitle>
            {jobStatus !== 'idle' && renderStatusBadge()}
          </HStack>
        </CardHeader>
        <CardContent className="pt-6">
          <VStack className="space-y-4 items-stretch">
            <Text>
              Extract specific citations from prior art references that match
              your claim elements. The system will analyze the top 5 references
              from your search results.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel htmlFor="threshold">Relevance Threshold</FormLabel>
                <Select
                  value={selectedThreshold.toString()}
                  onValueChange={value => setSelectedThreshold(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40">
                      40% - More results, lower relevance
                    </SelectItem>
                    <SelectItem value="60">
                      60% - Balanced (Recommended)
                    </SelectItem>
                    <SelectItem value="80">
                      80% - Fewer results, higher relevance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>

              <Button
                onClick={handleExtractCitations}
                disabled={
                  isLoading ||
                  parsedElements.length === 0 ||
                  references.length === 0
                }
                className="self-end h-10"
              >
                <HStack className="space-x-2">
                  {isLoading ? <LoadingMinimal size="sm" /> : <FiFileText />}
                  <span>
                    {jobStatus === 'processing'
                      ? 'Processing...'
                      : 'Extract Citations'}
                  </span>
                </HStack>
              </Button>
            </SimpleGrid>

            {/* Input Summary */}
            <Box className="mt-2">
              <Heading size="sm" className="mb-2">
                Extraction Inputs
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box className="p-4 border border-border rounded-md">
                  <HStack className="mb-2">
                    <FiCheckCircle className="text-green-500" />
                    <Text className="font-bold">Claim Elements:</Text>
                  </HStack>
                  <Text className="text-sm text-muted-foreground">
                    {getElementsForExtraction().length} elements will be used
                    (all elements)
                  </Text>
                </Box>

                <Box className="p-4 border border-border rounded-md">
                  <HStack className="mb-2">
                    <FiCheckCircle className="text-green-500" />
                    <Text className="font-bold">References:</Text>
                  </HStack>
                  <Text className="text-sm text-muted-foreground">
                    Top {getTopReferences().length} references will be analyzed
                  </Text>
                </Box>

                {jobId && (
                  <Box className="p-4 border border-border rounded-md col-span-2">
                    <HStack className="mb-2">
                      <FiClock className="text-blue-500" />
                      <Text className="font-bold">Job ID:</Text>
                    </HStack>
                    <Text className="text-sm text-muted-foreground">
                      {jobId}
                    </Text>
                  </Box>
                )}
              </SimpleGrid>
            </Box>

            {error && (
              <Alert variant="destructive" className="rounded-md">
                <AlertDescription>
                  <Box className="flex-1">
                    <Text className="font-bold">Error:</Text>
                    <Text>{error.message}</Text>
                    {/* Developer-only debug info */}
                    {isDevelopment && (
                      <Box className="mt-4 p-2 bg-muted rounded-md text-xs font-mono">
                        <Text className="font-bold">Debug Info:</Text>
                        {JSON.stringify(error, null, 2)}
                      </Box>
                    )}
                    {/* Retry button for failed jobs */}
                    {jobStatus === 'failed' && (
                      <Button
                        className="mt-3"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          queueCitationMutation.reset();
                          handleExtractCitations();
                        }}
                      >
                        <HStack className="space-x-2">
                          <FiFileText />
                          <span>Retry Citation Extraction</span>
                        </HStack>
                      </Button>
                    )}
                  </Box>
                </AlertDescription>
              </Alert>
            )}

            {/* Waiting for results message */}
            {isLoading && jobStatus !== 'idle' && (
              <Alert className="rounded-md">
                <AlertDescription>
                  <HStack className="flex-1">
                    <Text className="font-bold">
                      Processing citation extraction:
                    </Text>
                    <LoadingMinimal size="sm" />
                    <Text>Analyzing references for relevant citations...</Text>
                  </HStack>
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(citationResults.length > 0 ||
        (jobStatus === 'completed' && extractionCompleted)) && (
        <Card className="rounded-lg border">
          <CardHeader className="bg-muted/50 border-b py-4">
            <CardTitle className="text-lg">Citation Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {citationResults.length === 0 && jobStatus === 'completed' ? (
              <Alert>
                <AlertDescription>
                  Citations were processed successfully, but no results were
                  found.
                </AlertDescription>
              </Alert>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={['0']}
                className="w-full"
              >
                {citationResults.map((referenceResult, refIndex) => (
                  <AccordionItem
                    key={refIndex}
                    value={refIndex.toString()}
                    className="mb-4 border border-border rounded-md"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2 font-medium">
                          <span>{referenceResult.reference}</span>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs"
                          >
                            {referenceResult.citations.length} citations
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {referenceResult.citations.length === 0 ? (
                        <Text className="text-muted-foreground">
                          No citations found for this reference.
                        </Text>
                      ) : (
                        <>
                          <Text className="text-sm mb-3 text-muted-foreground">
                            Showing the highest relevancy citation match for
                            each element.
                          </Text>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[30%]">
                                  Element
                                </TableHead>
                                <TableHead className="w-[50%]">
                                  Best Citation Match
                                </TableHead>
                                <TableHead className="w-[20%]">
                                  Relevance
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {referenceResult.citations.map(
                                (
                                  citation: CitationResult,
                                  citIndex: number
                                ) => (
                                  <TableRow key={citIndex}>
                                    <TableCell>
                                      <Text className="text-sm font-medium">
                                        {citation.claimElement ||
                                          'No element data available'}
                                      </Text>
                                    </TableCell>
                                    <TableCell>
                                      <Text className="text-sm">
                                        {citation.citation ||
                                          'No citation text'}
                                      </Text>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          (citation.rankPercentage ?? 0) > 0.6
                                            ? 'default'
                                            : (citation.rankPercentage ?? 0) >
                                                0.4
                                              ? 'secondary'
                                              : 'destructive'
                                        }
                                        className={
                                          (citation.rankPercentage ?? 0) > 0.6
                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                            : (citation.rankPercentage ?? 0) >
                                                0.4
                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                              : ''
                                        }
                                      >
                                        {(
                                          (citation.rankPercentage ?? 0) * 100
                                        ).toFixed(2)}
                                        %
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </VStack>
  );
};

export default CitationExtractionPanel;
