import { css } from '@emotion/react';
import { Variants } from 'framer-motion';

/**
 * Animation variants for patent components
 */
export const patentAnimationVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/**
 * Markdown styles for patent content
 */
export const markdownStyles = css`
  h1,
  h2 {
    font-weight: bold;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.5rem;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 0.3rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  ul,
  ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  code {
    background-color: #f7f7f7;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
  }

  blockquote {
    border-left: 4px solid #e2e8f0;
    padding-left: 1rem;
    color: #4a5568;
    font-style: italic;
    margin: 1rem 0;
  }
`;
