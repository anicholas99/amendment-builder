# 4.3 Monitoring & Health

This document provides an overview of the application's logging, monitoring, and health check systems, which are essential for maintaining a reliable production environment.

## Structured Logging

-   **Library**: [Winston](https://github.com/winstonjs/winston) is used for structured logging.
-   **Logger Instance**: A singleton logger instance is available throughout the application and should be used instead of `console.log`.
    ```typescript
    import { logger } from '@/lib/monitoring/logger';

    logger.info('User created successfully', { userId: '123' });
    logger.error('Database connection failed', { error: 'Connection timed out' });
    ```
-   **Log Levels**: The logger supports standard log levels (`error`, `warn`, `info`, `debug`). The minimum log level is configurable via the `LOG_LEVEL` environment variable.
-   **Production Output**: In production, the logger outputs JSON-formatted strings to the console (`stdout`). This allows the hosting provider (e.g., Azure App Service) to easily collect, parse, and index the logs.

## Health Checks

The application exposes a comprehensive health check endpoint that can be used by monitoring services or container orchestrators to verify the application's status.

-   **Endpoint**: `GET /api/health`
-   **Simple Response**: By default, it returns a simple status response. This is ideal for load balancers that only need to know if the application is healthy.
    -   `200 OK`: `{"status":"healthy", ...}`
    -   `503 Service Unavailable`: `{"status":"unhealthy", ...}`
-   **Detailed Response**: You can get a detailed breakdown of all health checks by adding the `?detailed=true` query parameter.

### Health Checks Performed

The health check system verifies the status of all critical downstream dependencies:

1.  **Database**: Checks if a connection can be established with the database and if it can perform a simple query.
2.  **External APIs**:
    -   **Auth0**: Verifies that the Auth0 authentication service is reachable.
    -   **AI Providers**: Checks the status of the configured AI provider (e.g., Azure OpenAI).
3.  **Storage**: Confirms that the configured storage (Azure Blob Storage or local file system) is accessible.
4.  **Memory**: Monitors the application's memory usage and reports a `degraded` or `unhealthy` status if usage exceeds predefined thresholds (75% and 90%, respectively).

## Monitoring in Azure

When deployed to **Azure App Service**, you can leverage several built-in monitoring features:

-   **Log Stream**: View the application's real-time console output (our structured logs) directly in the Azure Portal or via the Azure CLI.
-   **Application Insights**: While not yet fully integrated, the application is compatible with Azure Application Insights for more advanced monitoring, including performance metrics, request tracing, and alerting.
-   **Health Check Probes**: Configure the App Service health check feature to periodically ping the `/api/health` endpoint and automatically restart unhealthy instances. 