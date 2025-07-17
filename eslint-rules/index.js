/**
 * Custom ESLint Rules
 *
 * Export all custom rules for the project
 */

module.exports = {
  'no-legacy-error-handling': require('./no-legacy-error-handling'),
  'no-direct-prisma-import': require('./no-direct-prisma-import'),
  'no-direct-react-query-hooks': require('./no-direct-react-query-hooks'),
  'no-direct-api-calls': require('./no-direct-api-calls'),
  'no-direct-env-access': require('./no-direct-env-access'),
  'no-unstable-deps': require('./no-unstable-deps'),
  'no-magic-time-values': require('./no-magic-time-values'),
  'no-hardcoded-colors': require('./no-hardcoded-colors'),
  'no-mixed-exports-in-components': require('./no-mixed-exports-in-components'),
  'no-singleton-services': require('./no-singleton-services'),
  'no-console-logs': require('./no-console-logs'),
  'require-secure-presets': require('./require-secure-presets'),
  'enforce-api-response-format': require('./enforce-api-response-format'),
  // 'protect-legacy-endpoints': require('./protect-legacy-endpoints'), // DISABLED - Migration complete!
};
