import React from 'react';
import { cn } from '@/lib/utils';
import { MermaidDiagram } from './MermaidDiagram';
import { logger } from '@/utils/clientLogger';

interface CodeBlockProps {
  children: any;
  inline?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  inline,
  className,
}) => {
  // Extract language from className
  const language = className?.replace('language-', '') || '';

  // Helper function to extract text content
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

  // For inline code
  if (inline) {
    return (
      <code
        className={cn(
          // Exact visual consistency with theme styles
          'bg-accent px-1 py-0.5 rounded-sm text-[0.85em] font-mono inline-block leading-[1.4]'
        )}
      >
        {children}
      </code>
    );
  }

  // For code blocks - check if it's mermaid
  if (language === 'mermaid') {
    const diagramContent = extractText(children);

    if (diagramContent) {
      logger.debug('[CodeBlock] Rendering Mermaid diagram', {
        contentLength: diagramContent.length,
        preview: diagramContent.substring(0, 50),
      });
      return <MermaidDiagram diagram={diagramContent} />;
    } else {
      logger.warn('[CodeBlock] Failed to extract Mermaid diagram content');
      // Fall through to regular code block
    }
  }

  // Regular code block - just return children for pre to handle
  return <>{children}</>;
};
