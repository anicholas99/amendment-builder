# Tool Invocation Implementation Guide

## Overview

The tool invocation system provides visual feedback when the AI performs operations like adding claims, updating invention details, or analyzing prior art. This creates a transparent and engaging user experience by showing real-time status of AI operations.

## Architecture

### Backend Flow

1. **Tool Detection**: When the AI decides to use a tool, the ChatAgentFunctionsService detects the function call
2. **Event Emission**: The service emits SSE events for tool status:
   - `pending` - Tool is queued for execution
   - `running` - Tool is actively executing
   - `completed` - Tool finished successfully
   - `failed` - Tool encountered an error

3. **Stream Format**: Tool events are sent as:
   ```
   event: tool
   data: {"role":"tool","toolInvocation":{...}}
   ```

### Frontend Flow

1. **Event Reception**: The chat mutation handler in `useChat.ts` listens for tool events
2. **Message Creation**: Tool invocations are stored as special messages with `role: 'tool'`
3. **UI Rendering**: EnhancedChatInterface renders tool messages using ToolInvocationGroup
4. **Real-time Updates**: Status changes update the existing tool card animations

## Available Tools

The system recognizes these tool types (defined in `tool-invocation.ts`):

- `search-prior-art` - Patent search operations
- `analyze-claims` - Claim analysis and review
- `generate-description` - Content generation
- `update-invention` - Invention detail updates
- `create-figure` - Figure creation
- `addClaims` - Add new claims
- `editClaim` - Edit existing claims
- `deleteClaims` - Remove claims
- Plus many more...

## Testing Tool Invocations

### Method 1: Test Chat Page

1. Navigate to `/test-tool-chat`
2. Ask the AI to perform an operation like:
   - "Add a new claim about wireless power transfer"
   - "Analyze the novelty of claim 1"
   - "Search for prior art on battery technology"

### Method 2: Actual Project Chat

1. Open any project in claim refinement view
2. Use the chat sidebar
3. Ask the AI to perform claim operations
4. Watch for the tool invocation animations

### Method 3: Demo Page

1. Navigate to `/test-tool-integration`
2. Click "Start Demo" to see various tool animations
3. This shows all possible states and transitions

## Debugging

### Enable Debug Logging

```javascript
// In browser console
localStorage.setItem('debug', 'ChatMutation,ChatAgentFunctions');
```

### Check Tool Events

Monitor Network tab for SSE events:
- Look for `event: tool` messages
- Verify tool invocation payloads
- Check status transitions

### Common Issues

1. **No tool animations appearing**
   - Verify backend is emitting tool events
   - Check browser console for errors
   - Ensure EnhancedChatInterface is being used

2. **Tool stays in running state**
   - Backend may not be emitting completion event
   - Check server logs for tool execution errors

3. **Duplicate tool cards**
   - Tool invocation IDs must be unique
   - Check for duplicate event emissions

## Customization

### Adding New Tool Types

1. Add to `TOOL_DEFINITIONS` in `tool-invocation.ts`:
   ```typescript
   'my-new-tool': {
     displayName: 'My New Tool',
     description: 'Description of what it does',
     icon: 'Wrench',
     loadingMessages: ['Processing...', 'Almost done...']
   }
   ```

2. Update backend to emit events for the new tool

### Styling Tool Cards

Tool cards use Framer Motion for animations. Customize in `ToolInvocationCard.tsx`:
- Adjust animation timing
- Modify color schemes
- Change layout structure

## Performance Considerations

- Tool invocations are rendered as separate messages to avoid re-rendering chat content
- Animations use GPU-accelerated transforms
- Status updates only modify the specific tool invocation, not the entire message list

## Security

- Tool parameters are displayed but sanitized
- Sensitive data should not be included in tool parameters
- Tool execution happens server-side with proper validation

## Future Enhancements

- Tool invocation history/replay
- Batch tool operations visualization
- Tool execution metrics and timing
- User-initiated tool cancellation 