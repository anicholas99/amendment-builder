/**
 * Styles for the Tiptap patent editor
 */

/**
 * Base font sizes for different zoom levels and global scaling
 */
export const BASE_FONT_SIZES = {
  default: 16,
  h1Multiplier: 1.8,
  h2Multiplier: 1.5,
  h3Multiplier: 1.2,
};

/**
 * Calculate scaled font size
 */
export const calculateScaledFontSize = (baseSize: number, multiplier: number = 1) => {
  return `${baseSize * multiplier}px`;
};

/**
 * Generate editor styles based on zoom level
 */
export const TIPTAP_EDITOR_STYLES = (zoomLevel: number) => ({
  '.tiptap-editor-container': {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  '.editor-content-wrapper': {
    flex: '1',
    overflow: 'auto',
    position: 'relative',
  },
  '.ProseMirror': {
    fontSize: calculateScaledFontSize(BASE_FONT_SIZES.default, zoomLevel / 100),
    fontFamily: "'Georgia', 'Times New Roman', serif",
    lineHeight: '1.6',
    color: 'var(--chakra-colors-text-primary)',
    padding: '24px 100px',
    outline: 'none',
    height: 'auto',
    '& p': {
      marginTop: '0',
      marginBottom: '0.25em',
      textIndent: '0',
    },
    '& h2.section-header + p': {
      marginTop: '0 !important',
    },
    '& h1': {
      fontSize: calculateScaledFontSize(BASE_FONT_SIZES.default * BASE_FONT_SIZES.h1Multiplier, zoomLevel / 100),
      fontWeight: '600',
      marginTop: '0.5em',
      marginBottom: '0.25em',
      color: 'var(--chakra-colors-text-primary)',
    },
    '& h2': {
      fontSize: calculateScaledFontSize(BASE_FONT_SIZES.default * BASE_FONT_SIZES.h2Multiplier, zoomLevel / 100),
      fontWeight: '600',
      marginTop: '0.5em',
      marginBottom: '0.25em',
      color: 'var(--chakra-colors-text-primary)',
    },
    '& h3': {
      fontSize: calculateScaledFontSize(BASE_FONT_SIZES.default * BASE_FONT_SIZES.h3Multiplier, zoomLevel / 100),
      fontWeight: '600',
      marginTop: '0.5em',
      marginBottom: '0.25em',
      color: 'var(--chakra-colors-text-primary)',
    },
  },
});

// Add responsive styles that will be injected globally
export const RESPONSIVE_TIPTAP_STYLES = `
.tiptap-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.editor-content-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
}

.ProseMirror {
  height: auto;
  outline: none;
}

.tiptap-toolbar {
  border-bottom: 1px solid var(--chakra-colors-border-primary);
  background: var(--chakra-colors-bg-primary);
  padding: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tiptap-toolbar button {
  margin: 0 2px;
}

.tiptap-toolbar button.is-active {
  background-color: var(--chakra-colors-bg-selected);
}
`;

/**
 * Tiptap editor styles to match Quill appearance with dark mode support
 */

export const TIPTAP_EDITOR_STYLES_QUILL = `
  /* Import Quill snow theme for consistency */
  @import url('https://cdn.quilljs.com/1.3.6/quill.snow.css');

  /* Font scaling variable */
  .patent-editor-tiptap {
    --font-scale: 1;
    /* Performance optimizations */
    contain: layout style paint;
    isolation: isolate;
  }

  /* Tiptap editor container */
  .patent-editor-tiptap {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    line-height: 1.6;
    color: var(--chakra-colors-text-primary);
  }

  /* Tiptap content area */
  .patent-editor-tiptap .ProseMirror {
    flex: 1;
    padding: 40px 80px;
    border: none;
    outline: none;
    background: var(--chakra-colors-bg-primary);
    height: auto;
    font-size: calc(15px * var(--font-scale));
    line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    color: var(--chakra-colors-text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-kerning: normal;
    font-variant-ligatures: common-ligatures;
    caret-color: var(--chakra-colors-text-primary);
    /* Prevent any unwanted transitions */
    transition: none !important;
  }

  /* Prevent transitions on all child elements */
  .patent-editor-tiptap .ProseMirror * {
    transition: none !important;
  }

  /* Apply font scale to all text elements */
  .patent-editor-tiptap .ProseMirror *:not([style*="font-size"]) {
    font-size: inherit;
  }
  
  /* Elements with explicit font sizes should scale proportionally */
  .patent-editor-tiptap .ProseMirror [style*="font-size"] {
    font-size: calc(var(--original-size, 1em) * var(--font-scale)) !important;
  }

  /* Font family and size support */
  /* Tiptap applies inline styles directly, so we ensure they work properly */
  .patent-editor-tiptap .ProseMirror span[data-text-style] {
    /* Styles are applied inline by Tiptap */
  }

  /* Ensure nested elements inherit font styles */
  .patent-editor-tiptap .ProseMirror span[style] strong,
  .patent-editor-tiptap .ProseMirror span[style] em,
  .patent-editor-tiptap .ProseMirror span[style] u {
    font-family: inherit;
    font-size: inherit;
  }

  /* Focus styles */
  .patent-editor-tiptap .ProseMirror:focus {
    outline: none;
    border: none;
  }

  /* Section headers */
  .patent-editor-tiptap .ProseMirror h1,
  .patent-editor-tiptap .ProseMirror h2,
  .patent-editor-tiptap .ProseMirror h3 {
    font-weight: bold;
    margin: 0.5em 0 0.25em 0;
    color: var(--chakra-colors-text-primary);
  }

  .patent-editor-tiptap .ProseMirror h1 {
    font-size: calc(1.8em * var(--font-scale));
  }

  .patent-editor-tiptap .ProseMirror h2 {
    font-size: calc(1.5em * var(--font-scale));
  }

  .patent-editor-tiptap .ProseMirror h3 {
    font-size: calc(1.2em * var(--font-scale));
  }

  /* Paragraphs */
  .patent-editor-tiptap .ProseMirror p {
    margin: 0.25em 0;
    line-height: 1.6;
    color: var(--chakra-colors-text-primary);
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: none;
  }

  /* Lists */
  .patent-editor-tiptap .ProseMirror ul,
  .patent-editor-tiptap .ProseMirror ol {
    margin: 0.5em 0;
    padding-left: 2em;
    color: var(--chakra-colors-text-primary);
    /* Reset any text-align that might be inherited */
    text-align: left !important;
  }

  .patent-editor-tiptap .ProseMirror li {
    margin: 0.25em 0;
    color: var(--chakra-colors-text-primary);
    /* Ensure list items don't inherit problematic text alignment */
    text-align: left !important;
    /* Prevent any additional indentation from parent elements */
    text-indent: 0 !important;
  }

  /* Specific styles for ordered lists to prevent formatting issues */
  .patent-editor-tiptap .ProseMirror ol li {
    /* Ensure proper list item display */
    display: list-item;
    /* Reset any inherited styles that might cause indentation */
    padding-left: 0;
    margin-left: 0;
  }

  /* Fix for list items with text-align attributes */
  .patent-editor-tiptap .ProseMirror li[data-text-align],
  .patent-editor-tiptap .ProseMirror li p[data-text-align] {
    /* Override any text-align on list items */
    text-align: left !important;
  }

  /* Ensure paragraphs inside list items don't cause issues */
  .patent-editor-tiptap .ProseMirror li > p {
    margin: 0;
    text-align: left !important;
    text-indent: 0 !important;
  }

  /* Patent-specific ordered list styles for claims */
  .patent-editor-tiptap .ProseMirror ol.patent-ordered-list {
    counter-reset: patent-claim;
    list-style-type: none;
    padding-left: 0;
    margin-left: 2em;
  }

  .patent-editor-tiptap .ProseMirror ol.patent-ordered-list > li.patent-list-item {
    counter-increment: patent-claim;
    position: relative;
    padding-left: 2em;
    text-align: left !important;
  }

  .patent-editor-tiptap .ProseMirror ol.patent-ordered-list > li.patent-list-item::before {
    content: counter(patent-claim) ". ";
    position: absolute;
    left: 0;
    font-weight: normal;
  }

  /* Ensure no extra spacing or indentation in claims */
  .patent-editor-tiptap .ProseMirror ol.patent-ordered-list li.patent-list-item p {
    display: inline;
    margin: 0;
    padding: 0;
  }

  /* Fallback styles for regular ordered lists (in case classes aren't applied) */
  .patent-editor-tiptap .ProseMirror ol:not(.patent-ordered-list) {
    list-style-type: decimal;
    list-style-position: outside;
    padding-left: 2em;
    margin-left: 0;
  }

  .patent-editor-tiptap .ProseMirror ol:not(.patent-ordered-list) > li {
    display: list-item;
    text-align: left !important;
    padding-left: 0.5em;
  }

  /* Prevent nested paragraphs in any list from causing formatting issues */
  .patent-editor-tiptap .ProseMirror li p:first-child {
    display: inline;
  }

  .patent-editor-tiptap .ProseMirror li p:not(:first-child) {
    display: block;
    margin-top: 0.5em;
  }

  /* Text formatting */
  .patent-editor-tiptap .ProseMirror strong {
    font-weight: bold;
    color: var(--chakra-colors-text-primary);
  }

  .patent-editor-tiptap .ProseMirror em {
    font-style: italic;
    color: var(--chakra-colors-text-primary);
  }

  .patent-editor-tiptap .ProseMirror u {
    text-decoration: underline;
    color: var(--chakra-colors-text-primary);
  }

  /* Text alignment */
  .patent-editor-tiptap .ProseMirror [data-text-align="left"] {
    text-align: left;
  }

  .patent-editor-tiptap .ProseMirror [data-text-align="center"] {
    text-align: center;
  }

  .patent-editor-tiptap .ProseMirror [data-text-align="right"] {
    text-align: right;
  }

  /* Text alignment - but NOT for lists */
  .patent-editor-tiptap .ProseMirror :not(li):not(ol):not(ul)[data-text-align="left"] {
    text-align: left;
  }

  .patent-editor-tiptap .ProseMirror :not(li):not(ol):not(ul)[data-text-align="center"] {
    text-align: center;
  }

  .patent-editor-tiptap .ProseMirror :not(li):not(ol):not(ul)[data-text-align="right"] {
    text-align: right;
  }

  .patent-editor-tiptap .ProseMirror :not(li):not(ol):not(ul)[data-text-align="justify"] {
    text-align: justify;
  }

  /* Override any text-align on lists - highest specificity */
  .patent-editor-tiptap .ProseMirror ol[data-text-align],
  .patent-editor-tiptap .ProseMirror ul[data-text-align],
  .patent-editor-tiptap .ProseMirror li[data-text-align] {
    text-align: left !important;
  }

  /* Section spacers */
  .patent-editor-tiptap .ProseMirror .section-spacer {
    height: 0.5em;
    margin: 0.25em 0;
  }

  /* Patent-specific styles */
  .patent-editor-tiptap .ProseMirror .section-header {
    font-weight: 600;
    text-transform: uppercase;
    margin: 0.75em 0 0.25em 0;
    font-size: calc(1.3em * var(--font-scale)) !important;
    color: var(--chakra-colors-text-primary);
    letter-spacing: 0.03em;
    border-bottom: 2px solid var(--chakra-colors-border-primary);
    padding-bottom: 0.25em;
  }

  .patent-editor-tiptap .ProseMirror h2.patent-title,
  .patent-editor-tiptap .ProseMirror .section-header.patent-title {
    font-size: calc(2.2em * var(--font-scale)) !important;
    text-align: center !important;
    margin: 0 0 2em 0 !important;
    font-weight: 700 !important;
    text-transform: none !important;
    color: var(--chakra-colors-text-primary) !important;
    line-height: 1.3 !important;
    border-bottom: none !important;
    letter-spacing: normal !important;
    padding-bottom: 0 !important;
  }

  /* Simple direct approach - target ProseMirror directly */
  .ProseMirror h1:first-child,
  .ProseMirror h2:first-child,
  .ProseMirror h3:first-child,
  .ProseMirror p:first-child {
    text-align: center !important;
  }

  .patent-editor-tiptap .ProseMirror .background-paragraph {
    text-align: left;
    margin: 0.25em 0;
    line-height: 1.6;
  }

  /* Improved paragraph styling */
  .patent-editor-tiptap .ProseMirror p {
    margin: 0.25em 0;
    line-height: 1.6;
    text-align: left;
  }

  /* Reduce spacing for empty paragraphs (single line breaks) */
  .patent-editor-tiptap .ProseMirror p:empty {
    margin: 0.1em 0;
  }

  /* Adjacent paragraphs should have tighter spacing */
  .patent-editor-tiptap .ProseMirror p + p {
    margin-top: 0.1em;
  }

  /* Headers followed by paragraphs should have minimal spacing */
  .patent-editor-tiptap .ProseMirror h1 + p,
  .patent-editor-tiptap .ProseMirror h2 + p,
  .patent-editor-tiptap .ProseMirror h3 + p,
  .patent-editor-tiptap .ProseMirror .section-header + p {
    margin-top: 0.1em !important;
  }

  /* Force h2 elements with section-header class to have minimal spacing */
  .patent-editor-tiptap .ProseMirror h2.section-header {
    margin: 0.5em 0 0.15em 0 !important;
    padding-bottom: 0.15em !important;
  }

  /* Any paragraph directly after section header */
  .patent-editor-tiptap .ProseMirror h2.section-header + * {
    margin-top: 0 !important;
  }

  /* Better spacing for section content */
  .patent-editor-tiptap .ProseMirror .section-spacer {
    height: 0.5em;
    margin: 0.25em 0;
  }

  /* Placeholder */
  .patent-editor-tiptap .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: var(--chakra-colors-text-tertiary);
    pointer-events: none;
    height: 0;
  }

  /* Selection */
  .patent-editor-tiptap .ProseMirror ::selection {
    background: var(--chakra-colors-bg-selected);
    color: var(--chakra-colors-text-primary);
  }

  /* Dark mode specific styles */
  @media (prefers-color-scheme: dark) {
    /* Import filter for Quill theme in dark mode */
    .ql-toolbar.ql-snow {
      filter: invert(1) hue-rotate(180deg);
    }
    
    .ql-toolbar.ql-snow button.ql-active {
      filter: invert(1) hue-rotate(180deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .patent-editor-tiptap .ProseMirror {
      padding: 16px 24px;
      font-size: calc(13px * var(--font-scale));
    }
  }

  /* Highly specific: if first heading has explicit left alignment, override */
  .patent-editor-tiptap .ProseMirror h1:first-child[data-text-align="left"],
  .patent-editor-tiptap .ProseMirror h2:first-child[data-text-align="left"],
  .patent-editor-tiptap .ProseMirror h3:first-child[data-text-align="left"] {
    text-align: center !important;
  }

  /* Prevent cursor jumping */
  .patent-editor-tiptap .ProseMirror .ProseMirror-gapcursor {
    display: none;
  }

  /* Force all H2 elements to be larger - very specific selector */
  .patent-editor-tiptap .ProseMirror h2 {
    font-size: calc(1.4em * var(--font-scale)) !important;
    font-weight: 600 !important;
  }

  /* Force all H1 elements to be larger */
  .patent-editor-tiptap .ProseMirror h1 {
    font-size: calc(1.8em * var(--font-scale)) !important;
    font-weight: 600 !important;
  }
`;

export const TIPTAP_RESPONSIVE_STYLES = `
  /* Additional responsive styles for Tiptap */
  .patent-editor-container .patent-editor-tiptap {
    width: 100%;
  }

  @media (max-width: 1024px) {
    .patent-editor-tiptap .ProseMirror {
      padding: 20px 40px;
    }
  }

  @media (max-width: 768px) {
    .patent-editor-tiptap .ProseMirror {
      padding: 16px 24px;
      font-size: 13px;
    }
    
    .patent-editor-tiptap .ProseMirror h1 {
      font-size: calc(1.6em * var(--font-scale));
    }
    
    .patent-editor-tiptap .ProseMirror h2 {
      font-size: calc(1.3em * var(--font-scale));
    }
    
    .patent-editor-tiptap .ProseMirror h3 {
      font-size: calc(1.1em * var(--font-scale));
    }
  }
`;



