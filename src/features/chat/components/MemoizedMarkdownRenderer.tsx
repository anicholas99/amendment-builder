import React, { memo, useMemo, useRef, useEffect, startTransition, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkBreaks from 'remark-breaks';
import { ClaimRevisionDiff } from './ClaimRevisionDiff';
import { logger } from '@/lib/monitoring/logger';

interface MemoizedMarkdownRendererProps {
  content: string;
  isStreaming: boolean;
  pageContext: string;
  projectId: string;
  formatPatentClaim: (text: string) => string;
  MarkdownComponentsWithClaims: Components;
  justCompleted?: boolean;
}

// Cache for processed markdown to avoid re-parsing
const markdownCache = new Map<string, React.ReactNode>();

export const MemoizedMarkdownRenderer = memo<MemoizedMarkdownRendererProps>(({
  content,
  isStreaming,
  pageContext,
  projectId,
  formatPatentClaim,
  MarkdownComponentsWithClaims,
  justCompleted,
}) => {
  // Keep track of the last rendered content to avoid re-processing
  const lastProcessedContentRef = useRef<React.ReactNode | null>(null);
  const lastContentRef = useRef<string>('');
  const lastStreamingStateRef = useRef<boolean | null>(null);
  const [deferredContent, setDeferredContent] = useState<React.ReactNode | null>(null);
  
  // Generate a cache key based on content and context
  const cacheKey = useMemo(
    () => `${pageContext}-${content.length}-${content.slice(0, 100)}`,
    [pageContext, content]
  );

  // If content hasn't changed but streaming state has, reuse the last processed content
  if (content === lastContentRef.current && 
      lastStreamingStateRef.current === true && 
      isStreaming === false &&
      lastProcessedContentRef.current) {
    lastStreamingStateRef.current = isStreaming;
    logger.debug('[MemoizedMarkdownRenderer] Reusing content after streaming ended');
    return (
      <Box
        position="relative"
        style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {lastProcessedContentRef.current}
      </Box>
    );
  }

  // Update refs
  lastContentRef.current = content;
  lastStreamingStateRef.current = isStreaming;

  // Process the content only when it changes
  const processedContent = useMemo(() => {
    // For streaming content, use lightweight processing
    if (isStreaming) {
      // Skip expensive regex operations during streaming
      const result = (
        <ReactMarkdown
          components={MarkdownComponentsWithClaims}
          remarkPlugins={[remarkGfm, remarkBreaks]}
        >
          {content}
        </ReactMarkdown>
      );
      
      // Store for potential reuse
      lastProcessedContentRef.current = result;
      lastContentRef.current = content;
      
      return result;
    }

    // Check cache first (only for non-streaming content)
    if (!isStreaming && markdownCache.has(cacheKey)) {
      const cached = markdownCache.get(cacheKey)!;
      lastProcessedContentRef.current = cached;
      lastContentRef.current = content;
      return cached;
    }

    // For completed messages, defer expensive processing
    if (!isStreaming && content.length > 500) {
      // Show simple markdown first
      const simpleResult = (
        <ReactMarkdown
          components={MarkdownComponentsWithClaims}
          remarkPlugins={[remarkGfm, remarkBreaks]}
        >
          {content}
        </ReactMarkdown>
      );

      // Defer expensive processing
      startTransition(() => {
        // Clean escaped newlines and fix formatting
        let safeContent = content.replace(/\\n/g, '\n');

        // Check for REVISION_DIFF sections
        const revisionDiffPattern = /<!-- REVISION_DIFF -->\n([\s\S]*?)\n<!-- END_REVISION_DIFF -->/g;
        const revisionMatches = [...safeContent.matchAll(revisionDiffPattern)];
        
        if (revisionMatches.length > 0) {
          // Parse the revision data and render with diff component
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          
          revisionMatches.forEach((match, idx) => {
            // Add content before this match
            const beforeContent = safeContent.slice(lastIndex, match.index!);
            if (beforeContent) {
              // Only apply patent claim formatting to actual claim text
              let formattedContent = beforeContent;
              if (
                pageContext === 'claim-refinement' &&
                /^Claim\s+\d+:\s*A\s+/m.test(formattedContent)
              ) {
                formattedContent = formatPatentClaim(formattedContent);
              }
              
              parts.push(
                <Box key={`text-${idx}`}>
                  <ReactMarkdown
                    components={MarkdownComponentsWithClaims}
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                  >
                    {formattedContent}
                  </ReactMarkdown>
                </Box>
              );
            }
            
            // Parse and render the diff component
            try {
              const diffData = JSON.parse(match[1]);
              parts.push(
                <ClaimRevisionDiff
                  key={`diff-${idx}`}
                  claimId={diffData.claimId}
                  claimNumber={diffData.claimNumber}
                  changes={diffData.changes}
                  projectId={projectId}
                  proposedText={diffData.proposedText}
                />
              );
            } catch (error) {
              logger.error('[MemoizedMarkdownRenderer] Failed to parse revision diff data', { error });
            }
            
            lastIndex = match.index! + match[0].length;
          });
          
          // Add any remaining content
          const remainingContent = safeContent.slice(lastIndex);
          if (remainingContent) {
            let formattedContent = remainingContent;
            if (
              pageContext === 'claim-refinement' &&
              /^Claim\s+\d+:\s*A\s+/m.test(formattedContent)
            ) {
              formattedContent = formatPatentClaim(formattedContent);
            }
            
            parts.push(
              <Box key={`text-final`}>
                <ReactMarkdown
                  components={MarkdownComponentsWithClaims}
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                >
                  {formattedContent}
                </ReactMarkdown>
              </Box>
            );
          }
          
          const result = <>{parts}</>;
          
          // Cache and update deferred content
          markdownCache.set(cacheKey, result);
          setDeferredContent(result);
          
          // Limit cache size
          if (markdownCache.size > 100) {
            const firstKey = markdownCache.keys().next().value;
            if (firstKey) {
              markdownCache.delete(firstKey);
            }
          }
        } else {
          // No revision diffs, but still apply formatting
          if (
            pageContext === 'claim-refinement' &&
            /^Claim\s+\d+:\s*A\s+/m.test(safeContent)
          ) {
            safeContent = formatPatentClaim(safeContent);
          }

          const result = (
            <ReactMarkdown
              components={MarkdownComponentsWithClaims}
              remarkPlugins={[remarkGfm, remarkBreaks]}
            >
              {safeContent}
            </ReactMarkdown>
          );

          markdownCache.set(cacheKey, result);
          setDeferredContent(result);
        }
      });

      return simpleResult;
    }

    // Clean escaped newlines and fix formatting
    let safeContent = content.replace(/\\n/g, '\n');

    // Check for REVISION_DIFF sections
    const revisionDiffPattern = /<!-- REVISION_DIFF -->\n([\s\S]*?)\n<!-- END_REVISION_DIFF -->/g;
    const revisionMatches = [...safeContent.matchAll(revisionDiffPattern)];
      
    if (revisionMatches.length > 0) {
      // Parse the revision data and render with diff component
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      
      revisionMatches.forEach((match, idx) => {
        // Add content before this match
        const beforeContent = safeContent.slice(lastIndex, match.index!);
        if (beforeContent) {
          // Only apply patent claim formatting to actual claim text
          let formattedContent = beforeContent;
          if (
            pageContext === 'claim-refinement' &&
            /^Claim\s+\d+:\s*A\s+/m.test(formattedContent)
          ) {
            formattedContent = formatPatentClaim(formattedContent);
          }
          
          parts.push(
            <Box key={`text-${idx}`}>
              <ReactMarkdown
                components={MarkdownComponentsWithClaims}
                remarkPlugins={[remarkGfm, remarkBreaks]}
              >
                {formattedContent}
              </ReactMarkdown>
            </Box>
          );
        }
        
        // Parse and render the diff component
        try {
          const diffData = JSON.parse(match[1]);
          parts.push(
            <ClaimRevisionDiff
              key={`diff-${idx}`}
              claimId={diffData.claimId}
              claimNumber={diffData.claimNumber}
              changes={diffData.changes}
              projectId={projectId}
              proposedText={diffData.proposedText}
            />
          );
        } catch (error) {
          logger.error('[MemoizedMarkdownRenderer] Failed to parse revision diff data', { error });
        }
        
        lastIndex = match.index! + match[0].length;
      });
      
      // Add any remaining content
      const remainingContent = safeContent.slice(lastIndex);
      if (remainingContent) {
        let formattedContent = remainingContent;
        if (
          pageContext === 'claim-refinement' &&
          /^Claim\s+\d+:\s*A\s+/m.test(formattedContent)
        ) {
          formattedContent = formatPatentClaim(formattedContent);
        }
        
        parts.push(
          <Box key={`text-final`}>
            <ReactMarkdown
              components={MarkdownComponentsWithClaims}
              remarkPlugins={[remarkGfm, remarkBreaks]}
            >
              {formattedContent}
            </ReactMarkdown>
          </Box>
        );
      }
      
      const result = <>{parts}</>;
      
      // Cache the result for non-streaming content
      if (!isStreaming) {
        markdownCache.set(cacheKey, result);
        // Limit cache size
        if (markdownCache.size > 100) {
          const firstKey = markdownCache.keys().next().value;
          if (firstKey) {
            markdownCache.delete(firstKey);
          }
        }
      }
      
      return result;
    }

    // No revision diffs, render normally
    // Only apply patent claim formatting to actual claim text
    if (
      pageContext === 'claim-refinement' &&
      /^Claim\s+\d+:\s*A\s+/m.test(safeContent)
    ) {
      safeContent = formatPatentClaim(safeContent);
    }

    const result = (
      <ReactMarkdown
        components={MarkdownComponentsWithClaims}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {safeContent}
      </ReactMarkdown>
    );

    // Cache the result for non-streaming content
    if (!isStreaming) {
      markdownCache.set(cacheKey, result);
      // Limit cache size
      if (markdownCache.size > 100) {
        const firstKey = markdownCache.keys().next().value;
        if (firstKey) {
          markdownCache.delete(firstKey);
        }
      }
    }

    return result;
  }, [content, isStreaming, pageContext, projectId, formatPatentClaim, MarkdownComponentsWithClaims, cacheKey]);

  // Use deferred content if available for long messages
  const finalContent = deferredContent || processedContent;

  return (
    <Box
      position="relative"
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {finalContent}
      {isStreaming && (
        <Text
          as="span"
          display="inline-block"
          width="8px"
          height="16px"
          bg="currentColor"
          ml={1}
          animation="blink 1s infinite"
          sx={{
            '@keyframes blink': {
              '0%, 50%': { opacity: 1 },
              '51%, 100%': { opacity: 0 },
            },
          }}
        />
      )}
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if content or streaming state changes
  return (
    prevProps.content === nextProps.content &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.pageContext === nextProps.pageContext
  );
});

MemoizedMarkdownRenderer.displayName = 'MemoizedMarkdownRenderer'; 