/**
 * Styles for the patent editor (Tiptap)
 *
 * USPTO COMPLIANCE (2024): Margins per USPTO requirements - top/bottom/right ≥0.75",
 * left ≥1", Times New Roman 12pt, with double spacing support to avoid $400 surcharge.
 * Responsive breakpoints maintain proportional spacing on smaller screens.
 */

/**
 * Tiptap editor styles with USPTO compliance and dark mode support
 */
export const TIPTAP_EDITOR_STYLES = `
  /* Font scaling variable */
  .patent-editor-tiptap {
    --font-scale: 1;
    --zoom-scale: 1;
    /* USPTO spacing options */
    --line-height: 1.5; /* Default 1.5 spacing */
    --line-height-double: 2.0; /* Double spacing for USPTO */
    /* Performance optimizations */
    contain: layout style paint;
    isolation: isolate;
  }

  /* USPTO double spacing mode */
  .patent-editor-tiptap.uspto-double-spacing {
    --line-height: 2.0;
  }
  
  /* Custom scrollbar styles */
  .patent-editor-tiptap::-webkit-scrollbar {
    width: 8px;
  }
  
  .patent-editor-tiptap::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .patent-editor-tiptap::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 24px;
  }
  
  .patent-editor-tiptap::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  /* Tiptap editor container */
  .patent-editor-tiptap {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-family: "Times New Roman", Times, serif;
    line-height: var(--line-height);
    color: var(--colors-text-primary);
  }

  /* USPTO-compliant content area margins */
  .patent-editor-tiptap .ProseMirror {
    flex: 1;
    /* USPTO margins: top/bottom/right ≥0.75", left ≥1" (converted to pixels at 96dpi) */
    padding: 72px 72px 72px 96px; /* 0.75" = 72px, 1" = 96px at 96dpi */
    border: none;
    outline: none;
    background: var(--colors-bg-primary);
    height: auto;
    /* USPTO font requirement: Times New Roman 12pt */
    font-size: calc(12pt * var(--font-scale)); /* 12pt for USPTO compliance */
    line-height: var(--line-height);
    font-family: "Times New Roman", Times, serif;
    color: var(--colors-text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-kerning: normal;
    font-variant-ligatures: common-ligatures;
    caret-color: var(--colors-text-primary);
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
  
  .patent-editor-tiptap .ProseMirror-focused {
    outline: none;
  }
  
  /* Apply zoom transformation */
  .patent-editor-tiptap .ProseMirror {
    transform: scale(var(--zoom-scale));
    transform-origin: top left;
    width: calc(100% / var(--zoom-scale));
    will-change: transform;
  }

  /* Section headers with USPTO compliance */
  .patent-editor-tiptap .ProseMirror h1,
  .patent-editor-tiptap .ProseMirror h2,
  .patent-editor-tiptap .ProseMirror h3 {
    font-weight: bold;
    margin: 0.5em 0 0.25em 0;
    color: var(--colors-text-primary);
    line-height: var(--line-height);
  }

  .patent-editor-tiptap .ProseMirror h1 {
    font-size: calc(14pt * var(--font-scale)); /* Slightly larger for titles */
  }

  .patent-editor-tiptap .ProseMirror h2 {
    font-size: calc(12pt * var(--font-scale)); /* Same as body text per USPTO */
  }

  .patent-editor-tiptap .ProseMirror h3 {
    font-size: calc(12pt * var(--font-scale)); /* Same as body text per USPTO */
  }

  /* Paragraphs with USPTO line spacing */
  .patent-editor-tiptap .ProseMirror p {
    margin: 0.25em 0;
    line-height: var(--line-height);
    color: var(--colors-text-primary);
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: none;
    font-size: calc(12pt * var(--font-scale)); /* USPTO 12pt requirement */
  }

  /* Lists with USPTO spacing */
  .patent-editor-tiptap .ProseMirror ul,
  .patent-editor-tiptap .ProseMirror ol {
    margin: 0.5em 0;
    padding-left: 2em;
    color: var(--colors-text-primary);
    line-height: var(--line-height);
    /* Reset any text-align that might be inherited */
    text-align: left !important;
  }

  .patent-editor-tiptap .ProseMirror li {
    margin: 0.25em 0;
    color: var(--colors-text-primary);
    line-height: var(--line-height);
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
    line-height: var(--line-height);
  }

  /* Patent-specific ordered list styles for claims */
  .patent-editor-tiptap .ProseMirror ol.patent-ordered-list {
    counter-reset: patent-claim;
    list-style-type: none;
    padding-left: 0;
    margin-left: 2em;
    line-height: var(--line-height);
  }

  .patent-editor-tiptap .ProseMirror ol.patent-ordered-list > li.patent-list-item {
    counter-increment: patent-claim;
    position: relative;
    padding-left: 2em;
    text-align: left !important;
    line-height: var(--line-height);
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
    line-height: var(--line-height);
  }

  /* Fallback styles for regular ordered lists (in case classes aren't applied) */
  .patent-editor-tiptap .ProseMirror ol:not(.patent-ordered-list) {
    list-style-type: decimal;
    list-style-position: outside;
    padding-left: 2em;
    margin-left: 0;
    line-height: var(--line-height);
  }

  .patent-editor-tiptap .ProseMirror ol:not(.patent-ordered-list) > li {
    display: list-item;
    text-align: left !important;
    padding-left: 0.5em;
    line-height: var(--line-height);
  }

  /* Prevent nested paragraphs in any list from causing formatting issues */
  .patent-editor-tiptap .ProseMirror li p:first-child {
    display: inline;
    line-height: var(--line-height);
  }

  .patent-editor-tiptap .ProseMirror li p:not(:first-child) {
    display: block;
    margin-top: 0.5em;
    line-height: var(--line-height);
  }

  /* Text formatting */
  .patent-editor-tiptap .ProseMirror strong {
    font-weight: bold;
    color: var(--colors-text-primary);
  }

  .patent-editor-tiptap .ProseMirror em {
    font-style: italic;
    color: var(--colors-text-primary);
  }

  .patent-editor-tiptap .ProseMirror u {
    text-decoration: underline;
    color: var(--colors-text-primary);
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

  /* Patent-specific styles with USPTO compliance */
  .patent-editor-tiptap .ProseMirror .section-header {
    font-weight: 600;
    text-transform: uppercase;
    margin: 0.75em 0 0.25em 0;
    font-size: calc(12pt * var(--font-scale)) !important; /* USPTO 12pt requirement */
    color: var(--colors-text-primary);
    letter-spacing: 0.03em;
    border-bottom: 2px solid var(--colors-border-primary);
    padding-bottom: 0.25em;
    line-height: var(--line-height);
  }

  .patent-editor-tiptap .ProseMirror h2.patent-title,
  .patent-editor-tiptap .ProseMirror .section-header.patent-title {
    font-size: calc(14pt * var(--font-scale)) !important; /* Slightly larger for title */
    text-align: center !important;
    margin: 0 0 2em 0 !important;
    font-weight: 700 !important;
    text-transform: none !important;
    color: var(--colors-text-primary) !important;
    line-height: var(--line-height) !important;
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
    line-height: var(--line-height);
  }

  /* Improved paragraph styling with USPTO spacing */
  .patent-editor-tiptap .ProseMirror p {
    margin: 0.25em 0;
    line-height: var(--line-height);
    text-align: left;
  }

  /* Reduce spacing for empty paragraphs (single line breaks) */
  .patent-editor-tiptap .ProseMirror p:empty {
    margin: 0.1em 0;
    line-height: var(--line-height);
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

  /* Selection */
  .patent-editor-tiptap .ProseMirror ::selection {
    background: var(--colors-bg-selected);
    color: var(--colors-text-primary);
  }

  /* Dark mode styles are handled via the theme system */

  /* USPTO-compliant responsive adjustments (maintain margin ratios) */
  @media (max-width: 1024px) {
    .patent-editor-tiptap .ProseMirror {
      /* Reduce margins proportionally for tablets */
      padding: 54px 54px 54px 72px; /* 0.75x original margins */
    }
  }

  @media (max-width: 768px) {
    .patent-editor-tiptap .ProseMirror {
      /* Further reduce for mobile while maintaining left margin priority */
      padding: 36px 36px 36px 48px; /* 0.5x original margins */
      font-size: calc(11pt * var(--font-scale)); /* Slightly smaller for mobile */
    }
  }

  @media (max-width: 480px) {
    .patent-editor-tiptap .ProseMirror {
      /* Minimal margins for very small screens */
      padding: 24px 24px 24px 32px; /* Maintain proportion */
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

  /* Force all H2 elements to USPTO standard size */
  .patent-editor-tiptap .ProseMirror h2 {
    font-size: calc(12pt * var(--font-scale)) !important; /* USPTO 12pt requirement */
    font-weight: 600 !important;
  }

  /* Force all H1 elements to be slightly larger but compliant */
  .patent-editor-tiptap .ProseMirror h1 {
    font-size: calc(14pt * var(--font-scale)) !important; /* Slightly larger for titles */
    font-weight: 600 !important;
  }

  /* Patent paragraph numbering styles - content-based approach with USPTO compliance */
  .patent-editor-tiptap .ProseMirror .patent-paragraph-number {
    display: inline;
    color: var(--colors-text-primary);
    font-family: "Times New Roman", Times, serif;
    font-size: calc(12pt * var(--font-scale)); /* USPTO 12pt requirement */
    margin-right: 0.5em;
    font-weight: normal;
    vertical-align: baseline;
    line-height: inherit;
    /* Content-based numbers are selectable for editing */
    user-select: text;
    pointer-events: auto;
  }

  /* Ensure decorations container doesn't interfere with layout */
  .patent-editor-tiptap .ProseMirror .ProseMirror-widget {
    display: inline;
    vertical-align: baseline;
    pointer-events: none;
    position: static;
    transform: none;
    margin: 0;
    padding: 0;
  }

  /* Dark mode support for paragraph numbers */
  @media (prefers-color-scheme: dark) {
    .patent-editor-tiptap .ProseMirror .patent-paragraph-number {
      color: var(--colors-text-primary);
    }
  }

  /* Ensure paragraph numbers don't affect text alignment */
  .patent-editor-tiptap .ProseMirror p {
    position: relative;
  }

  /* Prevent layout shift from decorations */
  .patent-editor-tiptap .ProseMirror {
    position: relative;
    /* Ensure stable layout */
    contain: layout style;
  }

  /* Print styles for patent paragraph numbers with USPTO compliance */
  @media print {
    .patent-editor-tiptap .ProseMirror {
      /* Ensure print margins match USPTO requirements */
      padding: 72px 72px 72px 96px !important;
      font-size: 12pt !important;
      line-height: 2.0 !important; /* Double spacing for print */
    }
    
    .patent-editor-tiptap .ProseMirror .patent-paragraph-number {
      color: black !important;
    }
    
    .patent-editor-tiptap .ProseMirror * {
      font-family: "Times New Roman", Times, serif !important;
      color: black !important;
    }
  }
`;

// Responsive styles that will be injected globally
export const TIPTAP_RESPONSIVE_STYLES = `
  /* Additional responsive styles for Tiptap with USPTO compliance */
  .patent-editor-container .patent-editor-tiptap {
    width: 100%;
  }

  /* USPTO-compliant responsive breakpoints */
  @media (max-width: 1024px) {
    .patent-editor-tiptap .ProseMirror {
      /* Reduce margins proportionally for tablets while maintaining USPTO ratios */
      padding: 54px 54px 54px 72px; /* 0.75x original margins */
    }
  }

  @media (max-width: 768px) {
    .patent-editor-tiptap .ProseMirror {
      /* Further reduce for mobile while maintaining left margin priority */
      padding: 36px 36px 36px 48px; /* 0.5x original margins */
      font-size: calc(11pt * var(--font-scale)); /* Slightly smaller for mobile readability */
    }
    
    /* Adjust heading sizes for mobile */
    .patent-editor-tiptap .ProseMirror h1 {
      font-size: calc(13pt * var(--font-scale));
    }
    
    .patent-editor-tiptap .ProseMirror h2 {
      font-size: calc(11pt * var(--font-scale));
    }
    
    .patent-editor-tiptap .ProseMirror h3 {
      font-size: calc(11pt * var(--font-scale));
    }
  }

  @media (max-width: 480px) {
    .patent-editor-tiptap .ProseMirror {
      /* Minimal margins for very small screens while maintaining proportion */
      padding: 24px 24px 24px 32px; /* Maintain left margin priority */
      font-size: calc(10pt * var(--font-scale)); /* Minimum readable size */
    }
  }

  /* Print optimizations for USPTO compliance */
  @media print {
    .patent-editor-container {
      background: white !important;
    }
    
    .patent-editor-tiptap {
      background: white !important;
      box-shadow: none !important;
      border: none !important;
    }
    
    .patent-editor-tiptap .ProseMirror {
      background: white !important;
      color: black !important;
      /* Force USPTO print margins and double spacing */
      padding: 72px 72px 72px 96px !important; /* 0.75" and 1" margins */
      font-size: 12pt !important; /* USPTO font size requirement */
      line-height: 2.0 !important; /* Double spacing for USPTO */
      font-family: "Times New Roman", Times, serif !important;
    }
    
    /* Ensure all text is black for printing */
    .patent-editor-tiptap .ProseMirror * {
      color: black !important;
      background: transparent !important;
    }
    
    /* Hide decorative elements */
    .patent-editor-tiptap .ProseMirror::before,
    .patent-editor-tiptap .ProseMirror::after {
      display: none !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .patent-editor-tiptap .ProseMirror {
      color: var(--colors-text-primary) !important;
      background: var(--colors-bg-primary) !important;
    }
    
    .patent-editor-tiptap .ProseMirror .section-header {
      border-bottom-color: var(--colors-text-primary) !important;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .patent-editor-tiptap .ProseMirror {
      transition: none !important;
      transform: none !important;
      animation: none !important;
    }
    
    .patent-editor-tiptap .ProseMirror * {
      transition: none !important;
      animation: none !important;
    }
  }
`;
