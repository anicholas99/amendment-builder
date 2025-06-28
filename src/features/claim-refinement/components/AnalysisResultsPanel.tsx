import React from 'react';
import {
  Box,
  Text,
  Button,
  Badge,
  Heading,
  Stack,
  Flex,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { FullAnalysisResponse } from '../../../types/priorArtAnalysisTypes';
import CoverageMatrixTable from './CoverageMatrixTable';
import DependentClaimSuggestionCard from './DependentClaimSuggestionCard';

const MotionBox = motion(Box);

const resultsVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface AnalysisResultsPanelProps {
  isAnalyzing: boolean;
  analysisData: FullAnalysisResponse | null;
  selectedSearchId: string | null;
  selectedReferenceNumbers: string[];
  claim1Text: string;
  displayedSuggestions: string[];
  onOpenApplyModal: (data: {
    elementText: string;
    newLanguage: string;
  }) => void;
  onInsertClaim: (claimText: string) => void;
  onEditSuggestion: (suggestionText: string) => void;
  onDismissSuggestion: (index: number) => void;
}

/**
 * Component for displaying analysis results with tabs for different views
 */
export const AnalysisResultsPanel: React.FC<AnalysisResultsPanelProps> = ({
  isAnalyzing,
  analysisData,
  selectedSearchId,
  selectedReferenceNumbers,
  claim1Text,
  displayedSuggestions,
  onOpenApplyModal,
  onInsertClaim,
  onEditSuggestion,
  onDismissSuggestion,
}) => {
  const cardBg = useColorModeValue('white', 'gray.750');
  const priorityBg = useColorModeValue('blue.50', 'blue.900');
  const priorityColor = useColorModeValue('blue.600', 'blue.200');
  const combinationBg = useColorModeValue('orange.50', 'orange.900');

  return (
    <MotionBox
      pt={4}
      borderTopWidth="1px"
      mt={4}
      initial="hidden"
      animate={!isAnalyzing && analysisData ? 'visible' : 'hidden'}
      variants={resultsVariants}
    >
      {!isAnalyzing && analysisData && (
        <Box>
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList mb="1em">
              <Tab>Overlap Summary</Tab>
              <Tab>Refinement Advice</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Stack spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={2}>
                      Reference Overlap Summary
                    </Heading>

                    {analysisData.coverageMatrix && (
                      <Box mb={6}>
                        <Heading size="sm" mb={2}>
                          Element Coverage Matrix
                        </Heading>
                        <Text fontSize="xs" color="gray.500" mb={3}>
                          This matrix shows how each claim element is covered by
                          each reference.
                          <strong> Red = Yes</strong> (element disclosed),{' '}
                          <strong>Yellow = Partial</strong> (partially
                          disclosed),
                          <strong> Green = No</strong> (not disclosed).
                        </Text>
                        <CoverageMatrixTable
                          coverageMatrix={analysisData.coverageMatrix}
                          referenceIds={
                            analysisData.analyses.length > 0
                              ? analysisData.analyses.map(a => a.referenceId)
                              : []
                          }
                        />
                      </Box>
                    )}

                    <Heading size="md" mb={2}>
                      Holistic Overlap & Risk Assessment
                    </Heading>
                    {analysisData.analyses.length === 0 && (
                      <Text>No overlap analysis available.</Text>
                    )}
                    {analysisData.analyses.map(analysis => (
                      <Box
                        key={analysis.referenceId}
                        borderWidth="1px"
                        borderRadius="lg"
                        p={4}
                        mt={3}
                        shadow="sm"
                        bg={cardBg}
                      >
                        <Flex justify="space-between" align="center" mb={2}>
                          <Heading size="sm">{analysis.referenceId}</Heading>
                          <Badge
                            colorScheme={
                              analysis.primaryRiskType === '§102 Anticipation'
                                ? 'red'
                                : analysis.primaryRiskType ===
                                    '§103 Obviousness'
                                  ? 'orange'
                                  : 'green'
                            }
                            variant="subtle"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                          >
                            {analysis.primaryRiskType}
                          </Badge>
                        </Flex>
                        <Text fontSize="sm" color="gray.700" mb={2}>
                          <strong>Holistic Overlap:</strong>{' '}
                          {analysis.overlapSummary}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          <strong>Risk Rationale:</strong>{' '}
                          {analysis.riskRationale ||
                            (analysis.primaryRiskType === 'Low Risk'
                              ? 'No significant rationale provided.'
                              : 'Rationale missing.')}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel p={0}>
                <Stack spacing={6} align="stretch">
                  {/* Priority Actions Section */}
                  {analysisData.priorityActions &&
                    analysisData.priorityActions.length > 0 && (
                      <Box
                        mb={4}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="blue.200"
                        bg={priorityBg}
                      >
                        <Heading size="sm" mb={2} color={priorityColor}>
                          Priority Drafting Actions
                        </Heading>
                        <List spacing={2}>
                          {analysisData.priorityActions.map((action, idx) => (
                            <ListItem key={idx} display="flex">
                              <ListIcon
                                as={MdArrowForward}
                                color="blue.500"
                                mt={1}
                              />
                              <Text>{action}</Text>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                  {/* Overall Assessment */}
                  {analysisData.overallAssessment && (
                    <Box>
                      <Heading size="md" mb={2}>
                        Overall Assessment (Combined Art)
                      </Heading>
                      <Text fontSize="sm">
                        {analysisData.overallAssessment}
                      </Text>
                    </Box>
                  )}

                  {/* Key Distinguishing Features */}
                  {analysisData.keyDistinguishingFeatures &&
                    analysisData.keyDistinguishingFeatures.length > 0 && (
                      <Box>
                        <Heading size="md" mb={2}>
                          Key Distinguishing Features (vs Combined Art)
                        </Heading>
                        <List spacing={2} pl={2}>
                          {analysisData.keyDistinguishingFeatures.map(
                            (feature, idx) => (
                              <ListItem key={idx} display="flex">
                                <ListIcon
                                  as={MdCheckCircle}
                                  color="green.500"
                                  mt={1}
                                />
                                <Text fontSize="sm">{feature}</Text>
                              </ListItem>
                            )
                          )}
                        </List>
                      </Box>
                    )}

                  {/* Holistic Refinement Suggestions */}
                  {analysisData.holisticRefinementSuggestions &&
                    analysisData.holisticRefinementSuggestions.length > 0 && (
                      <Box>
                        <Heading size="md" mb={2}>
                          Holistic Refinement Suggestions
                        </Heading>
                        <Stack spacing={4} align="stretch">
                          {analysisData.holisticRefinementSuggestions.map(
                            (suggestion, idx) => (
                              <Box
                                key={idx}
                                borderWidth="1px"
                                borderRadius="lg"
                                p={4}
                                shadow="sm"
                                bg={cardBg}
                              >
                                <Text fontSize="sm" fontWeight="medium" mb={2}>
                                  {suggestion.suggestion}
                                </Text>
                                <Text fontSize="xs" color="gray.600" mb={2}>
                                  <strong>Rationale:</strong>{' '}
                                  {suggestion.rationale}
                                </Text>
                                {suggestion.addressesReferences &&
                                  suggestion.addressesReferences.length > 0 && (
                                    <Flex gap={1}>
                                      <Text fontSize="xs" color="gray.500">
                                        Addresses:
                                      </Text>
                                      {suggestion.addressesReferences.map(
                                        refId => (
                                          <Badge
                                            key={refId}
                                            size="sm"
                                            variant="subtle"
                                            colorScheme="purple"
                                          >
                                            {refId}
                                          </Badge>
                                        )
                                      )}
                                    </Flex>
                                  )}
                              </Box>
                            )
                          )}
                        </Stack>
                      </Box>
                    )}

                  {/* Obviousness Combinations */}
                  {analysisData.obviousnessCombinations &&
                    analysisData.obviousnessCombinations.length > 0 && (
                      <Box pt={4} borderTopWidth="1px" mt={4}>
                        <Heading size="md" mb={2}>
                          Potential Obviousness Combinations (§103)
                        </Heading>
                        <Stack spacing={4} align="stretch">
                          {analysisData.obviousnessCombinations.map(
                            (combo, idx) => (
                              <Box
                                key={idx}
                                borderWidth="1px"
                                borderRadius="lg"
                                p={4}
                                shadow="sm"
                                bg={combinationBg}
                                borderColor="orange.200"
                              >
                                <Flex gap={2} mb={2}>
                                  <Text fontWeight="semibold" fontSize="sm">
                                    Combination:
                                  </Text>
                                  {combo.combination.map(refId => (
                                    <Badge
                                      key={refId}
                                      variant="solid"
                                      colorScheme="orange"
                                    >
                                      {refId}
                                    </Badge>
                                  ))}
                                </Flex>
                                <Text fontSize="sm">
                                  <strong>Rationale:</strong> {combo.rationale}
                                </Text>
                              </Box>
                            )
                          )}
                        </Stack>
                      </Box>
                    )}

                  {/* Dependent Claim Suggestions */}
                  <Box>
                    <Heading size="md" mb={2}>
                      Dependent Claim Suggestions
                    </Heading>
                    {displayedSuggestions.length > 0 ? (
                      <Stack spacing={3} align="stretch">
                        {displayedSuggestions.map((suggestion, index) => (
                          <DependentClaimSuggestionCard
                            key={`suggestion-${index}`}
                            suggestionText={suggestion}
                            onInsert={onInsertClaim}
                            onEdit={onEditSuggestion}
                            onDismiss={() => onDismissSuggestion(index)}
                          />
                        ))}
                      </Stack>
                    ) : analysisData?.dependentClaimSuggestions?.length ? (
                      <Text color="gray.500">
                        All suggestions have been dismissed.
                      </Text>
                    ) : (
                      <Text color="gray.500">
                        No dependent claim suggestions generated.
                      </Text>
                    )}
                  </Box>

                  {/* Suggested Independent Claim */}
                  <Box pt={4} borderTopWidth="1px" mt={4}>
                    <Heading size="md" mb={2}>
                      Suggested Independent Claim (Claim 1)
                    </Heading>
                    <Box
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.200"
                    >
                      <Text
                        whiteSpace="pre-wrap"
                        fontSize="sm"
                        fontFamily="mono"
                      >
                        {JSON.stringify(analysisData, null, 2)}
                      </Text>
                      {analysisData.finalClaimDraft && (
                        <Flex justifyContent="flex-end" mt={3}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() =>
                              onOpenApplyModal({
                                elementText: claim1Text,
                                newLanguage: analysisData.finalClaimDraft,
                              })
                            }
                          >
                            Review & Apply Suggestion
                          </Button>
                        </Flex>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}

      {!isAnalyzing &&
        !analysisData &&
        selectedSearchId &&
        selectedReferenceNumbers.length > 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              Click "Analyze References" to generate analysis.
            </AlertDescription>
          </Alert>
        )}
    </MotionBox>
  );
};
