# Patent Section Handling

This directory contains utilities for managing patent document sections. Understanding how this works is crucial for maintaining consistent behavior.

## Overview

Patent documents are structured with specific sections (Title, Field, Background, etc.). This system handles:
- Extracting sections from generated or edited content
- Normalizing section names (e.g., "CLAIM SET" → "CLAIMS")
- Saving sections to the database
- Rebuilding full documents from sections

## Key Concepts

### 1. Section Configuration (`sectionConfig.ts`)

The `PATENT_SECTION_CONFIG` defines:
- **Standard section names** - The canonical name for each section
- **Aliases** - Alternative names that map to the standard (e.g., "FIELD OF THE INVENTION" → "FIELD")
- **Auto-creation rules** - Whether a section should be created when detected
- **Required sections** - Which sections must be present

### 2. Section Extraction (`extractSections.ts`)

When content is saved:
1. The system extracts sections from the HTML/text content
2. Section headers are detected using regex patterns or HTML tags
3. Section names are normalized using the configuration
4. Only sections marked for `autoCreate: true` are created

### 3. Why CLAIMS Might Appear

The CLAIMS section has `autoCreate: false` in the configuration. This means:
- It won't be created automatically when detected in text
- It will only exist if explicitly added by the generation process
- This prevents unexpected sections from appearing after edits

If you're seeing CLAIMS appear unexpectedly, check:
1. Is the AI generation explicitly creating it?
2. Is there legacy code bypassing the configuration?
3. Are there manual edits adding claim-like headers?

## Common Issues and Solutions

### Issue: Sections appearing/disappearing on save
**Cause**: The extraction logic was too aggressive in detecting sections
**Solution**: We now use `autoCreate` flags to control which sections can be created

### Issue: Duplicate sections with different names
**Cause**: Multiple aliases mapping to the same section
**Solution**: The normalization logic deduplicates using standard names

### Issue: Section content being lost
**Cause**: Section headers being detected within content
**Solution**: More precise regex patterns and HTML-aware extraction

## Best Practices

1. **Always use the configuration** - Don't hardcode section names
2. **Test section extraction** - When modifying patterns, test with real patent content
3. **Log section operations** - Use logger.debug for troubleshooting
4. **Preserve user content** - Never auto-delete sections, only add/update

## Architecture Decisions

1. **Why normalize section names?**
   - Patents from different sources use different naming conventions
   - Consistent names simplify database queries and UI display

2. **Why extract sections at all?**
   - Enables section-specific editing and formatting
   - Allows for section-level version comparison
   - Supports incremental updates from AI tools

3. **Why the autoCreate flag?**
   - Prevents unexpected sections from appearing
   - Gives explicit control over document structure
   - Maintains backward compatibility while improving predictability

## Future Improvements

1. Make section extraction optional (full document mode vs. section mode)
2. Add validation for required sections
3. Support custom section types for specific industries
4. Implement section-level permissions/locking 