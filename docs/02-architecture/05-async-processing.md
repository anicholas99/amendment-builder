# 2.5 Asynchronous Processing

This document explains the application's strategy for handling long-running, asynchronous tasks like AI-powered analysis and third-party API calls.

## The Challenge

Certain operations, such as performing a deep semantic search or extracting citations from a large document, can take a significant amount of time (from 20 seconds to over a minute). A standard synchronous API request would time out or lock up the user interface, providing a poor user experience.

## The Solution: "In-Process" Background Jobs

Instead of requiring a separate worker service (which would complicate deployment), the application handles these tasks **asynchronously within the main Node.js process**.

This approach provides the benefits of background processing—like non-blocking API responses—without the operational overhead of managing a separate fleet of workers.

### How It Works

1.  **Initiation**: A user action triggers an API request to an "async" endpoint (e.g., `/api/search-history/async-search`).
2.  **Immediate Response**: The API route does **not** perform the long-running task directly. Instead, it:
    a.  Validates the request.
    b.  Creates a job record in the database with a `processing` status.
    c.  Returns a `202 Accepted` response to the client **immediately**, including a unique `jobId`.
3.  **Background Execution**: The API route then uses `setImmediate()` or `process.nextTick()` to schedule the long-running task to be executed on the Node.js event loop as soon as the current operation (sending the HTTP response) is complete.
    ```typescript
    // Simplified example from an API route
    
    // 1. Create the job record in the database
    const job = await createSearchJob(payload);
    
    // 2. Return the job ID to the client immediately
    res.status(202).json({ jobId: job.id, status: 'processing' });
    
    // 3. Schedule the heavy work to run in the background
    setImmediate(async () => {
      try {
        const results = await performLongRunningSearch(payload);
        // Update the job record in the database with results
        await completeSearchJob(job.id, results);
      } catch (error) {
        // Update the job record with an error status
        await failSearchJob(job.id, error);
      }
    });
    ```
4.  **Client-Side Polling**: The client, having received the `jobId`, begins to poll a separate status endpoint (e.g., `/api/jobs/[jobId]/status`) every few seconds.
5.  **Status Updates**: The status endpoint queries the database for the job record and returns its current status (`processing`, `completed`, or `failed`).
6.  **Completion**: Once the polling endpoint returns a `completed` status, it also includes the final results of the job. The client can then stop polling and display the results to the user.

## Feature Flag: `USE_CITATION_WORKER`

For high-throughput environments, the system can be configured to use a more robust queue-based system with external workers (e.g., Azure WebJobs).

-   **`USE_CITATION_WORKER=false` (Default)**: Uses the "in-process" background job strategy described above.
-   **`USE_CITATION_WORKER=true`**: Pushes a job message to an Azure Storage Queue instead of using `setImmediate()`. This requires a separate worker service to be deployed and running to process messages from the queue.

This flag allows the application to be deployed in a simple, single-process configuration or a more scalable, distributed configuration depending on the need. 