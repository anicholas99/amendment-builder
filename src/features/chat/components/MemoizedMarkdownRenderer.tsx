import React, {
  memo,
  useMemo,
  useRef,
  useEffect,
  startTransition,
  useState,
} from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkBreaks from 'remark-breaks';
import { ClaimRevisionDiff } from './ClaimRevisionDiff';
import { logger } from '@/utils/clientLogger';

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

/**
 * Filters out HTML comments that should not be visible to users
 * These are typically used for internal processing/communication
 */
const filterInternalComments = (content: string): string => {
  return (
    content
      .replace(/<!--\s*CLAIMS_ADDED[^>]*-->/g, '')
      .replace(/<!--\s*CLAIMS_UPDATED[^>]*-->/g, '')
      .replace(/<!--\s*CLAIMS_DELETED[^>]*-->/g, '')
      .replace(/<!--\s*INVENTION_UPDATED[^>]*-->/g, '')
      .replace(/<!--\s*FIGURE_CREATED[^>]*-->/g, '')
      .replace(/<!--\s*SEARCH_COMPLETED[^>]*-->/g, '')
      .replace(/<!--\s*ANALYSIS_COMPLETED[^>]*-->/g, '')
      // Remove any standalone HTML comments that look like internal commands
      // BUT preserve REVISION_DIFF comments for the diff parser
      .replace(
        /<!--\s*(?!REVISION_DIFF|END_REVISION_DIFF)[A-Z_]+(?::[^>]*)?\s*-->/g,
        ''
      )
      // Clean up any extra whitespace left behind
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  );
};

export const MemoizedMarkdownRenderer = memo<MemoizedMarkdownRendererProps>(
  ({
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

    // Filter out internal comments early
    const cleanContent = useMemo(
      () => filterInternalComments(content),
      [content]
    );

    // Generate a cache key based on content and context
    const cacheKey = useMemo(
      () =>
        `${pageContext}-${cleanContent.length}-${cleanContent.slice(0, 100)}`,
      [pageContext, cleanContent]
    );

    // Determine if we can reuse the last processed content to avoid expensive re-processing.
    const canReuseLastContent = useMemo(() => {
      return (
        cleanContent === lastContentRef.current &&
        lastStreamingStateRef.current === true &&
        isStreaming === false &&
        lastProcessedContentRef.current !== null
      );
    }, [cleanContent, isStreaming]);

    // Always keep refs up to date for future comparisons
    lastContentRef.current = cleanContent;
    lastStreamingStateRef.current = isStreaming;

    // Process the content only when it changes
    const processedContent = useMemo(() => {
      // Fast path: reuse previously processed content when appropriate
      if (canReuseLastContent && lastProcessedContentRef.current) {
        logger.debug(
          '[MemoizedMarkdownRenderer] Reusing content after streaming ended'
        );
        return lastProcessedContentRef.current;
      }

      // Use consistent processing for both streaming and completed states
      // This prevents layout shifts during the streaming -> completed transition

      // Check cache first (only for non-streaming content)
      if (!isStreaming && markdownCache.has(cacheKey)) {
        const cached = markdownCache.get(cacheKey)!;
        lastProcessedContentRef.current = cached;
        lastContentRef.current = cleanContent;
        return cached;
      }

      // Clean escaped newlines and fix formatting
      let safeContent = cleanContent.replace(/\\n/g, '\n');

      // Check for REVISION_DIFF sections
      const revisionDiffPattern =
        /<!-- REVISION_DIFF -->\s*\n([\s\S]*?)\n\s*<!-- END_REVISION_DIFF -->/g;
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
              <div key={`text-${idx}`}>
                <ReactMarkdown
                  components={MarkdownComponentsWithClaims}
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                >
                  {formattedContent}
                </ReactMarkdown>
              </div>
            );
          }

          // Parse and render the diff component
          try {
            const rawJson = match[1].trim();
            logger.debug(
              '[MemoizedMarkdownRenderer] Parsing revision diff JSON',
              {
                rawJson:
                  rawJson.substring(0, 200) +
                  (rawJson.length > 200 ? '...' : ''),
                fullLength: rawJson.length,
              }
            );

            const diffData = JSON.parse(rawJson);

            // Validate required fields
            if (
              !diffData.claimId ||
              !diffData.claimNumber ||
              !diffData.changes
            ) {
              throw new Error('Missing required fields in revision diff data');
            }

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
            logger.error(
              '[MemoizedMarkdownRenderer] Failed to parse revision diff data',
              {
                error: error instanceof Error ? error.message : 'Unknown error',
                rawData:
                  match[1].substring(0, 500) +
                  (match[1].length > 500 ? '...' : ''),
                fullMatch: match[0].substring(0, 200) + '...',
              }
            );

            // Fallback: render as raw text with error message
            parts.push(
              <div
                key={`error-${idx}`}
                className="p-4 border border-red-300 bg-red-50 rounded-md text-red-700"
              >
                <p className="font-semibold">Error parsing revision data</p>
                <p className="text-sm mt-1">
                  There was an issue displaying the claim revision. Raw data:
                </p>
                <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-x-auto">
                  {match[1]}
                </pre>
              </div>
            );
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
            <div key={`text-final`}>
              <ReactMarkdown
                components={MarkdownComponentsWithClaims}
                remarkPlugins={[remarkGfm, remarkBreaks]}
              >
                {formattedContent}
              </ReactMarkdown>
            </div>
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

        // Store for potential reuse
        lastProcessedContentRef.current = result;
        lastContentRef.current = cleanContent;

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

      // Store for potential reuse
      lastProcessedContentRef.current = result;
      lastContentRef.current = cleanContent;

      return result;
    }, [
      canReuseLastContent,
      isStreaming,
      cleanContent,
      cacheKey,
      pageContext,
      formatPatentClaim,
      MarkdownComponentsWithClaims,
      projectId,
    ]);

    // Return the processed content directly - no more deferred content logic
    return (
      <div
        className="relative"
        style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {processedContent}
        {isStreaming && cleanContent && (
          <span className="inline-block ml-1">
            <span className="animate-pulse text-primary">▊</span>
          </span>
        )}
      </div>
    );
  }
);

MemoizedMarkdownRenderer.displayName = 'MemoizedMarkdownRenderer';
