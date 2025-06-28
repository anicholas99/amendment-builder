import React, { useEffect, useRef, useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';

interface MermaidDiagramProps {
  diagram: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ diagram }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const lineColor = useColorModeValue('gray.600', 'gray.400');
  
  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      
      try {
        setIsLoading(true);
        
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid with theme-aware colors
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#e3f2fd',
            primaryTextColor: '#0d47a1',
            primaryBorderColor: '#1976d2',
            lineColor: lineColor,
            secondaryColor: '#f3e5f5',
            background: bgColor,
            mainBkg: bgColor,
            secondBkg: '#f5f5f5',
            tertiaryColor: '#fff',
            fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
          securityLevel: 'loose', // Allow more flexibility in rendering
        });
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
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
        const validDiagramTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'gantt', 'pie', 'journey'];
        const firstLine = cleanDiagram.split('\n')[0]?.trim().toLowerCase();
        const hasValidType = validDiagramTypes.some(type => firstLine.includes(type));
        
        if (!hasValidType) {
          logger.warn('[MermaidDiagram] Potentially invalid diagram type', { 
            firstLine,
            expectedTypes: validDiagramTypes 
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
          setRenderedSvg(svg);
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
          stack: err instanceof Error && err.stack ? err.stack.split('\n').slice(0, 5).join('\n') : undefined,
          // Check if this is a Mermaid syntax error
          isSyntaxError: errorMessage.includes('syntax') || errorMessage.includes('parse'),
        };
        
        logger.error('[MermaidDiagram] Failed to render diagram', errorDetails);
        
        // Provide more helpful error message to user
        let userMessage = 'Failed to render diagram';
        if (errorDetails.isSyntaxError) {
          userMessage = 'Invalid diagram syntax. Please check the Mermaid syntax.';
        } else if (errorMessage.includes('Cannot read')) {
          userMessage = 'Diagram rendering error. The diagram format may be unsupported.';
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
  }, [diagram, bgColor, textColor, lineColor]);
  
  if (error) {
    return (
      <Box
        p={4}
        bg="red.50"
        _dark={{ bg: 'red.900', color: 'red.300' }}
        color="red.600"
        borderRadius="md"
        fontSize="sm"
      >
        {error}
      </Box>
    );
  }
  
  if (isLoading || !renderedSvg) {
    return (
      <Box
        p={4}
        bg={bgColor}
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        _dark={{ borderColor: 'gray.700' }}
        fontSize="sm"
        color="gray.500"
      >
        Loading diagram...
      </Box>
    );
  }
  
  return (
    <Box
      ref={containerRef}
      p={4}
      bg={bgColor}
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      _dark={{ borderColor: 'gray.700' }}
      overflowX="auto"
      maxW="100%"
      dangerouslySetInnerHTML={{ __html: renderedSvg }}
      sx={{
        '& svg': {
          maxWidth: '100%',
          height: 'auto',
        },
      }}
    />
  );
}; 