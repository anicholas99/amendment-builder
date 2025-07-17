# Chat Agent Migration Guide

## Current State (UPDATED: Iterative Function Calling Implemented ✅)

We have successfully implemented the industry-standard iterative function calling pattern:

1. **chat-agent.server-service.ts** - Legacy implementation (kept for rollback)
2. **chat-agent-v2.server-service.ts** - Delimiter-based approach (not used)
3. **chat-agent-functions.server-service.ts** - OpenAI Function Calling with iterative loop (NOW ACTIVE ✅)

## Latest Updates

### Claim ID Mapping Fix (July 2025)
Fixed issue where claim revision tools failed with `DB_RECORD_NOT_FOUND` errors:

**Problem**: OpenAI was providing `claimId: "clm-2"` but actual database IDs are UUIDs
**Solution**: 
1. Changed `proposeClaimRevision` to accept `claimNumber` instead of `claimId`
2. Added automatic claim ID mapping that fetches claims and maps numbers to IDs
3. Applied buttons now work correctly for claim revisions

### Interactive UI Components (July 2025)
Added special handling for revision tools to show Apply/Reject buttons:
- `proposeClaimRevision` - Shows buttons for single claim revisions
- `batchProposeRevisions` - Shows buttons for multiple claim revisions
- Users can now click "Apply Revision" instead of typing responses

## Latest Update: Industry-Standard Iterative Pattern

### What Changed
We've upgraded from a single-pass function execution to the industry-standard iterative pattern used by OpenAI, Anthropic, LangChain, and other leading AI systems.

#### Previous Pattern (Single-Pass)
```
User → LLM → Function Call → Execute → Return Result → End
```

#### New Pattern (Iterative Loop) ✅
```
User → LLM → Function Call → Execute → 
  ↓                                    ↑
  → Result back to LLM → LLM decides next step
```

### Implementation Details

1. **Multi-Round Conversations**: The LLM can now:
   - Execute a function
   - See the result
   - Decide if more functions are needed
   - Chain operations intelligently

  2. **Safety Limits**: 
    - Maximum 15 iterations per request
    - Prevents infinite loops
    - Logged warnings when limit is reached

3. **Message History**: 
   - Maintains proper OpenAI message format
   - Includes function calls and results in conversation
   - Enables context-aware multi-step operations

### Benefits Achieved

1. **Smarter Tool Chaining**: LLM decides next steps based on results ✅
2. **Error Recovery**: Can try alternative approaches if first attempt fails ✅
3. **Complex Workflows**: Supports multi-step operations naturally ✅
4. **Industry Standard**: Aligned with OpenAI, Anthropic, LangChain patterns ✅
5. **Better UX**: More natural conversation flow ✅

### Rollback Instructions (if needed):
In `src/pages/api/chat/stream.ts`, simply:
```typescript
// Revert to this:
import { ChatAgentService } from '@/server/services/chat-agent.server-service';

// Instead of:
// import { ChatAgentFunctionsService as ChatAgentService } from '@/server/services/chat-agent-functions.server-service';
```

### Testing Checklist

Production Testing:
- [ ] Basic consistency check works
- [ ] Claims operations (add, edit, delete)
- [ ] Mirror claims with different types
- [ ] Figure operations (add, update, remove elements)
- [ ] Patent enhancement tools
- [ ] AI revision tools (single and batch)
- [ ] Error handling (missing project context)
- [ ] Streaming text responses
- [ ] Multi-tool chains

### Architecture Benefits

| Aspect | Legacy | Function Calling |
|--------|--------|------------------|
| **JSON Parsing** | Manual | OpenAI Handles |
| **Edge Cases** | Limited | Comprehensive |
| **Streaming** | Delayed | Real-time |
| **Tool Discovery** | Static | Dynamic |
| **Error Handling** | Basic | Structured |
| **Maintainability** | Medium | Excellent |

### Next Steps

1. **Monitor in production** for any edge cases
2. **Add telemetry** for tool usage analytics
3. **Consider adding more tools** as needed
4. **Update documentation** for new developers

## Tool Parameter Reference

All tools are now properly defined with OpenAI function schemas:

### Consistency & Diagnostic Tools
- `validateInventionConsistency` - No parameters
- `runProjectDiagnostics` - No parameters
- `analyzePatentApplication` - No parameters
- `checkPatentConsistency` - No parameters

### Patent Enhancement
- `enhancePatentSection(sectionName, instruction)`

### Claim Operations
- `getClaims()` - No parameters
- `editClaim(claimId, newText)`
- `addClaims(claims[])` - Array of {number, text}
- `deleteClaims(claimIds[])`
- `reorderClaims(claim1Id, claim2Id)`
- `mirrorClaims(claimIds[], targetType)`
- `proposeClaimRevision(claimId, instruction)`
- `batchProposeRevisions(claimIds[], instruction)`
- `visualizeClaimDependencies()` - No parameters

### Figure Operations
- `getFigureElements(figureKey?)` - Optional figure key
- `addFigureElement(figureKey, elementNumber, description)`
- `updateFigureElement(figureKey, elementNumber, newDescription)`
- `removeFigureElement(figureKey, elementNumber)`

### Invention Operations
- `updateInventionDetails(additionalDetails)` 