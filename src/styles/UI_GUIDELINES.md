# UI Consistency Guidelines

This document outlines the UI consistency guidelines for the Patent Drafter AI application to ensure a cohesive user experience across all views.

## Headers

All main view headers use the standardized `ViewHeader` component with fixed titles:

1. **Patent Application View**: Always displays "Patent Application" as the title
2. **Claim Refinement View**: Always displays "Claim Refinement" as the title
3. **Technology Details View**: Always displays "Technology Details" as the title

## Button Order

Buttons in headers should follow this standard order:

1. **Mode/Edit buttons** (if applicable)
2. **Version History** button
3. **Consistency/Verification** buttons
4. **Save/Version** buttons
5. **Export/Action** buttons (primary action)
6. **Settings/Configuration** buttons (if applicable)

## Button Styling

- **Primary buttons** (`buttonStyles.primary`): Used only for the main action in each view (typically export actions)
- **Secondary buttons** (`buttonStyles.secondary`): Used for all supporting actions
- **Danger buttons** (`buttonStyles.danger`): Used for destructive actions
- **Success buttons** (`buttonStyles.success`): Used for confirmation actions

## Button Labels

Use consistent terminology across all views:

- "Version History" (not just "History")
- "Check Consistency" (not "Verify")
- "Export DOCX" / "Export JSON" (include the format)
- "Save Version" (not just "Save")

## Icons

Use consistent icons for the same actions across all views:

- Version History: `FiClock`
- Check Consistency/Verify: `FiCheckCircle`
- Export: `FiDownload`
- Import: `FiUpload`
- Save: `FiSave`
- Edit: `FiEdit`
- Settings: `FiSettings`
- Search: `FiSearch`

## Spacing and Layout

- All headers have consistent padding and spacing
- Buttons within headers have consistent spacing
- Content areas have consistent padding and margins

## Modals

- All modals have consistent header styling
- Modal action buttons are positioned consistently
- Confirmation modals use consistent button labeling

## Forms

- Form elements have consistent styling
- Form labels are positioned consistently
- Validation errors are displayed consistently

## Loading States

- Loading indicators are displayed consistently
- Progress indicators use the same styling

## Error Handling

- Error messages have consistent styling and positioning
- Toast notifications use consistent duration and styling
