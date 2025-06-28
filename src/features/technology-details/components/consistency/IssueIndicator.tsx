import React from 'react';
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  VStack,
  Box,
  Text,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * Represents an issue found in the document
 */
interface Issue {
  type: 'error' | 'warning';
  message: string;
  location: string;
  suggestion?: string;
}

interface IssueIndicatorProps {
  location: string;
  issues: Issue[];
  onApplyFix: (issue: Issue) => void;
}

/**
 * Displays an indicator for issues found in a specific location
 * with a popover showing details and options to fix
 */
const IssueIndicator: React.FC<IssueIndicatorProps> = ({
  location,
  issues,
  onApplyFix,
}) => {
  // Don't render anything if there are no issues
  if (issues.length === 0) return null;

  const hasErrors = issues.some(issue => issue.type === 'error');
  const issueCount = issues.length;
  const issueType = hasErrors ? 'error' : 'warning';

  // Dynamic colors for better contrast in dark/light mode
  const errorBg = useColorModeValue('red.50', 'red.900');
  const warningBg = useColorModeValue('yellow.50', 'yellow.900');
  const errorIconColor = useColorModeValue('red.500', 'red.300');
  const warningIconColor = useColorModeValue('yellow.500', 'yellow.300');

  return (
    <Popover placement="right" closeOnBlur={true} gutter={8}>
      <PopoverTrigger>
        <IconButton
          aria-label={`${issueCount} ${issueType} ${issueCount === 1 ? 'issue' : 'issues'} at ${location}`}
          aria-haspopup="dialog"
          icon={<FiAlertCircle />}
          size="sm"
          colorScheme={hasErrors ? 'red' : 'yellow'}
          variant="ghost"
          ml={2}
          _hover={{
            bg: hasErrors ? 'red.100' : 'yellow.100',
            transform: 'scale(1.05)',
          }}
          _focus={{
            boxShadow: hasErrors
              ? `0 0 0 3px ${useColorModeValue('red.100', 'red.700')}`
              : `0 0 0 3px ${useColorModeValue('yellow.100', 'yellow.700')}`,
            outline: 'none',
          }}
          data-testid={`issue-indicator-${location}`}
        />
      </PopoverTrigger>
      <PopoverContent
        width="320px"
        shadow="lg"
        borderColor={hasErrors ? 'red.200' : 'yellow.200'}
        _focus={{ outline: 'none' }}
      >
        <PopoverArrow bg={hasErrors ? errorBg : warningBg} />
        <PopoverCloseButton aria-label="Close issues panel" />
        <PopoverHeader
          fontWeight="bold"
          bg={hasErrors ? errorBg : warningBg}
          color={hasErrors ? 'red.700' : 'yellow.700'}
          borderTopRadius="md"
          display="flex"
          alignItems="center"
        >
          <FiAlertCircle
            className="mr-2"
            color={hasErrors ? errorIconColor : warningIconColor}
          />
          {issueCount} {issueCount === 1 ? 'Issue' : 'Issues'} Found at{' '}
          {location}
        </PopoverHeader>
        <PopoverBody p={0}>
          <VStack spacing={0} align="stretch" divider={<Divider />}>
            {issues.map((issue, index) => (
              <Box
                key={index}
                p={3}
                bg={issue.type === 'error' ? errorBg : warningBg}
                role="alertdialog"
                aria-labelledby={`issue-title-${index}`}
                aria-describedby={`issue-description-${index}`}
              >
                <Text
                  fontWeight="medium"
                  id={`issue-title-${index}`}
                  color={issue.type === 'error' ? 'red.700' : 'yellow.700'}
                >
                  {issue.message}
                </Text>
                {issue.suggestion && (
                  <Text
                    fontSize="sm"
                    mt={1}
                    id={`issue-description-${index}`}
                    color={issue.type === 'error' ? 'red.600' : 'yellow.600'}
                  >
                    Suggestion: {issue.suggestion}
                  </Text>
                )}
                {issue.type === 'warning' && (
                  <Button
                    size="xs"
                    colorScheme="blue"
                    mt={2}
                    onClick={() => onApplyFix(issue)}
                    aria-label={`Apply fix for issue: ${issue.message}`}
                    _focus={{
                      boxShadow: 'outline',
                    }}
                  >
                    Apply Fix
                  </Button>
                )}
              </Box>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(IssueIndicator);
export type { Issue, IssueIndicatorProps };
