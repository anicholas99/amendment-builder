import React from 'react';
import { VStack, Icon, Heading, Text } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { ConfirmationSectionProps } from './types';

const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  emphasizedElementsCount,
}) => {
  return (
    <VStack spacing={6} align="center" justify="center" py="40px">
      <Icon as={FiCheckCircle} color="green.500" className="w-16 h-16" />
      <Heading size="md">Search Executed!</Heading>
      <Text className="text-center" color="gray.600">
        Your search has been executed with {emphasizedElementsCount} emphasized
        elements.
        <br />
        The results will be available shortly.
      </Text>
    </VStack>
  );
};

export default ConfirmationSection;
