import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/clientLogger';
import DOMPurify from 'dompurify';

interface MermaidDiagramProps {
  diagram: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ diagram }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Theme colors for Mermaid diagrams
  // Mermaid requires hex colors, so we disable the hardcoded-colors rule for this specific use case
  /* eslint-disable local/no-hardcoded-colors */
  const bgColor = 'white';
  const darkBgColor = '#1e1e1e';
  const lineColor = '#666666';
  const darkLineColor = '#969696';
  const primaryColor = '#3065B5';
  const darkPrimaryColor = '#4a7fc7';
  const primaryTextColor = '#ffffff';
  const primaryBorderColor = '#2455a4';
  const darkPrimaryBorderColor = '#5990d9';
  const secondaryColor = '#f3e5f5';
  const darkSecondaryColor = '#3c3c3c';
  /* eslint-enable local/no-hardcoded-colors */

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);

        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;

        // Detect dark mode
        const isDarkMode =
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Initialize mermaid with theme-aware colors
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: isDarkMode ? darkPrimaryColor : primaryColor,
            primaryTextColor: primaryTextColor,
            primaryBorderColor: isDarkMode
              ? darkPrimaryBorderColor
              : primaryBorderColor,
            lineColor: isDarkMode ? darkLineColor : lineColor,
            secondaryColor: isDarkMode ? darkSecondaryColor : secondaryColor,
            background: isDarkMode ? darkBgColor : bgColor,
            mainBkg: isDarkMode ? darkBgColor : bgColor,
            secondBkg: isDarkMode ? darkSecondaryColor : secondaryColor,
            tertiaryColor: isDarkMode ? darkBgColor : bgColor,
            fontFamily:
              '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
          securityLevel: 'strict', // Changed from 'loose' - prevents script injection
        });

        // Generate unique ID for this diagram
        const randomBytes = new Uint8Array(9);
        crypto.getRandomValues(randomBytes);
        const id = `mermaid-${Array.from(randomBytes, byte => byte.toString(36))
          .join('')
          .substr(0, 9)}`;

        // Clean the diagram text
        const cleanDiagram = diagram.trim();

        logger.debug('[MermaidDiagram] Attempting to render diagram', {
          id,
          diagramLength: cleanDiagram.length,
          diagramPreview: cleanDiagram.substring(0, 100),
          // Add more debugging info
          diagramType: cleanDiagram.split('\n')[0]?.trim(), // First line usually indicates diagram type
          hasContent: cleanDiagram.length > 0,
          lineCount: cleanDiagram.split('\n').length,
        });

        // Validate diagram has content
        if (!cleanDiagram || cleanDiagram.length === 0) {
          throw new Error('Empty diagram content provided');
        }

        // Basic validation for common Mermaid diagram types
        const validDiagramTypes = [
          'graph',
          'flowchart',
          'sequenceDiagram',
          'classDiagram',
          'stateDiagram',
          'gantt',
          'pie',
          'journey',
        ];
        const firstLine = cleanDiagram.split('\n')[0]?.trim().toLowerCase();
        const hasValidType = validDiagramTypes.some(type =>
          firstLine.includes(type)
        );

        if (!hasValidType) {
          logger.warn('[MermaidDiagram] Potentially invalid diagram type', {
            firstLine,
            expectedTypes: validDiagramTypes,
          });
        }

        // Create a temporary element for rendering
        const tempDiv = document.createElement('div');
        tempDiv.id = id;
        tempDiv.textContent = cleanDiagram;
        document.body.appendChild(tempDiv);

        try {
          // Render the diagram
          const { svg } = await mermaid.render(id, cleanDiagram, tempDiv);

          // Sanitize the SVG to prevent XSS attacks
          const sanitizedSvg = DOMPurify.sanitize(svg, {
            ADD_TAGS: [
              'svg',
              'g',
              'path',
              'rect',
              'circle',
              'text',
              'line',
              'polygon',
              'ellipse',
              'polyline',
              'defs',
              'marker',
              'linearGradient',
              'stop',
              'pattern',
              'clipPath',
              'mask',
            ],
            ADD_ATTR: [
              'viewBox',
              'fill',
              'stroke',
              'stroke-width',
              'cx',
              'cy',
              'r',
              'x',
              'y',
              'width',
              'height',
              'd',
              'points',
              'transform',
              'style',
              'class',
              'id',
              'markerEnd',
              'markerStart',
              'gradientUnits',
              'x1',
              'x2',
              'y1',
              'y2',
              'offset',
              'stop-color',
              'stop-opacity',
            ],
          });

          setRenderedSvg(sanitizedSvg);
          setError('');

          logger.info('[MermaidDiagram] Successfully rendered diagram', { id });
        } finally {
          // Clean up temporary element
          if (tempDiv.parentNode) {
            tempDiv.parentNode.removeChild(tempDiv);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Create a more detailed error object that serializes properly
        const errorDetails = {
          message: errorMessage,
          diagramPreview: diagram.substring(0, 200),
          diagramLength: diagram.length,
          errorType: err instanceof Error ? err.name : typeof err,
          // Include stack trace if available
          stack:
            err instanceof Error && err.stack
              ? err.stack.split('\n').slice(0, 5).join('\n')
              : undefined,
          // Check if this is a Mermaid syntax error
          isSyntaxError:
            errorMessage.includes('syntax') || errorMessage.includes('parse'),
        };

        logger.error('[MermaidDiagram] Failed to render diagram', errorDetails);

        // Provide more helpful error message to user
        let userMessage = 'Failed to render diagram';
        if (errorDetails.isSyntaxError) {
          userMessage =
            'Invalid diagram syntax. Please check the Mermaid syntax.';
        } else if (errorMessage.includes('Cannot read')) {
          userMessage =
            'Diagram rendering error. The diagram format may be unsupported.';
        }

        setError(`${userMessage}: ${errorMessage}`);
        setRenderedSvg('');

        // Try to clean up any partial renders
        const container = containerRef.current;
        if (container) {
          const existingDiagram = container.querySelector('.mermaid');
          if (existingDiagram) {
            existingDiagram.remove();
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [diagram]); // Simplified dependency array

  if (error) {
    return (
      <div
        className={cn(
          'p-4 rounded-md text-sm',
          'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
        )}
      >
        {error}
      </div>
    );
  }

  if (isLoading || !renderedSvg) {
    return (
      <div
        className={cn(
          'p-4 rounded-md border text-sm',
          'bg-background border-border text-muted-foreground'
        )}
      >
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'p-4 rounded-md border overflow-x-auto max-w-full',
        'bg-background border-border',
        '[&_svg]:max-w-full [&_svg]:h-auto'
      )}
      dangerouslySetInnerHTML={{ __html: renderedSvg }}
    />
  );
};
