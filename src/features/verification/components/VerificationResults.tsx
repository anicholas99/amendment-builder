import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

interface VerificationResultsProps {
  verificationResults: {
    elementDiscrepancies: string[];
    claimDiscrepancies: string[];
    figureDiscrepancies: string[];
  };
}

const VerificationResults: React.FC<VerificationResultsProps> = ({
  verificationResults,
}) => {
  const hasDiscrepancies =
    verificationResults.elementDiscrepancies.length > 0 ||
    verificationResults.claimDiscrepancies.length > 0 ||
    verificationResults.figureDiscrepancies.length > 0;

  if (!hasDiscrepancies) {
    return null;
  }

  return (
    <Box
      mt="16px"
      p="16px"
      borderWidth="1px"
      borderRadius="md"
      borderColor="orange.300"
      bg="orange.50"
    >
      <Text fontSize="lg" fontWeight="semibold" mb="8px">
        Verification Results
      </Text>

      {verificationResults.elementDiscrepancies.length > 0 && (
        <Box mb="12px">
          <Text fontWeight="normal" color="orange.800">
            Element Discrepancies:
          </Text>
          <VStack as="ul" m="8px 0" pl="20px" alignItems="flex-start">
            {verificationResults.elementDiscrepancies.map(
              (discrepancy, index) => (
                <Box as="li" key={index} color="orange.800" mb="4px">
                  {discrepancy}
                </Box>
              )
            )}
          </VStack>
        </Box>
      )}

      {verificationResults.figureDiscrepancies.length > 0 && (
        <Box mb="12px">
          <Text fontWeight="normal" color="orange.800">
            Figure Discrepancies:
          </Text>
          <VStack as="ul" m="8px 0" pl="20px" alignItems="flex-start">
            {verificationResults.figureDiscrepancies.map(
              (discrepancy, index) => (
                <Box as="li" key={index} color="orange.800" mb="4px">
                  {discrepancy}
                </Box>
              )
            )}
          </VStack>
        </Box>
      )}

      {verificationResults.claimDiscrepancies.length > 0 && (
        <Box>
          <Text fontWeight="normal" color="orange.800">
            Claim Discrepancies:
          </Text>
          <VStack as="ul" m="8px 0" pl="20px" alignItems="flex-start">
            {verificationResults.claimDiscrepancies.map(
              (discrepancy, index) => (
                <Box as="li" key={index} color="orange.800" mb="4px">
                  {discrepancy}
                </Box>
              )
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default VerificationResults;
