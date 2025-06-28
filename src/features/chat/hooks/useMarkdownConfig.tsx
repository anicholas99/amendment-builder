import React, { useMemo } from 'react';
import { Text, Box, useColorModeValue } from '@chakra-ui/react';
import {
  MarkdownComponentProps,
  OrderedListProps,
  TableCellProps,
  PageContext,
} from '../types';
import { MermaidDiagram } from '../components/MermaidDiagram';

export const useMarkdownConfig = (pageContext: PageContext) => {
  const codeBg = useColorModeValue('gray.100', 'gray.700');
  const preBg = useColorModeValue('gray.50', 'gray.800');
  const blockquoteBg = useColorModeValue('blue.50', 'blue.900');
  const markdownH1Color = useColorModeValue('gray.800', 'white');
  const markdownH3Color = useColorModeValue('gray.700', 'gray.200');
  const tableBorderColor = useColorModeValue('gray.200', 'gray.600');

  const MarkdownComponents = useMemo(
    () => ({
      p: ({ children }: MarkdownComponentProps) => (
        <Text mb={4} lineHeight="1.7" fontSize="sm" whiteSpace="pre-wrap">
          {children}
        </Text>
      ),
      strong: ({ children }: MarkdownComponentProps) => (
        <Text as="span" fontWeight="700" color="text.primary">
          {children}
        </Text>
      ),
      em: ({ children }: MarkdownComponentProps) => (
        <Text as="span" fontStyle="italic" color="text.secondary">
          {children}
        </Text>
      ),
      ul: ({ children }: MarkdownComponentProps) => {
        // Always render proper unordered lists with bullet points
        return (
          <Box
            as="ul"
            pl={5}
            mb={4}
            sx={{ listStyleType: 'disc', listStylePosition: 'outside' }}
          >
            {children}
          </Box>
        );
      },
      ol: ({ children, start }: OrderedListProps) => {
        // Always render proper ordered lists with numbers
        return (
          <Box
            as="ol"
            pl={5}
            mb={4}
            sx={{ listStyleType: 'decimal', listStylePosition: 'outside' }}
            start={start}
          >
            {children}
          </Box>
        );
      },
      li: ({ children }: MarkdownComponentProps) => {
        // Only add semicolons for actual patent claim formatting, not for general lists
        // This prevents feedback lists from being incorrectly formatted with semicolons
        if (pageContext === 'claim-refinement') {
          // Check if this is likely an actual patent claim by looking for claim-specific patterns
          const childText = React.Children.toArray(children).join('');
          const isActualClaim =
            /^(A\s+|An\s+|The\s+.*\s+comprising|.*\s+wherein|.*\s+further comprising)/i.test(
              childText
            );

          if (isActualClaim) {
            // Only apply semicolon formatting to actual patent claim text
            return (
              <Text as="span" fontSize="sm" display="inline">
                {children};
              </Text>
            );
          }
        }

        // Default list item formatting for all other cases
        return (
          <Text
            as="li"
            mb={2}
            lineHeight="1.6"
            fontSize="sm"
            display="list-item"
            color="text.primary"
          >
            {children}
          </Text>
        );
      },
      code: ({ children, inline, className }: any) => {
        // Check if this is a mermaid code block
        const language = className?.replace('language-', '');
        
        if (!inline && language === 'mermaid') {
          // Extract the actual text content from children
          let diagramContent = '';
          
          // Helper function to recursively extract text
          const extractText = (node: any): string => {
            if (typeof node === 'string') {
              return node;
            }
            if (Array.isArray(node)) {
              return node.map(extractText).join('');
            }
            if (node?.props?.children) {
              return extractText(node.props.children);
            }
            if (node?.props?.value) {
              return node.props.value;
            }
            return '';
          };
          
          diagramContent = extractText(children);
          
          // Log what we extracted for debugging
          if (diagramContent) {
            console.debug('[MarkdownConfig] Extracted Mermaid diagram', {
              contentLength: diagramContent.length,
              preview: diagramContent.substring(0, 50),
            });
            return <MermaidDiagram diagram={diagramContent} />;
          } else {
            console.warn('[MarkdownConfig] Failed to extract Mermaid diagram content', { children });
          }
        }
        
        // Regular inline code
        if (inline) {
          return (
            <Text
              as="code"
              bg={codeBg}
              px={1}
              py={0.5}
              borderRadius="sm"
              fontSize="xs"
              fontFamily="mono"
            >
              {children}
            </Text>
          );
        }
        
        // Regular code block (handled by pre)
        return <>{children}</>;
      },
      pre: ({ children }: MarkdownComponentProps) => (
        <Box
          as="pre"
          bg={preBg}
          p={3}
          borderRadius="md"
          mb={3}
          overflow="auto"
          fontSize="xs"
          fontFamily="mono"
        >
          {children}
        </Box>
      ),
      blockquote: ({ children }: MarkdownComponentProps) => (
        <Box
          borderLeft="4px solid"
          borderColor="blue.400"
          pl={4}
          py={2}
          bg={blockquoteBg}
          mb={3}
          borderRadius="md"
        >
          {children}
        </Box>
      ),
      h1: ({ children }: MarkdownComponentProps) => (
        <Text
          fontSize="xl"
          fontWeight="bold"
          mb={4}
          mt={6}
          color={markdownH1Color}
          borderBottom="2px solid"
          borderColor="border.light"
          pb={2}
        >
          {children}
        </Text>
      ),
      h2: ({ children }: MarkdownComponentProps) => (
        <Text
          fontSize="lg"
          fontWeight="bold"
          mb={3}
          mt={5}
          color={markdownH1Color}
        >
          {children}
        </Text>
      ),
      h3: ({ children }: MarkdownComponentProps) => (
        <Text
          fontSize="md"
          fontWeight="bold"
          mb={2}
          mt={4}
          color={markdownH3Color}
        >
          {children}
        </Text>
      ),
      // Handle line breaks better
      br: () => <br />,
      // Handle plain text with proper whitespace
      text: ({ children }: MarkdownComponentProps) => children,
      // Handle tables
      table: ({ children }: MarkdownComponentProps) => (
        <Box as="table" width="100%" mb={3} sx={{ borderCollapse: 'collapse' }}>
          {children}
        </Box>
      ),
      th: ({ children }: TableCellProps) => (
        <Text
          as="th"
          p={2}
          borderBottom="1px solid"
          borderColor={tableBorderColor}
          fontWeight="600"
          textAlign="left"
          fontSize="sm"
        >
          {children}
        </Text>
      ),
      td: ({ children }: TableCellProps) => (
        <Text
          as="td"
          p={2}
          borderBottom="1px solid"
          borderColor={tableBorderColor}
          fontSize="sm"
        >
          {children}
        </Text>
      ),
    }),
    [
      codeBg,
      preBg,
      blockquoteBg,
      markdownH1Color,
      markdownH3Color,
      tableBorderColor,
      pageContext,
    ]
  );

  return MarkdownComponents;
};
