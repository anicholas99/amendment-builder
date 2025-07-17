# AI Audit Integration Example

This document shows how to integrate the AI audit logging system into existing AI workflows.

## Example: Patent Generation with Audit Logging

Here's how to modify the existing patent generation flow to include AI audit logging:

### Before (Current Implementation)

```typescript
// src/pages/api/projects/[projectId]/generate-application-sections.ts
async function callOpenAI(
  prompt: string,
  section: string
): Promise<{ text: string; usage: TokenUsage | null }> {
  try {
    logger.info(`Calling AI service for section: ${section}`);
    const { content, usage } = await processWithOpenAI(
      prompt,
      SYSTEM_MESSAGE_V1.template,
      {
        model: 'gpt-4.1',
        temperature: 0.3,
        maxTokens: 2000,
        response_format: { type: 'text' },
      }
    );
    logger.info(`Token usage for ${section}:`, { usage });
    return { text: cleanText(content), usage };
  } catch (error) {
    logger.error(`Failed to generate ${section}`, { error });
    throw new ApplicationError(
      ErrorCode.AI_PROCESSING_FAILED,
      `Failed to generate ${section}`
    );
  }
}
```

### After (With AI Audit Integration)

```typescript
// Import the AI audit service
import { AIAuditService } from '@/server/services/ai-audit.server-service';

async function callOpenAI(
  prompt: string,
  section: string,
  context: { projectId: string; tenantId: string; userId: string }
): Promise<{ text: string; usage: TokenUsage | null; auditLogId?: string }> {
  try {
    logger.info(`Calling AI service for section: ${section}`);
    
    // Use the audited AI service instead
    const { content, usage, auditLogId } = await AIAuditService.processWithAudit(
      prompt,
      SYSTEM_MESSAGE_V1.template,
      {
        operation: 'patent_generation',
        toolName: `generate_${section}`,
        projectId: context.projectId,
        tenantId: context.tenantId,
        userId: context.userId,
      },
      {
        model: 'gpt-4.1',
        temperature: 0.3,
        maxTokens: 2000,
        response_format: { type: 'text' },
      }
    );
    
    logger.info(`Token usage for ${section}:`, { usage, auditLogId });
    return { text: cleanText(content), usage, auditLogId };
  } catch (error) {
    logger.error(`Failed to generate ${section}`, { error });
    throw new ApplicationError(
      ErrorCode.AI_PROCESSING_FAILED,
      `Failed to generate ${section}`
    );
  }
}

// Update the handler to pass context
const handler = async (
  req: CustomApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  const projectId = String(req.query.projectId);
  
  // ... existing code ...
  
  // When calling the AI service, pass the context
  const fieldSection = await callOpenAI(
    fieldPrompt,
    'field',
    { 
      projectId, 
      tenantId: user.tenantId!, 
      userId: user.id 
    }
  );
  
  // The auditLogId is now available for tracking
  logger.info('Generated field section', { 
    auditLogId: fieldSection.auditLogId 
  });
};
```

## Example: Chat with Tool Invocation

For chat interfaces that use tools:

```typescript
// src/server/tools/toolExecutor.ts
import { AIAuditService } from '@/server/services/ai-audit.server-service';

export async function executeToolWithAudit(
  toolName: string,
  params: any,
  context: { projectId: string; tenantId: string; userId: string }
): Promise<any> {
  const messages = [
    { role: 'system' as const, content: getToolSystemPrompt(toolName) },
    { role: 'user' as const, content: JSON.stringify(params) },
  ];

  const { content, auditLogId } = await AIAuditService.makeAuditedRequest({
    messages,
    operation: 'tool_execution',
    toolName,
    projectId: context.projectId,
    tenantId: context.tenantId,
    userId: context.userId,
    model: 'gpt-4.1',
    temperature: 0.1,
  });

  // Parse and return the tool result
  const result = JSON.parse(content);
  
  // You can optionally return the auditLogId with the result
  return { ...result, _auditLogId: auditLogId };
}
```

## Frontend Integration

### Display Trust Bar in Patent Editor

```tsx
// src/features/patent-application/components/PatentMainPanel.tsx
import { AITrustBar } from '@/components/common/AITrustBar';

export const PatentMainPanel: React.FC<{ document: any }> = ({ document }) => {
  // If the document has an associated auditLogId
  const auditLogId = document?.metadata?.auditLogId;
  
  return (
    <div>
      {auditLogId && (
        <AITrustBar 
          auditLogId={auditLogId}
          showExportButton
          onExport={() => handleExportAudit(document.projectId)}
        />
      )}
      {/* Rest of the patent content */}
    </div>
  );
};
```

### Show AI Usage Statistics

```tsx
// src/features/projects/components/ProjectDashboard.tsx
import { AIUsageSummaryBar } from '@/components/common/AITrustBar';

export const ProjectDashboard: React.FC<{ projectId: string }> = ({ projectId }) => {
  return (
    <div>
      <h2>Project Overview</h2>
      <AIUsageSummaryBar projectId={projectId} className="mb-4" />
      {/* Rest of dashboard */}
    </div>
  );
};
```

## Migration Strategy

1. **Phase 1**: Add audit logging to new AI features
   - All new AI endpoints use `AIAuditService`
   - New features display trust indicators

2. **Phase 2**: Migrate critical paths
   - Patent generation
   - Claim analysis
   - Prior art search

3. **Phase 3**: Complete migration
   - All AI calls use audited service
   - Add audit export to project settings
   - Implement compliance reports

## Best Practices

1. **Always provide context**: Include projectId, tenantId, and userId
2. **Use descriptive operations**: e.g., 'patent_generation', 'claim_analysis'
3. **Include tool names**: For tool-based AI, specify which tool was used
4. **Handle errors gracefully**: Audit failures shouldn't break the main flow
5. **Display trust indicators**: Use AITrustBar or AITrustBadge in UI

## Compliance Export

To export audit logs for USPTO compliance:

```typescript
// API call
const exportData = await AIAuditApiService.exportAuditLogs(projectId);

// Download as PDF
await AIAuditApiService.downloadAuditLogs(projectId, 'pdf');
```

The export includes:
- All AI operations for the project
- Prompts and responses
- Token usage and costs
- Review status
- Timestamps

This satisfies USPTO requirements for disclosing AI-assisted content in patent applications.