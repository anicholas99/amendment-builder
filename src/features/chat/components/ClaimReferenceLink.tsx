import React, { useState } from 'react';
import {
  Link,
  Tooltip,
  Box,
  Text,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { useClaimsQuery } from '@/hooks/api/useClaims';
import { logger } from '@/lib/monitoring/logger';

interface Claim {
  id: string;
  number: number;
  text: string;
}

interface ClaimReferenceLinkProps {
  claimNumber: number;
  projectId: string;
  onClick?: (claimNumber: number) => void;
}

export const ClaimReferenceLink: React.FC<ClaimReferenceLinkProps> = ({
  claimNumber,
  projectId,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: claimsData, isLoading } = useClaimsQuery(projectId);
  
  const claims = (claimsData as { claims?: Claim[] })?.claims || [];
  const claim = claims.find((c: Claim) => c.number === claimNumber);
  
  // Color scheme
  const linkColor = useColorModeValue('blue.600', 'blue.300');
  const tooltipBg = useColorModeValue('gray.700', 'gray.200');
  const tooltipColor = useColorModeValue('white', 'gray.800');
  const notFoundColor = useColorModeValue('red.600', 'red.300');
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick && claim) {
      onClick(claimNumber);
    }
  };
  
  const renderTooltipContent = () => {
    if (isLoading) {
      return (
        <Box p={2}>
          <Spinner size="sm" />
        </Box>
      );
    }
    
    if (!claim) {
      return (
        <Box p={2}>
          <Text fontSize="sm" color="red.300">
            Claim {claimNumber} not found
          </Text>
        </Box>
      );
    }
    
    // Truncate long claims for tooltip
    const maxLength = 200;
    const claimText = claim.text.length > maxLength 
      ? claim.text.substring(0, maxLength) + '...'
      : claim.text;
    
    return (
      <Box p={3} maxW="400px">
        <Text fontSize="sm" fontWeight="bold" mb={1}>
          Claim {claimNumber}
        </Text>
        <Text fontSize="sm" whiteSpace="pre-wrap">
          {claimText}
        </Text>
        {claim.text.length > maxLength && (
          <Text fontSize="xs" fontStyle="italic" mt={1} opacity={0.8}>
            Click to see full claim
          </Text>
        )}
      </Box>
    );
  };
  
  return (
    <Tooltip
      label={renderTooltipContent()}
      isOpen={isOpen}
      placement="top"
      hasArrow
      bg={tooltipBg}
      color={tooltipColor}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      openDelay={300}
      closeDelay={100}
    >
      <Link
        href="#"
        color={claim ? linkColor : notFoundColor}
        textDecoration="underline"
        fontWeight="medium"
        onClick={handleClick}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        _hover={{
          textDecoration: 'none',
          opacity: 0.8,
        }}
      >
        claim {claimNumber}
      </Link>
    </Tooltip>
  );
}; 