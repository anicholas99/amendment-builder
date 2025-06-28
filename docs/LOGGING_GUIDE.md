# Logging Guide

## Overview

This application uses a sophisticated logging system designed to provide clear, actionable information while preventing log noise. The logger includes features like:

- **Log deduplication** - Prevents the same message from appearing repeatedly
- **Smart truncation** - Limits object depth and array sizes to keep logs readable
- **Runtime configuration** - Control log levels dynamically without redeploying
- **Category-based filtering** - Enable/disable specific types of logs

## Log Levels

The application uses four log levels:

- **ERROR**: Critical issues that need immediate attention
- **WARN**: Important warnings that might indicate problems
- **INFO**: General information about application state (default in production)
- **DEBUG**: Detailed debugging information (disabled by default)

## Controlling Log Noise

### Using Browser Console

The logging system exposes several helper functions in the browser console:

```javascript
// Enable verbose logging (shows all log categories and levels)
enableVerboseLogging()

// Disable verbose logging (returns to default settings)
disableVerboseLogging()

// Check current logging configuration
loggerConfig()

// Access the configuration directly
__LOGGER_CONFIG__
```

### Log Categories

You can enable/disable specific categories of logs:

```javascript
// Enable only specific categories
__LOGGER_CONFIG__.logCategories.navigation = true
__LOGGER_CONFIG__.logCategories.dataFetching = false
__LOGGER_CONFIG__.logCategories.performance = false
__LOGGER_CONFIG__.logCategories.userActions = true
__LOGGER_CONFIG__.logCategories.errors = true
__LOGGER_CONFIG__.logCategories.debug = false
```

## Features

### Deduplication

The logger automatically prevents duplicate messages within a time window:

- Same messages within 1 second (development) or 5 seconds (production) are deduplicated
- Error messages are never deduplicated to ensure critical issues are visible

### Smart Object Truncation

Large objects are automatically truncated to prevent console spam:

- Maximum object depth: 3 levels (2 in production)
- Maximum array items: 5 (3 in production)  
- Maximum string length: 500 characters (200 in production)
- Circular references are handled gracefully

### Performance Considerations

The logger is optimized for performance:

- Logs below the minimum level are never processed
- Deduplication cache is cleaned periodically
- Object stringification is optimized

## Best Practices

### For Developers

1. **Use appropriate log levels**:
   ```typescript
   logger.error('Critical error occurred', { error });  // For errors
   logger.warn('Unexpected behavior', { context });     // For warnings
   logger.info('User action completed', { action });    // For important events
   logger.debug('Detailed state', { data });           // For debugging
   ```

2. **Avoid logging in render functions** - This causes excessive logs
3. **Log meaningful context** - Include relevant data but avoid entire objects
4. **Use conditional logging** for expensive operations:
   ```typescript
   if (items.length > 100) {
     logger.warn('Large dataset detected', { count: items.length });
   }
   ```

### For Production

1. The default configuration shows only INFO and ERROR logs
2. Use browser console helpers to enable verbose logging when debugging
3. Logs are automatically cleaned up to prevent memory leaks

## Troubleshooting

### Too Many Logs

1. Run `disableVerboseLogging()` in the console
2. Check for components logging in render functions
3. Look for loops that might be logging excessively

### Missing Logs

1. Check the current log level with `loggerConfig()`
2. Enable verbose logging with `enableVerboseLogging()`
3. Verify the log category is enabled

### Performance Issues

1. Disable debug logging in production
2. Check for large objects being logged
3. Use the deduplication feature by avoiding unique timestamps in log messages

## Environment-Specific Behavior

- **Development**: INFO level, 1-second deduplication, more verbose truncation
- **QA**: INFO level, 3-second deduplication, moderate truncation
- **Production**: INFO level, 5-second deduplication, aggressive truncation

## Examples

### Good Logging

```typescript
// Concise, actionable information
logger.info('Patent saved successfully', { 
  patentId: patent.id, 
  wordCount: content.length 
});

// Conditional debug logging
if (citations.length > 20) {
  logger.debug('Large citation set', { 
    count: citations.length,
    firstFew: citations.slice(0, 3)
  });
}
```

### Poor Logging

```typescript
// Don't log entire objects
logger.debug('State update', entireReduxState); // BAD

// Don't log in tight loops
items.forEach(item => {
  logger.debug('Processing item', item); // BAD - will spam logs
});

// Don't log sensitive data
logger.info('User login', { password: user.password }); // BAD - security risk
```

## API Logging Best Practices

### Reducing Log Redundancy

To prevent duplicate logging in API routes, we provide the `withApiLogging` middleware that automatically handles request/response logging. This eliminates the need for manual `logRequest` and `logResponse` calls.

#### Traditional Approach (Verbose)
```typescript
// This creates redundant logs
const apiLogger = createApiLogger('my-route');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);  // Logs "Request received"
  apiLogger.info('Fetching data');  // Another log immediately after
  
  const data = await fetchData();
  
  apiLogger.logResponse(200, data);
  res.status(200).json(data);
}
```

#### Recommended Approach (Clean)
```typescript
import { withApiLogging } from '@/middleware/withApiLogging';

async function handler(req: NextApiRequest, res: NextApiResponse, apiLogger: ApiLogger) {
  // No need for logRequest - handled automatically
  apiLogger.info('Fetching data');  // Your operation-specific log
  
  const data = await fetchData();
  
  // No need for logResponse - handled automatically
  res.status(200).json(data);
}

export default withApiLogging('my-route', handler);
```

### Benefits
- **Automatic request/response logging** - No manual calls needed
- **Automatic error handling** - Catches and logs errors consistently
- **Reduced redundancy** - Request details logged at debug level
- **Cleaner code** - Focus on business logic, not logging boilerplate

### Migration Guide

When updating existing routes:
1. Import `withApiLogging` instead of creating logger manually
2. Remove `createApiLogger` call
3. Remove `logRequest` and `logResponse` calls
4. Add `apiLogger` as third parameter to handler
5. Wrap export with `withApiLogging`

**Note**: This is optional - existing routes will continue to work. Consider migrating high-traffic routes first to reduce log volume. 