# Tool Integration Guide for Chat Interface

This guide explains how to integrate the tool invocation animations into your chat interface.

## Overview

The tool integration system provides animated UI components that display when the AI is invoking tools or functions. This creates a better user experience by showing what operations the AI is performing in real-time.

## Key Components

### 1. ToolInvocationCard
A card component that displays a single tool invocation with animations:
- Shows tool name, description, and status
- Animated progress bar for running operations
- Cycling loading messages
- Success/failure states with results

### 2. ToolInvocationGroup
Groups multiple tool invocations together with proper animations:
- Organizes by status (running, pending, completed, failed)
- Smooth enter/exit animations
- Compact and expanded views

### 3. Tool Types and Definitions
Pre-defined tool types for common operations:
- `search-prior-art` - Patent database searches
- `analyze-claims` - Claim analysis operations
- `generate-description` - Content generation
- `update-invention` - Database updates
- `create-figure` - Figure generation

## Integration Steps

### 1. Update Chat Message Streaming

When receiving streaming messages from your AI, detect tool invocations and create tool messages:

```typescript
// In your chat streaming handler
if (streamData.toolInvocations) {
  const toolMessage: ChatMessage = {
    id: `tool-${Date.now()}`,
    role: 'tool',
    content: '',
    toolInvocations: streamData.toolInvocations.map(inv => ({
      id: inv.id || `inv-${Date.now()}`,
      toolName: inv.toolName,
      status: 'running',
      parameters: inv.parameters,
      startTime: Date.now(),
    })),
    timestamp: new Date().toISOString(),
  };
  
  // Add to messages
  addMessage(toolMessage);
}
```

### 2. Update Tool Status in Real-Time

As tools complete, update their status:

```typescript
// When receiving tool updates
const updateToolStatus = (messageId: string, invocationId: string, status: ToolStatus, result?: any) => {
  updateMessage(messageId, (msg) => {
    if (msg.role === 'tool' && msg.toolInvocations) {
      return {
        ...msg,
        toolInvocations: msg.toolInvocations.map(inv =>
          inv.id === invocationId
            ? { ...inv, status, result, endTime: Date.now() }
            : inv
        ),
      };
    }
    return msg;
  });
};
```

### 3. Enhanced Chat Interface Integration

The `EnhancedChatInterface` component already includes support for tool messages. Tool invocations will be displayed automatically when messages with `role: 'tool'` are added to the chat.

## Example: AI Assistant with Tool Calls

Here's a complete example of how the AI might use tools:

```typescript
// User asks: "Find prior art for my wireless charging invention"

// 1. AI responds with initial message
const assistantMessage = {
  role: 'assistant',
  content: 'I\'ll search for prior art related to wireless charging. Let me analyze the patent databases.',
  timestamp: new Date().toISOString()
};

// 2. AI invokes search tool
const toolMessage = {
  role: 'tool',
  content: '',
  toolInvocations: [{
    id: 'search-1',
    toolName: 'search-prior-art',
    status: 'running',
    parameters: [
      { name: 'query', value: 'wireless charging coil efficiency' },
      { name: 'dateRange', value: '2018-2024' }
    ],
    startTime: Date.now()
  }],
  timestamp: new Date().toISOString()
};

// 3. Tool completes with results
updateToolStatus('tool-msg-id', 'search-1', 'completed', {
  patentsFound: 47,
  relevantResults: 12
});

// 4. AI provides final response
const resultMessage = {
  role: 'assistant',
  content: 'I found 47 patents related to wireless charging, with 12 highly relevant results. Here are the key findings...',
  timestamp: new Date().toISOString()
};
```

## Customization

### Adding New Tool Types

Add new tool definitions to `tool-invocation.ts`:

```typescript
export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  'your-custom-tool': {
    name: 'your-custom-tool',
    displayName: 'Custom Tool',
    category: 'analysis',
    icon: 'Wrench', // Lucide icon name
    description: 'Description of what this tool does',
    loadingMessages: [
      'Initializing custom analysis...',
      'Processing data...',
      'Finalizing results...'
    ]
  }
};
```

### Styling

The components use Tailwind CSS and follow your existing design system. Key classes:
- Status colors: `text-yellow-600` (pending), `text-blue-600` (running), `text-green-600` (completed), `text-red-600` (failed)
- Animations: `animate-spin`, `animate-pulse`, custom framer-motion animations
- Layout: Uses shadcn Card component with consistent spacing

## Best Practices

1. **Group Related Tools**: When performing multiple operations, group them in a single tool message
2. **Provide Context**: Always include descriptive parameters and clear tool names
3. **Update Promptly**: Update tool status as soon as operations complete
4. **Handle Errors**: Show clear error messages when tools fail
5. **Keep It Relevant**: Only show tools for operations that take more than ~1 second

## Security Considerations

- Tool invocations are validated on the backend
- Parameters are sanitized before display
- Tool execution requires proper authentication
- Results are filtered based on user permissions

## Performance

- Tool cards use React.memo for optimization
- Animations use GPU-accelerated transforms
- SSE connections for real-time updates are managed efficiently
- Cleanup functions prevent memory leaks

## Testing

Test tool invocations by:
1. Simulating slow operations with delayed status updates
2. Testing multiple concurrent tool invocations
3. Verifying error states display correctly
4. Checking animation smoothness on lower-end devices

## Troubleshooting

Common issues:
- **Tools not displaying**: Check that messages have `role: 'tool'` and valid `toolInvocations` array
- **Animations janky**: Ensure you're using the production build with optimizations
- **Status not updating**: Verify the message ID and invocation ID match when updating
- **SSE not working**: Check CORS settings and ensure EventSource is supported 