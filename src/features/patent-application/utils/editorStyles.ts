/**
 * Styles for the patent editor
 */

/**
 * Generate editor styles based on zoom level
 *
 * @param zoomLevel Zoom level percentage (e.g., 100 for 100%)
 * @returns CSS object for the editor
 */
export const EDITOR_STYLES = (zoomLevel: number) => ({
  '.quill': {
    height: 'calc(100vh - 150px)',
    display: 'flex',
    flexDir: 'column',
    border: 'none',
    width: '100%',
    overflowY: 'auto',
    backgroundColor: 'white',
  },
  '.ql-container': {
    fontSize: `${16 * (zoomLevel / 100)}px`,
    fontFamily: "'Georgia', 'Merriweather', 'Times New Roman', serif",
    flex: 1,
    minHeight: '500px',
    border: 'none',
    lineHeight: '1.6',
    color: '#2D3748',
    width: '100%',
    overflowY: 'auto',
    backgroundColor: 'white',
  },
  // Scrollbar styling - always use light mode colors
  '::-webkit-scrollbar': {
    width: '8px',
  },
  '::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
  },
  '::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '24px',
  },
  '::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(0, 0, 0, 0.3)',
  },
  '.ql-toolbar.ql-snow': {
    position: 'sticky',
    top: '0',
    zIndex: '90',
    backgroundColor: 'white',
    padding: '8px 16px',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: '12px',
    marginBottom: '0',
    height: 'auto',
    minHeight: '46px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  '.ql-toolbar.ql-snow .ql-formats': {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  '.ql-toolbar.ql-snow button': {
    padding: '0 5px',
    height: '28px',
    width: '28px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '@media (max-width: 768px)': {
    '.ql-toolbar.ql-snow': {
      padding: '8px 8px',
      gap: '6px',
    },
    '.ql-toolbar.ql-snow .ql-formats': {
      marginRight: '6px',
    },
    '.ql-toolbar.ql-snow button': {
      padding: '0 3px',
    },
  },
  // Font selector styles
  '.ql-font': {
    minWidth: '120px',
  },
  '.ql-font .ql-picker-label': {
    padding: '0 18px 0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '24px',
  },
  '.ql-font .ql-picker-options': {
    padding: '8px 0',
    width: '180px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    borderRadius: '4px',
  },
  '.ql-font .ql-picker-item': {
    padding: '5px 10px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    textAlign: 'left',
    borderBottom: '1px solid #f3f3f3',
  },
  '.ql-font .ql-picker-item:hover': {
    backgroundColor: '#f5f5f5',
  },
  '.ql-font .ql-picker-item:last-child': {
    borderBottom: 'none',
  },
  // Font family styles
  '.ql-picker-item.ql-font-serif': {
    fontFamily: "'Times New Roman', Georgia, serif",
  },
  '.ql-picker-item.ql-font-sans-serif': {
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  '.ql-picker-item.ql-font-monospace': {
    fontFamily: "'Courier New', Courier, monospace",
  },
  // Applied font styles in the editor
  '.ql-editor .ql-font-serif': {
    fontFamily: "'Times New Roman', Georgia, serif",
  },
  '.ql-editor .ql-font-sans-serif': {
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  '.ql-editor .ql-font-monospace': {
    fontFamily: "'Courier New', Courier, monospace",
  },

  // Editor content styles - minimal properties to avoid conflicts with global CSS
  '.ql-editor': {
    minHeight: '500px',
    fontSize: `${16 * (zoomLevel / 100)}px`,
    lineHeight: '1.7',
    color: '#2D3748',
    padding: '16px 24px',
  },
  '.ql-editor h1': {
    fontSize: `${34 * (zoomLevel / 100)}px`,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: `${32 * (zoomLevel / 100)}px`,
    lineHeight: '1.4',
    color: '#1A202C',
  },
  '.ql-editor h2.section-header': {
    fontWeight: '600',
    fontSize: `${24 * (zoomLevel / 100)}px`,
    fontFamily: "'Georgia', 'Merriweather', 'Times New Roman', serif",
    color: '#1A202C',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  '.ql-editor h2.patent-title': {
    fontSize: `${28 * (zoomLevel / 100)}px`,
    fontWeight: '600',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    color: '#1A202C',
  },
  '.ql-editor .section-spacer': {
    height: '36px',
    display: 'block',
  },
  '.ql-editor ul, .ql-editor ol': {
    paddingLeft: '24px',
  },
  '.ql-editor strong, .ql-editor b': {
    color: '#1A202C',
    fontWeight: '600',
  },
  '.ql-editor em, .ql-editor i': {
    fontStyle: 'italic',
    color: '#2D3748',
  },
});

// Add responsive styles that will be injected globally
export const RESPONSIVE_EDITOR_STYLES = `
/* Toolbar styles to fix icon spacing */
.ql-toolbar.ql-snow {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: flex-start !important;
  gap: 12px !important;
}

.ql-toolbar.ql-snow .ql-formats {
  margin-right: 12px !important;
  display: flex !important;
  align-items: center !important;
}

.ql-toolbar.ql-snow button {
  height: 28px !important;
  width: 28px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

@media (max-width: 768px) {
  .ql-toolbar.ql-snow {
    padding: 8px 8px !important;
    gap: 8px !important;
  }
  .ql-toolbar.ql-snow .ql-formats {
    margin-right: 8px !important;
  }
}
`;
