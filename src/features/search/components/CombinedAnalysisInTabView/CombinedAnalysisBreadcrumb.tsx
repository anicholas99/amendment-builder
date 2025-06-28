import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
} from '@chakra-ui/react';
import { FiChevronRight, FiArrowLeft } from 'react-icons/fi';

interface CombinedAnalysisBreadcrumbProps {
  onBack: () => void;
}

export const CombinedAnalysisBreadcrumb: React.FC<
  CombinedAnalysisBreadcrumbProps
> = ({ onBack }) => {
  return (
    <Breadcrumb
      spacing="8px"
      separator={<FiChevronRight color="text.tertiary" />}
      mb={4}
      fontSize="sm"
    >
      <BreadcrumbItem>
        <BreadcrumbLink
          as="button"
          onClick={onBack}
          color="blue.500"
          fontWeight="semibold"
        >
          <Flex align="center">
            <FiArrowLeft className="mr-1" /> Citations
          </Flex>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <BreadcrumbLink color="text.primary" fontWeight="semibold">
          Combined Examiner Analysis
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};
