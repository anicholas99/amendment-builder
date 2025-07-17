# 2.5 Asynchronous Processing

**Last Updated**: January 8, 2025

This document describes the asynchronous processing architecture used in the Patent Drafter AI application for handling long-running operations without blocking the user interface.

## Table of Contents
- [Overview](#-overview)
- [Dual-Mode Architecture](#-dual-mode-architecture)
- [Azure Queue Implementation](#-azure-queue-implementation)
- [In-Process Implementation](#-in-process-implementation)
- [Job Types](#-job-types)
- [Implementation Examples](#-implementation-examples)
- [Monitoring & Debugging](#-monitoring--debugging)

---

## 📋 Overview

The application uses a flexible dual-mode asynchronous processing system that can operate in two modes:

1. **Azure Queue Mode** (Production): Uses Azure Storage Queue for distributed processing
2. **In-Process Mode** (Development): Uses `setImmediate()` for local processing

The mode is controlled by the `USE_CITATION_WORKER` environment variable.

---

## 🔄 Dual-Mode Architecture

### Mode Selection

```typescript
const useWorker = process.env.USE_CITATION_WORKER === 'true';

if (useWorker) {
  // Azure Queue processing
  await queueService.sendMessage(jobData);
} else {
  // In-process processing
  setImmediate(() => processJob(jobData));
}
```

### Benefits

- **Development**: Fast iteration without external dependencies
- **Production**: Scalable distributed processing
- **Testing**: Easy to test both modes
- **Fallback**: Graceful degradation if queue unavailable

---

## ☁️ Azure Queue Implementation

### Configuration

```typescript
// Environment variables
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_QUEUE_NAME=citation-processing
USE_CITATION_WORKER=true
```

### Queue Service

```typescript
// queue.server.service.ts
export class QueueService {
  private queueClient: QueueClient;

  constructor() {
    this.queueClient = new QueueClient(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
      process.env.AZURE_QUEUE_NAME
    );
  }

  async sendMessage(data: JobData): Promise<void> {
    const message = Buffer.from(JSON.stringify(data)).toString('base64');
    await this.queueClient.sendMessage(message);
  }

  async receiveMessages(): Promise<JobData[]> {
    const messages = await this.queueClient.receiveMessages({
      numberOfMessages: 10,
      visibilityTimeout: 300 // 5 minutes
    });
    
    return messages.receivedMessageItems.map(msg => {
      const data = JSON.parse(
        Buffer.from(msg.messageText, 'base64').toString()
      );
      return { ...data, messageId: msg.messageId, popReceipt: msg.popReceipt };
    });
  }

  async deleteMessage(messageId: string, popReceipt: string): Promise<void> {
    await this.queueClient.deleteMessage(messageId, popReceipt);
  }
}
```

### Worker Process

```typescript
// worker.ts
async function processQueue() {
  const queueService = new QueueService();
  
  while (true) {
    try {
      const messages = await queueService.receiveMessages();
      
      for (const message of messages) {
        try {
          await processJob(message);
          await queueService.deleteMessage(message.messageId, message.popReceipt);
        } catch (error) {
          logger.error('Job processing failed', { error, message });
          // Message will become visible again after timeout
        }
      }
      
      if (messages.length === 0) {
        await sleep(5000); // Wait 5 seconds if queue is empty
      }
    } catch (error) {
      logger.error('Queue processing error', { error });
      await sleep(30000); // Wait 30 seconds on error
    }
  }
}
```

---

## 🏠 In-Process Implementation

### Basic Pattern

```typescript
export async function queueJob(jobData: JobData): Promise<void> {
  if (process.env.USE_CITATION_WORKER === 'true') {
    await queueService.sendMessage(jobData);
  } else {
    // Non-blocking execution
    setImmediate(async () => {
      try {
        await processJob(jobData);
      } catch (error) {
        logger.error('In-process job failed', { error, jobData });
      }
    });
  }
}
```

### With Progress Tracking

```typescript
export async function queueJobWithProgress(
  jobId: string, 
  jobData: JobData
): Promise<void> {
  // Store initial status
  await updateJobStatus(jobId, 'queued');
  
  if (process.env.USE_CITATION_WORKER === 'true') {
    await queueService.sendMessage({ ...jobData, jobId });
  } else {
    setImmediate(async () => {
      try {
        await updateJobStatus(jobId, 'processing');
        const result = await processJob(jobData);
        await updateJobStatus(jobId, 'completed', result);
      } catch (error) {
        await updateJobStatus(jobId, 'failed', { error: error.message });
      }
    });
  }
}
```

---

## 📦 Job Types

### Citation Extraction
```typescript
interface CitationExtractionJob {
  type: 'citation-extraction';
  projectId: string;
  searchHistoryId: string;
  references: string[];
  tenantId: string;
}
```

### Deep Analysis
```typescript
interface DeepAnalysisJob {
  type: 'deep-analysis';
  citationJobId: string;
  projectId: string;
  referenceId: string;
  tenantId: string;
}
```

### Document Generation
```typescript
interface DocumentGenerationJob {
  type: 'document-generation';
  projectId: string;
  sections: string[];
  format: 'docx' | 'pdf';
  tenantId: string;
}
```

### Patent Search
```typescript
interface PatentSearchJob {
  type: 'patent-search';
  searchId: string;
  queries: string[];
  filters: SearchFilters;
  tenantId: string;
}
```

---

## 💻 Implementation Examples

### API Endpoint with Async Processing

```typescript
// pages/api/projects/[projectId]/generate-claims.ts
export default SecurePresets.tenantProtected(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { projectId } = req.query;
    const { tenantId } = req.tenant;
    
    // Create job record
    const job = await createJob({
      type: 'claim-generation',
      status: 'queued',
      projectId,
      tenantId
    });
    
    // Queue for processing
    await queueJob({
      type: 'claim-generation',
      jobId: job.id,
      projectId,
      tenantId,
      parameters: req.body
    });
    
    // Return immediately with job ID
    res.status(202).json({
      jobId: job.id,
      status: 'queued',
      statusUrl: `/api/jobs/${job.id}/status`
    });
  }
);
```

### Status Polling Endpoint

```typescript
// pages/api/jobs/[jobId]/status.ts
export default SecurePresets.tenantProtected(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { jobId } = req.query;
    const { tenantId } = req.tenant;
    
    const job = await getJob(jobId, tenantId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });
  }
);
```

### Client-Side Polling Hook

```typescript
// hooks/useJobStatus.ts
export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => apiClient.get(`/api/jobs/${jobId}/status`),
    enabled: !!jobId,
    refetchInterval: (data) => {
      if (!data) return 5000;
      const status = data.status;
      if (status === 'completed' || status === 'failed') {
        return false; // Stop polling
      }
      return status === 'processing' ? 2000 : 5000;
    }
  });
}
```

---

## 📊 Monitoring & Debugging

### Job Status Tracking

```typescript
enum JobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface JobRecord {
  id: string;
  type: string;
  status: JobStatus;
  progress: number;
  tenantId: string;
  userId: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  metadata?: Record<string, any>;
}
```

### Logging Strategy

```typescript
// Job lifecycle logging
logger.info('Job queued', { jobId, type, tenantId });
logger.info('Job started', { jobId, workerId });
logger.info('Job progress', { jobId, progress: 50 });
logger.info('Job completed', { jobId, duration, resultSize });
logger.error('Job failed', { jobId, error, attempts });
```

### Metrics to Track

1. **Queue Metrics**
   - Queue depth
   - Message age
   - Processing time
   - Failure rate

2. **Job Metrics**
   - Jobs per type
   - Success/failure rates
   - Average duration
   - Retry counts

3. **Performance Metrics**
   - Memory usage
   - CPU utilization
   - Network latency
   - Database query time

### Debug Endpoints

```typescript
// Development only endpoints
if (process.env.NODE_ENV === 'development') {
  // View queue stats
  app.get('/api/debug/queue-stats', async (req, res) => {
    const stats = await getQueueStatistics();
    res.json(stats);
  });
  
  // Retry failed jobs
  app.post('/api/debug/retry-job/:jobId', async (req, res) => {
    await retryJob(req.params.jobId);
    res.json({ success: true });
  });
}
```

---

## Best Practices

1. **Idempotency**: Ensure jobs can be safely retried
2. **Timeout Handling**: Set appropriate visibility timeouts
3. **Error Recovery**: Implement exponential backoff for retries
4. **Progress Updates**: Update job status regularly for long tasks
5. **Resource Limits**: Implement job size and duration limits
6. **Cleanup**: Archive or delete old job records
7. **Monitoring**: Alert on queue depth and processing delays

---

This asynchronous processing architecture provides flexibility for development while ensuring scalability in production, with comprehensive monitoring and debugging capabilities.