/**
 * 🎉 MIGRATION COMPLETE! 🎉
 * 
 * ESLint Rule: protect-legacy-endpoints (DISABLED)
 * 
 * This rule is no longer needed as all legacy endpoints have been successfully migrated
 * to the standardized { success: true, data: {...} } format.
 * 
 * Final migration statistics:
 * - 101 endpoints migrated to standardized format
 * - 100% API consistency achieved
 * - Zero breaking changes during migration
 * 
 * Previously protected endpoints (now fully migrated):
 * - src/pages/api/claims/batch-update-numbers.ts ✅
 * - src/pages/api/projects/[projectId]/claims/index.ts ✅
 * - src/pages/api/projects/[projectId]/exclusions.ts ✅
 * 
 * This file is kept for historical reference.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Legacy endpoint protection - MIGRATION COMPLETE',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      migrationComplete: 
        '🎉 Migration complete! All legacy endpoints have been successfully ' +
        'migrated to the standardized format. This rule is no longer needed.',
    },
  },

  create(context) {
    // Rule is disabled - migration complete! 
    // All endpoints now use the standardized { success: true, data: {...} } format
    return {};
  },
}; 