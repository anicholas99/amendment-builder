# CSP (Content Security Policy) Migration Plan

## Overview

This document outlines the plan to remove `unsafe-inline` from our Content Security Policy to prevent XSS attacks. The migration involves replacing all inline styles with CSS classes and ensuring no functionality breaks.

## Current State

- CSP allows `unsafe-inline` for both `script-src` and `style-src`
- ~100+ components use inline styles via `style={{}}` 
- ~50+ components use Chakra UI's `css` prop for scrollbar styling
- Several components use `fontStyle`, `borderStyle` props

## Migration Strategy

### Phase 1: Infrastructure Setup ✅

1. **Created CSS utility files**:
   - `src/styles/scrollbar.css` - Scrollbar styling classes
   - `src/styles/utilities.css` - Common utility classes
   - `src/lib/security/csp.ts` - Secure CSP configuration

2. **Updated global styles**:
   - Imported new CSS files in `globals.css`
   - Classes are now available globally

### Phase 2: Component Migration (In Progress)

#### High Priority Components (Shared/Common)
- [x] `SimpleMainPanel.tsx` - Migrated scrollbar styles
- [ ] `ViewPanel.tsx` - Similar scrollbar styling
- [ ] `TechnologyInputTextArea.tsx` - Complex inline styles
- [ ] `PatentGenerationPlaceholder.tsx` - Z-index styles
- [ ] `ReferenceNumeral.tsx` - Dynamic positioning

#### Migration Pattern

**Before (Inline Styles)**:
```tsx
<Box
  style={{
    scrollbarWidth: 'thin',
    WebkitOverflowScrolling: 'touch',
  }}
  css={{
    '&::-webkit-scrollbar': { width: '8px' },
    // ... more scrollbar styles
  }}
/>
```

**After (CSS Classes)**:
```tsx
<Box className="custom-scrollbar" />
```

### Phase 3: Dynamic Styles Handling

For components with dynamic styles that can't be replaced with static classes:

1. **Use CSS Variables**:
```tsx
// Instead of
<Box style={{ zIndex: dynamicZIndex }} />

// Use
<Box 
  className="dynamic-z-index" 
  style={{ '--z-index': dynamicZIndex } as React.CSSProperties}
/>
```

2. **Create specific CSS classes**:
```css
.dynamic-z-index {
  z-index: var(--z-index, 1);
}
```

### Phase 4: Testing & Validation

1. **Enable Report-Only CSP**:
   - Test the new CSP without breaking the app
   - Monitor console for violations
   - Fix any remaining inline styles

2. **Update next.config.js**:
```javascript
// First: Report-Only mode
{
  key: 'Content-Security-Policy-Report-Only',
  value: getCSPReportOnlyConfig().value
}

// After validation: Enforce mode
{
  key: 'Content-Security-Policy',
  value: getCSPConfig().value
}
```

## Component Migration Checklist

### Scrollbar Styling
- [ ] CitationResultsTable
- [ ] SavedPriorArtTab
- [ ] CitationAnalysisPanel
- [ ] TechnologyFilesSidebar
- [ ] AddFigureDialog
- [ ] EditableClaim
- [ ] ReferenceListPanel
- [ ] QuerySection
- [ ] ReferenceNumeralsEditor
- [ ] TiptapPatentEditor
- [ ] ChatInterface

### Position/Z-Index Styling
- [ ] PatentGenerationPlaceholder
- [ ] ProcessNode
- [ ] DecisionNode
- [ ] ReferenceNumeral

### Display/Visibility
- [ ] PatentMainPanel (display: none)
- [ ] TechnologyDetailsInput (display: none)
- [ ] FigureCarousel (display: none)

### Text/Font Styling
- [ ] AnalysisResultsPanel (fontFamily: monospace)
- [ ] ElementSection (fontStyle: italic)
- [ ] QuerySection (fontStyle: italic)
- [ ] CitationStatusDisplay (fontStyle: italic)

### Spacing/Layout
- [ ] ProjectDashboardHeader (margins, padding)
- [ ] EmptyProjectState (padding)
- [ ] VersionHistoryPanel (margins)
- [ ] AmendmentSection (display: flex)

## Migration Guidelines

1. **Prefer Chakra UI props over inline styles**:
   ```tsx
   // Good
   <Box mt={4} position="relative" zIndex={1} />
   
   // Avoid
   <Box style={{ marginTop: '16px', position: 'relative', zIndex: 1 }} />
   ```

2. **Use CSS classes for complex/repeated styles**:
   ```tsx
   // Good
   <Box className="custom-scrollbar" />
   
   // Avoid
   <Box css={{ '&::-webkit-scrollbar': {...} }} />
   ```

3. **For dynamic values, use CSS variables**:
   ```tsx
   // Good
   <Box 
     className="zoom-container"
     style={{ '--zoom': `${zoomLevel}%` } as React.CSSProperties}
   />
   ```

## Testing Plan

1. **Visual Regression Testing**:
   - Screenshot key components before/after migration
   - Ensure no visual changes

2. **Functionality Testing**:
   - Test all scrollable areas
   - Verify dynamic styles (zoom, positioning)
   - Check dark mode compatibility

3. **CSP Violation Testing**:
   - Enable CSP Report-Only mode
   - Navigate through all app sections
   - Fix any reported violations

## Rollback Plan

If issues arise:
1. Keep the old CSP in `next.config.js` commented out
2. Can quickly revert by uncommenting old CSP
3. CSS files remain but won't affect anything if not used

## Success Criteria

- [ ] All inline styles removed or replaced
- [ ] No CSP violations in Report-Only mode
- [ ] All visual elements appear correctly
- [ ] Dark mode works properly
- [ ] No functionality regressions
- [ ] CSP enforced without `unsafe-inline`

## Timeline

- Week 1: Migrate common components
- Week 2: Migrate feature-specific components  
- Week 3: Testing and validation
- Week 4: Enable enforced CSP

## Notes

- Some third-party libraries may require `unsafe-inline`
- If absolutely necessary, we can use nonces for specific inline scripts
- Monitor for any performance impacts from additional CSS files 