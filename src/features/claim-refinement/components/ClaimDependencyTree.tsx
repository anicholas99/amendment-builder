import React from 'react';
import { Box, Text, Stack, Icon } from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';

interface ClaimDependencyTreeProps {
  claims: Record<string, string>;
}

const ClaimDependencyTree: React.FC<ClaimDependencyTreeProps> = ({
  claims,
}) => {
  // Parse claim dependencies
  const dependencies: Record<string, string[]> = {};
  const independentClaims: string[] = [];

  // Identify independent and dependent claims
  Object.entries(claims).forEach(([number, text]) => {
    if (text.toLowerCase().includes('claim')) {
      // Extract dependency
      const match = text.match(/claim\s+(\d+)/i);
      if (match && match[1]) {
        const parentClaim = match[1];
        if (!dependencies[parentClaim]) {
          dependencies[parentClaim] = [];
        }
        dependencies[parentClaim].push(number);
      } else {
        independentClaims.push(number);
      }
    } else {
      independentClaims.push(number);
    }
  });

  // Render the tree
  const renderClaimBranch = (claimNumber: string, level: number = 0) => {
    const dependents = dependencies[claimNumber] || [];

    return (
      <Box key={claimNumber} ml={level * 6} mb={4}>
        <Stack direction="row">
          {level > 0 && <Icon as={FiArrowRight} color="blue.500" />}
          <Box
            p={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor={level === 0 ? 'blue.500' : 'gray.300'}
            bg={level === 0 ? 'blue.50' : 'white'}
            width="100%"
          >
            <Text fontWeight={level === 0 ? 'bold' : 'normal'}>
              Claim {claimNumber}: {claims[claimNumber].substring(0, 100)}
              {claims[claimNumber].length > 100 ? '...' : ''}
            </Text>
          </Box>
        </Stack>

        {dependents.length > 0 && (
          <Stack direction="column" align="stretch" spacing={2} mt={2}>
            {dependents.map(dep => renderClaimBranch(dep, level + 1))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="medium" mb={4}>
        Claim Dependency Structure
      </Text>
      <Stack direction="column" align="stretch" spacing={4}>
        {independentClaims.map(claim => renderClaimBranch(claim))}
      </Stack>
    </Box>
  );
};

export default ClaimDependencyTree;
