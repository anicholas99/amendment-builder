import React from 'react';
import { Box, Heading, Text, List, ListItem } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useColorModeValue } from '@/hooks/useColorModeValue';

interface AnalysisMarkdownViewerProps {
  markdownText: string;
}

export const AnalysisMarkdownViewer: React.FC<AnalysisMarkdownViewerProps> = ({
  markdownText,
}) => {
  const codeBg = useColorModeValue('gray.100', 'gray.700');
  const codeColor = useColorModeValue('text.primary', 'text.primary');
  const blockquoteBg = useColorModeValue('bg.secondary', 'bg.secondary');
  const blockquoteColor = useColorModeValue('text.secondary', 'text.secondary');
  const blockquoteBorderColor = useColorModeValue(
    'border.primary',
    'border.primary'
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => (
          <Heading size="lg" mt={5} mb={3} color="text.primary" {...props}>
            {children}
          </Heading>
        ),
        h2: ({ children, ...props }) => (
          <Heading size="md" mt={4} mb={2} color="text.primary" {...props}>
            {children}
          </Heading>
        ),
        h3: ({ children, ...props }) => (
          <Heading size="sm" mt={3} mb={1} color="text.primary" {...props}>
            {children}
          </Heading>
        ),
        p: ({ children, onClick, ...props }) => (
          <Text mb={2} fontSize="sm" color="text.primary" {...props}>
            {children}
          </Text>
        ),
        ul: props => (
          <List
            spacing={1}
            mb={2}
            styleType="disc"
            stylePosition="inside"
            {...props}
          />
        ),
        ol: props => (
          <List
            spacing={1}
            mb={2}
            styleType="decimal"
            stylePosition="inside"
            {...props}
          />
        ),
        li: props => (
          <ListItem
            display="list-item"
            ml="1.2em"
            fontSize="sm"
            color="text.primary"
          >
            {props.children}
          </ListItem>
        ),
        code: ({ children }) => (
          <Box
            as="code"
            px={1}
            py={0.5}
            bg={codeBg}
            borderRadius="sm"
            fontSize="0.85em"
            fontFamily="monospace"
            color={codeColor}
          >
            {children}
          </Box>
        ),
        blockquote: ({ children }) => (
          <Box
            as="blockquote"
            borderLeftWidth="4px"
            borderColor={blockquoteBorderColor}
            pl={4}
            py={2}
            my={3}
            bg={blockquoteBg}
            fontStyle="italic"
            color={blockquoteColor}
          >
            {children}
          </Box>
        ),
      }}
    >
      {markdownText}
    </ReactMarkdown>
  );
};
