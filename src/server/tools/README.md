# Chat Agent Tools

This directory contains tools that can be executed by the chat agent in response to user requests.

## Architecture

Tools are called **on-demand** rather than pre-loading data into the system prompt. This approach provides:

- ✅ **Fresh data** - Always fetches latest from database
- ✅ **Efficiency** - No token waste on unused content  
- ✅ **Security** - Tenant validated on each tool call
- ✅ **Scalability** - Works with documents of any size
- ✅ **Maintainability** - Easy to add new tools without bloating prompts

## Available Tools

### `validateInventionConsistency`
Checks for consistency issues between claims and parsed elements.

### `runProjectDiagnostics`  
Diagnoses why claims or invention data might be missing.

### `analyzePatentApplication`
Loads and analyzes the full patent application document. Returns:
- Full HTML content for proofreading
- Section structure analysis
- Word count and completeness check
- Specific recommendations

## Tool Execution Flow

1. User asks a question (e.g., "proofread my patent")
2. AI recognizes intent and outputs: `{"tool": "analyzePatentApplication", "args": {}}`
3. System executes tool with secure projectId/tenantId
4. Tool returns data including full content
5. AI uses the content to provide specific answers
6. Content remains available for follow-up questions in same conversation

## Security

All tools:
- Require `projectId` and `tenantId` parameters
- Validate tenant ownership before accessing data
- Use repository pattern for database access
- Return structured, typed responses

## Adding New Tools

1. Create tool in this directory (e.g., `myTool.tool.ts`)
2. Export async function: `async function myTool(projectId: string, tenantId: string)`
3. Add to `toolRegistry` in `toolExecutor.ts`
4. Update system prompt in `chat-agent.server-service.ts` with usage instructions
5. Add TypeScript types to `src/types/tools.ts`

## Best Practices

- Tools should be focused on a single responsibility
- Always validate tenant access first
- Return structured data, not formatted strings
- Let the AI format responses based on tool output
- Include both data and metadata (e.g., counts, suggestions) 