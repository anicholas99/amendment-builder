import { OpenaiServerService } from '@/server/services/openai.server-service';
import { logger } from '@/lib/monitoring/logger';
import {
  getInventionContextForChat,
  type InventionChatContext,
} from '@/repositories/chatRepository';
import { executeTool, getAvailableTools } from '@/server/tools/toolExecutor';
import { safeJsonParse } from '@/utils/json-utils';
import type {
  ChatToolCall,
  ChatToolChain,
  ConsistencyIssue,
  PatentApplicationAnalysis,
} from '@/types/tools';

export interface ChatAgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateChatResponseParams {
  projectId?: string;
  messages: ChatAgentMessage[];
  tenantId?: string; // Add tenantId for secure context loading
  pageContext?: 'technology' | 'claim-refinement' | 'patent'; // Page context for disambiguation
  lastAction?: {
    type: 'claim-revised' | 'claim-added' | 'claim-deleted' | 'claims-mirrored' | 'claims-reordered';
    claimNumber?: number;
    claimNumbers?: number[];
    details?: string;
  };
}

/**
 * ChatAgentService
 * --------------------------------------------------
 * Context-aware chat agent that loads full invention data before responding.
 * This ensures the AI has complete understanding of what the user is working on.
 *
 * SECURITY: Always validates tenant access before loading project data.
 *
 * The agent has access to:
 * - Project metadata and status
 * - Full invention details (title, summary, technical details)
 * - All claims (normalized)
 * - Saved prior art references
 * - Parsed claim elements and search queries
 */
export class ChatAgentService {
  /**
   * Process a tool chain (multiple tools in sequence)
   */
  private static async processToolChain(
    toolChain: ChatToolChain,
    projectId: string,
    tenantId: string
  ): Promise<string> {
    logger.info('[ChatAgentService] Processing tool chain', {
      toolCount: toolChain.tools.length,
      tools: toolChain.tools.map(t => t.tool),
    });

    let finalResult: any = null;
    let allResults: any[] = [];

    // Execute tools in sequence
    for (const tool of toolChain.tools) {
      const secureArgs = {
        ...tool.args,
        projectId,
        tenantId,
      };

      logger.info('[ChatAgentService] Executing tool in chain', {
        tool: tool.tool,
        isInternal: tool.tool === 'getClaims',
        args: tool.args,
      });

      const toolResult = await executeTool(tool.tool, secureArgs);
      
      if (!toolResult.success) {
        return `I encountered an error while ${tool.tool === 'getClaims' ? 'retrieving claims' : 'processing your request'}: ${toolResult.error}`;
      }

      allResults.push(toolResult);
      
      // For getClaims, extract claim IDs for next tool
      if (tool.tool === 'getClaims' && toolResult.data) {
        const claims = toolResult.data.claims || [];
        // Make claims available for next tool in chain
        if (toolChain.tools.length > 1) {
          const nextTool = toolChain.tools[toolChain.tools.indexOf(tool) + 1];
          if (nextTool && nextTool.args) {
            // Map claim numbers to IDs based on the user's request
            const claimMap = new Map(claims.map((c: any) => [c.number, c.id]));
            
            // Update args with actual claim IDs
            if ('claim1Number' in nextTool.args && 'claim2Number' in nextTool.args) {
              const id1 = claimMap.get(nextTool.args.claim1Number);
              const id2 = claimMap.get(nextTool.args.claim2Number);
              
              if (!id1 || !id2) {
                const missing = [];
                if (!id1) missing.push(nextTool.args.claim1Number);
                if (!id2) missing.push(nextTool.args.claim2Number);
                return `I couldn't find claim${missing.length > 1 ? 's' : ''} ${missing.join(' and ')}. Please check the claim numbers and try again.`;
              }
              
              nextTool.args.claim1Id = id1;
              nextTool.args.claim2Id = id2;
              delete nextTool.args.claim1Number;
              delete nextTool.args.claim2Number;
            } else if ('claimNumber' in nextTool.args) {
              // For single claim operations like editClaim or proposeClaimRevision
              const claimId = claimMap.get(nextTool.args.claimNumber);
              if (!claimId) {
                return `I couldn't find claim ${nextTool.args.claimNumber}. Please check the claim number and try again.`;
              }
              nextTool.args.claimId = claimId;
              delete nextTool.args.claimNumber;
            } else if ('claimNumbers' in nextTool.args && Array.isArray(nextTool.args.claimNumbers)) {
              const mappedIds = nextTool.args.claimNumbers.map((num: number) => ({
                num,
                id: claimMap.get(num)
              }));
              const missingClaims = mappedIds.filter(m => !m.id).map(m => m.num);
              
              if (missingClaims.length > 0) {
                return `I couldn't find claim${missingClaims.length > 1 ? 's' : ''} ${missingClaims.join(', ')}. Please check the claim numbers and try again.`;
              }
              
              nextTool.args.claimIds = mappedIds.map(m => m.id).filter(Boolean);
              delete nextTool.args.claimNumbers;
            } else if ('allClaims' in nextTool.args && nextTool.args.allClaims) {
              // For batch operations on all claims
              const allClaimIds = claims.map((c: any) => c.id);
              nextTool.args.claimIds = allClaimIds;
              delete nextTool.args.allClaims;
            }
          }
        }
      } else {
        // Last tool or non-getClaims tool
        finalResult = toolResult;
      }
    }

    // Return result from the last meaningful tool (not getClaims)
    if (finalResult && finalResult.data) {
      const lastTool = toolChain.tools[toolChain.tools.length - 1];
      
      // Use existing result handlers
      if (lastTool.tool === 'reorderClaims' || 
          lastTool.tool === 'editClaim' || 
          lastTool.tool === 'deleteClaims' || 
          lastTool.tool === 'addClaims' ||
          lastTool.tool === 'mirrorClaims') {
        const result = finalResult.data;
        
        let response = `## ✅ ${lastTool.tool === 'mirrorClaims' ? 'Claims Mirrored' : 'Claim Operation Completed'}\n\n`;
        response += `${result.message}\n\n`;
        
        if (result.claim) {
          response += `**Updated claim ${result.claim.number}:**\n${result.claim.text}\n\n`;
        }
        
        response += `Your claims have been updated. Would you like to:\n`;
        response += `- View all current claims\n`;
        response += `- Make additional changes\n`;
        response += `- Check claim consistency`;
        
        response += '\n\n<!-- CLAIMS_UPDATED -->';
        
        return response;
      } else if (lastTool.tool === 'proposeClaimRevision') {
        const revision = finalResult.data;
        
        let response = `## 🔍 Claim Revision Proposal\n\n`;
        response += `I've analyzed claim ${revision.claimNumber} and generated a revision based on your instruction.\n\n`;
        
        response += `**Confidence:** ${Math.round(revision.confidence * 100)}%\n`;
        response += `**Reasoning:** ${revision.reasoning}\n\n`;
        
        response += `### Original Claim ${revision.claimNumber}:\n`;
        response += `${revision.original}\n\n`;
        
        response += `### Proposed Revision:\n`;
        response += `${revision.proposed}\n\n`;
        
        response += `### Changes:\n`;
        response += `<!-- REVISION_DIFF -->\n`;
        response += JSON.stringify({
          claimId: revision.claimId,
          claimNumber: revision.claimNumber,
          changes: revision.changes,
          proposedText: revision.proposed
        });
        response += `\n<!-- END_REVISION_DIFF -->\n\n`;
        
        response += `Would you like to:\n`;
        response += `- ✅ Apply this revision\n`;
        response += `- ❌ Reject and keep the original\n`;
        response += `- 🔄 Try a different instruction\n\n`;
        
        response += `To apply this revision, I can update the claim for you. Just let me know!`;
        
        return response;
      } else if (lastTool.tool === 'batchProposeRevisions') {
        const batchResult = finalResult.data;
        
        let response = `## 🔍 Batch Claim Revision Proposals\n\n`;
        response += `I've analyzed ${batchResult.summary.total} claims and generated revisions based on your instruction.\n\n`;
        
        if (batchResult.summary.failed > 0) {
          response += `⚠️ **Note:** ${batchResult.summary.failed} claim(s) could not be processed.\n\n`;
        }
        
        response += `### Revision Summary:\n`;
        response += `- **Total claims:** ${batchResult.summary.total}\n`;
        response += `- **Successful revisions:** ${batchResult.summary.successful}\n`;
        response += `- **Average confidence:** ${Math.round(
          batchResult.revisions.reduce((sum: number, r: any) => sum + r.confidence, 0) / 
          batchResult.revisions.length * 100
        )}%\n\n`;
        
        // Include all revision diffs in the response
        response += `### Individual Revisions:\n\n`;
        batchResult.revisions.forEach((revision: any) => {
          response += `#### Claim ${revision.claimNumber}\n`;
          response += `**Confidence:** ${Math.round(revision.confidence * 100)}%\n`;
          response += `**Reasoning:** ${revision.reasoning}\n\n`;
          
          response += `<!-- REVISION_DIFF -->\n`;
          response += JSON.stringify({
            claimId: revision.claimId,
            claimNumber: revision.claimNumber,
            changes: revision.changes,
            proposedText: revision.proposed
          });
          response += `\n<!-- END_REVISION_DIFF -->\n\n`;
        });
        
        response += `Would you like to:\n`;
        response += `- ✅ Apply all revisions at once\n`;
        response += `- 🔍 Review and apply revisions individually\n`;
        response += `- 🔄 Try different instructions\n\n`;
        response += `You can apply individual revisions using the buttons above each claim.`;
        
        return response;
      }
    }
    
    // Special case: If only getClaims was called, show the claims
    if (toolChain.tools.length === 1 && toolChain.tools[0].tool === 'getClaims' && allResults[0]?.data) {
      const result = allResults[0].data;
      if (result.claims.length === 0) {
        return `## 📋 Current Claims\n\n${result.message}\n\nWould you like me to help you add some claims?`;
      }
      
      let response = `## 📋 Current Claims\n\n${result.message}\n\n`;
      result.claims.forEach((claim: any) => {
        response += `**Claim ${claim.number}**\n${claim.text}\n\n`;
      });
      response += `\nWhat would you like to do with these claims? I can:\n`;
      response += `- Edit any claim text\n`;
      response += `- Add new claims\n`;
      response += `- Delete claims\n`;
      response += `- Reorder claims\n`;
      response += `- Mirror claims to a different type (system, method, etc.)\n`;
      response += `- Shorten, clarify, or fix grammar in any claim`;
      return response;
    }
    
    return "I've completed the operation but couldn't format the response properly. Please check your claims to verify the changes.";
  }

  /**
   * Process a single tool call
   */
  private static async processSingleTool(
    toolCall: ChatToolCall,
    projectId: string,
    tenantId: string
  ): Promise<string> {
    logger.info('[ChatAgentService] Processing single tool', {
      tool: toolCall.tool,
      projectId,
      tenantId,
      args: toolCall.args,
    });

    const secureArgs = {
      ...toolCall.args,
      projectId,
      tenantId,
    };

    const toolResult = await executeTool(toolCall.tool, secureArgs);

    if (!toolResult.success) {
      return `I tried to run the ${toolCall.tool} analysis but encountered an error: ${toolResult.error}. Please try again or let me know if you need help differently.`;
    }

    // Handle different tool results
    if (toolCall.tool === 'validateInventionConsistency') {
      const issues = toolResult.data as ConsistencyIssue[];
      if (issues.length === 0) {
        return "✅ **Great news!** I've checked your invention for consistency and found no issues. Your claims are properly structured and all parsed elements are accounted for.";
      }

      let response = `I've analyzed your invention for consistency and found ${issues.length} issue${issues.length > 1 ? 's' : ''}:\n\n`;
      
      // Check for mirror claim patterns first
      const mirrorClaimIssues = issues.filter(i => i.message.includes('mirror claim pattern'));
      if (mirrorClaimIssues.length > 0) {
        response += '### 🔄 Mirror Claim Analysis\n\n';
        mirrorClaimIssues.forEach(issue => {
          response += `- ${issue.message}\n`;
        });
        response += '\n';
      }
      
      const errors = issues.filter(i => i.severity === 'error' && !i.message.includes('mirror'));
      const warnings = issues.filter(i => i.severity === 'warning' && !i.message.includes('mirror claim pattern'));
      const mirrorErrors = issues.filter(i => i.severity === 'error' && i.message.includes('mirror'));

      if (mirrorErrors.length > 0) {
        response += '### 🚨 Mirror Claim Inconsistencies (should fix)\n\n';
        mirrorErrors.forEach(issue => {
          response += `- ${issue.message}\n`;
          if (issue.suggestion) response += `  - 💡 ${issue.suggestion}\n`;
        });
        response += '\n';
      }

      if (errors.length > 0) {
        response += '### 🚨 Errors (must fix)\n\n';
        errors.forEach(issue => {
          response += `- ${issue.message}`;
          if (issue.claimNumber) response += ` (Claim ${issue.claimNumber})`;
          response += '\n';
          if (issue.suggestion) response += `  - 💡 ${issue.suggestion}\n`;
        });
        response += '\n';
      }

      if (warnings.length > 0) {
        response += '### ⚠️ Warnings (should review)\n\n';
        warnings.forEach(issue => {
          response += `- ${issue.message}`;
          if (issue.claimNumber) response += ` (Claim ${issue.claimNumber})`;
          response += '\n';
          if (issue.suggestion) response += `  - 💡 ${issue.suggestion}\n`;
        });
      }

      response += '\nWould you like me to help you address any of these issues?';
      return response;
    }
    
    // Handle claim operation results
    if (toolCall.tool === 'getClaims' || 
        toolCall.tool === 'addClaims' || 
        toolCall.tool === 'editClaim' || 
        toolCall.tool === 'deleteClaims' || 
        toolCall.tool === 'reorderClaims' || 
        toolCall.tool === 'mirrorClaims') {
      const result = toolResult.data as any;
      
      if (toolCall.tool === 'getClaims') {
        if (result.claims.length === 0) {
          return `## 📋 Current Claims\n\n${result.message}\n\nWould you like me to help you add some claims?`;
        }
        
        let response = `## 📋 Current Claims\n\n${result.message}\n\n`;
        result.claims.forEach((claim: any) => {
          response += `**Claim ${claim.number}**\n${claim.text}\n\n`;
        });
        response += `\nWhat would you like to do with these claims? I can:\n`;
        response += `- Edit any claim text\n`;
        response += `- Add new claims\n`;
        response += `- Delete claims\n`;
        response += `- Reorder claims\n`;
        response += `- Mirror claims to a different type (system, method, etc.)\n`;
        response += `- Shorten, clarify, or fix grammar in any claim`;
        return response;
      } else if (toolCall.tool === 'mirrorClaims') {
        let response = `## ✨ Claims Mirrored Successfully\n\n`;
        response += `${result.message}\n\n`;
        response += `The new ${toolCall.args?.targetType || ''} claims have been added to your claim set. `;
        response += `They maintain the same structure and dependencies as the original claims but are written in ${toolCall.args?.targetType || ''} format.\n\n`;
        response += `Would you like me to:\n`;
        response += `- Show you all claims (including the new ones)\n`;
        response += `- Make further edits to any claims\n`;
        response += `- Check the consistency of your expanded claim set`;
        response += '\n\n<!-- CLAIMS_UPDATED -->';
        return response;
      } else {
        // For other claim operations (add, edit, delete, reorder)
        let response = `## ✅ Claim Operation Completed\n\n`;
        response += `${result.message}\n\n`;
        
        if (result.claim) {
          response += `**Updated claim ${result.claim.number}:**\n${result.claim.text}\n\n`;
        }
        
        response += `Your claims have been updated. Would you like to:\n`;
        response += `- View all current claims\n`;
        response += `- Make additional changes\n`;
        response += `- Check claim consistency`;
        
        response += '\n\n<!-- CLAIMS_UPDATED -->';
        
        return response;
      }
    } else if (toolCall.tool === 'proposeClaimRevision') {
      const revision = toolResult.data as any;
      
      let response = `## 🔍 Claim Revision Proposal\n\n`;
      response += `I've analyzed claim ${revision.claimNumber} and generated a revision based on your instruction.\n\n`;
      
      response += `**Confidence:** ${Math.round(revision.confidence * 100)}%\n`;
      response += `**Reasoning:** ${revision.reasoning}\n\n`;
      
      response += `### Original Claim ${revision.claimNumber}:\n`;
      response += `${revision.original}\n\n`;
      
      response += `### Proposed Revision:\n`;
      response += `${revision.proposed}\n\n`;
      
      response += `### Changes:\n`;
      response += `<!-- REVISION_DIFF -->\n`;
      response += JSON.stringify({
        claimId: revision.claimId,
        claimNumber: revision.claimNumber,
        changes: revision.changes,
        proposedText: revision.proposed
      });
      response += `\n<!-- END_REVISION_DIFF -->\n\n`;
      
      response += `Would you like to:\n`;
      response += `- ✅ Apply this revision\n`;
      response += `- ❌ Reject and keep the original\n`;
      response += `- 🔄 Try a different instruction\n\n`;
      
      response += `To apply this revision, I can update the claim for you. Just let me know!`;
      
      return response;
    } else if (toolCall.tool === 'batchProposeRevisions') {
      const batchResult = toolResult.data as any;
      
      let response = `## 🔍 Batch Claim Revision Proposals\n\n`;
      response += `I've analyzed ${batchResult.summary.total} claims and generated revisions based on your instruction.\n\n`;
      
      if (batchResult.summary.failed > 0) {
        response += `⚠️ **Note:** ${batchResult.summary.failed} claim(s) could not be processed.\n\n`;
      }
      
      response += `### Revision Summary:\n`;
      response += `- **Total claims:** ${batchResult.summary.total}\n`;
      response += `- **Successful revisions:** ${batchResult.summary.successful}\n`;
      response += `- **Average confidence:** ${Math.round(
        batchResult.revisions.reduce((sum: number, r: any) => sum + r.confidence, 0) / 
        batchResult.revisions.length * 100
      )}%\n\n`;
      
      // Include all revision diffs in the response
      response += `### Individual Revisions:\n\n`;
      batchResult.revisions.forEach((revision: any) => {
        response += `#### Claim ${revision.claimNumber}\n`;
        response += `**Confidence:** ${Math.round(revision.confidence * 100)}%\n`;
        response += `**Reasoning:** ${revision.reasoning}\n\n`;
        
        response += `<!-- REVISION_DIFF -->\n`;
        response += JSON.stringify({
          claimId: revision.claimId,
          claimNumber: revision.claimNumber,
          changes: revision.changes,
          proposedText: revision.proposed
        });
        response += `\n<!-- END_REVISION_DIFF -->\n\n`;
      });
      
      response += `Would you like to:\n`;
      response += `- ✅ Apply all revisions at once\n`;
      response += `- 🔍 Review and apply revisions individually\n`;
      response += `- 🔄 Try different instructions\n\n`;
      response += `You can apply individual revisions using the buttons above each claim.`;
      
      return response;
    } else if (toolCall.tool === 'visualizeClaimDependencies') {
      const result = toolResult.data as any;
      
      let response = `## 📊 Claim Dependency Visualization\n\n`;
      
      if (result.summary.totalClaims === 0) {
        response += `No claims found in your project. Add some claims first to see their relationships.\n`;
      } else {
        response += `I've analyzed your **${result.summary.totalClaims} claims** and created a visual map of their dependencies:\n\n`;
        
        response += `### Summary:\n`;
        response += `- **Independent claims:** ${result.summary.independentClaims} (shown in blue)\n`;
        response += `- **Dependent claims:** ${result.summary.dependentClaims} (shown in purple)\n`;
        response += `- **Maximum dependency depth:** ${result.summary.maxDepth} levels\n\n`;
        
        response += `### Claim Dependency Diagram:\n\n`;
        response += '```mermaid\n' + result.mermaidDiagram + '```\n\n';
        
        response += `### How to Read This Diagram:\n`;
        response += `- **Blue boxes** are independent claims (they don't depend on other claims)\n`;
        response += `- **Purple boxes** are dependent claims\n`;
        response += `- **Arrows** show dependencies (arrow points from parent to dependent claim)\n`;
        response += `- **Red boxes** (if any) indicate missing claim references\n\n`;
        
        if (result.summary.maxDepth > 3) {
          response += `⚠️ **Note:** Your claims have ${result.summary.maxDepth} levels of dependencies. Consider whether all levels add value or if some could be consolidated.\n\n`;
        }
        
        response += `Would you like me to:\n`;
        response += `- Analyze the structure for potential improvements\n`;
        response += `- Identify any missing or broken dependencies\n`;
        response += `- Suggest claim reorganization`;
      }
      
      return response;
    }
    
    // Handle other tools (add more cases as needed)
    return `Tool ${toolCall.tool} executed successfully. ${toolResult.data?.message || ''}`;
  }

  /**
   * Streaming version of generateResponse that yields tokens as they're generated
   * This prevents UI freezing by sending data immediately
   */
  static async *generateResponseStream({
    projectId,
    messages,
    tenantId,
    pageContext,
    lastAction,
  }: GenerateChatResponseParams): AsyncGenerator<{ token?: string; done?: boolean; error?: string }> {
    try {
      let systemPrompt = `You are a patent expert assistant helping users with their patent applications. You have access to various tools to analyze and modify patent data.

## Important Instructions:

### GOLDEN RULE FOR PATENT CLAIMS:
**A seasoned patent attorney NEVER mixes claim types. Claims are ALWAYS grouped by type (apparatus/system together, then method/process together, then CRM together). This is fundamental patent drafting practice.**

### Mirror Claim Consistency:
- **Mirror claims** are claims of different types (e.g., system vs method) that cover the same invention
- When claims appear to be mirrors (e.g., claims 1-8 are system, 9-16 are method), they should have:
  - Corresponding technical elements (with appropriate type transformations)
  - Similar structure and coverage
  - Matching dependent claim patterns
- The validateInventionConsistency tool now detects and validates mirror claim patterns
- If inconsistencies are found between mirror claims, help users understand what's missing or different

### Patent Claim Structure and Numbering Rules:
- **CRITICAL**: Claims must be grouped by type in proper order:
  - Apparatus/System claims (e.g., 1-8)
  - Method/Process claims (e.g., 9-16)
  - CRM (Computer-Readable Medium) claims (e.g., 17-20)
- **NEVER** suggest adding dependent claims after a different claim type has started
- When adding dependent claims:
  - Insert them within the same claim type group
  - Renumber subsequent claims to maintain proper grouping
  - Example: To add dependent apparatus claims when you have apparatus claims 1-4 and method claims 5-8:
    - Add new claims as 5-7
    - Renumber old method claims 5-8 to become 8-11
- When a user asks to shorten a claim:
  - Break it into a main claim and dependent claims
  - Ensure new dependent claims stay within the same type group
  - Suggest proper claim numbers that maintain grouping
  - NEVER suggest numbers that would place the new claims after a different claim type
  - Example: If claim 4 is a system claim and claims 9-16 are method claims:
    - Suggest adding new dependent system claims as 5-7
    - Note that existing claims 5-8 would need to be renumbered to 8-11
    - Method claims would then start at 12 instead of 9

### Context Recognition:
- When users say "my claim", "my invention", "my patent", etc., they are ALWAYS referring to their actual project data
- NEVER create hypothetical examples when users reference "my" data
- If a user mentions a specific claim number (e.g., "my claim 4"), either:
  - Use the loaded context below to provide specific advice about that actual claim
  - OR use the getClaims tool to fetch the full claim text if you need more detail
- Always work with the user's real data, not made-up examples
- When users mention claim length issues:
  - Analyze the ACTUAL claim text from the loaded context
  - Provide specific suggestions for that exact claim
  - Show how to break it into dependent claims using the real content
  - Never use hypothetical refrigerator or other made-up examples

### Tool Usage:
- NEVER show raw JSON tool calls to users
- Always describe what you're doing in natural language
- If multiple actions are needed, explain the sequence clearly
- Format tool results in a user-friendly way
- Use tools proactively when users reference specific data you don't have full access to

### Response Formatting:
- Use markdown headers (##, ###) to structure your responses
- Use **bold** for emphasis and important points
- Use bullet points and numbered lists for clarity
- Include code blocks with \`\`\` when showing examples
- Be concise but thorough

### Error Handling:
- If a tool fails, explain the issue clearly and suggest alternatives
- Never expose technical error details or stack traces
- Provide helpful guidance on how to proceed

### Context Awareness:
You're on the ${
  pageContext === 'technology'
    ? 'Technology Details'
    : pageContext === 'claim-refinement'
      ? 'Claim Refinement'
      : 'Patent Application'
} page.
${
  pageContext === 'technology'
    ? 'Focus on helping with invention details, technical descriptions, advantages, and novelty.'
    : pageContext === 'claim-refinement'
      ? 'Focus on claim analysis, dependencies, breadth, and improvements.'
      : 'Focus on patent application sections and overall document quality.'
}
`;

      // Load invention context if projectId and tenantId are provided
      let inventionContext: InventionChatContext | null = null;
      if (projectId && tenantId) {
        inventionContext = await getInventionContextForChat(
          projectId,
          tenantId
        );

        if (inventionContext) {
          // Add context to system prompt
          systemPrompt += `\n\n## Current Project Context (You Have Access To All This Data)\n\n`;
          systemPrompt += `**Project:** ${inventionContext.project.name} (Status: ${inventionContext.project.status})\n\n`;

          if (inventionContext.invention) {
            const inv = inventionContext.invention;
            systemPrompt += `### Invention Details\n\n`;
            if (inv.title) systemPrompt += `**Title:** ${inv.title}\n`;
            if (inv.patentCategory)
              systemPrompt += `**Category:** ${inv.patentCategory}\n`;
            if (inv.technicalField)
              systemPrompt += `**Technical Field:** ${inv.technicalField}\n`;

            if (inv.summary) {
              systemPrompt += `\n**Summary:**\n${inv.summary}\n`;
            }

            if (inv.noveltyStatement) {
              systemPrompt += `\n**Novelty Statement:**\n${inv.noveltyStatement}\n`;
            }

            if (inv.advantages && inv.advantages.length > 0) {
              systemPrompt += `\n**Key Advantages:**\n\n`;
              inv.advantages.forEach((adv, idx) => {
                systemPrompt += `${idx + 1}. ${adv}\n`;
              });
            }

            if (inv.features && inv.features.length > 0) {
              systemPrompt += `\n**Key Features:**\n\n`;
              inv.features.forEach((feat, idx) => {
                systemPrompt += `${idx + 1}. ${feat}\n`;
              });
            }
          }

          // Add claims context
          if (inventionContext.claims && inventionContext.claims.length > 0) {
            systemPrompt += `\n### Current Claims (${inventionContext.claims.length} total)\n\n`;
            
            // Analyze claim types
            const claimTypes: { [key: string]: number[] } = {};
            inventionContext.claims.forEach(claim => {
              const claimText = claim.text.toLowerCase();
              let type = 'unknown';
              if (claimText.includes('system') || claimText.includes('apparatus')) {
                type = 'apparatus/system';
              } else if (claimText.includes('method') || claimText.includes('process')) {
                type = 'method/process';
              } else if (claimText.includes('computer-readable medium') || claimText.includes('crm')) {
                type = 'CRM';
              } else if (claimText.includes('the system of claim') || claimText.includes('the apparatus of claim')) {
                type = 'apparatus/system';
              } else if (claimText.includes('the method of claim') || claimText.includes('the process of claim')) {
                type = 'method/process';
              }
              
              if (!claimTypes[type]) claimTypes[type] = [];
              claimTypes[type].push(claim.number);
            });
            
            // Add claim type summary
            systemPrompt += `**Claim Type Groups:**\n`;
            Object.entries(claimTypes).forEach(([type, numbers]) => {
              if (numbers.length > 0) {
                systemPrompt += `- ${type}: Claims ${numbers.join(', ')}\n`;
              }
            });
            systemPrompt += `\n`;
            
            // Include ALL claims in the context so the AI can reference any specific claim
            inventionContext.claims.forEach(claim => {
              systemPrompt += `**Claim ${claim.number}:**\n${claim.text}\n\n`;
            });
            
            systemPrompt += `\n*Note: You have access to all ${inventionContext.claims.length} claims above. When the user references a specific claim number, use the actual text from above. Maintain proper claim type grouping when suggesting changes.*\n`;
          }

          // Add parsed elements context if any
          if (
            inventionContext.invention?.parsedClaimElements &&
            inventionContext.invention.parsedClaimElements.length > 0
          ) {
            systemPrompt += `\n### Key Technical Elements\n\n`;
            const elementsPreview = inventionContext.invention.parsedClaimElements.slice(0, 10);
            elementsPreview.forEach((element, idx) => {
              systemPrompt += `${idx + 1}. ${element}\n`;
            });
            if (inventionContext.invention.parsedClaimElements.length > 10) {
              systemPrompt += `\n*...and ${inventionContext.invention.parsedClaimElements.length - 10} more elements*\n`;
            }
          }

          // Add recent prior art context
          if (inventionContext.savedPriorArt && inventionContext.savedPriorArt.length > 0) {
            systemPrompt += `\n### Relevant Prior Art (${inventionContext.savedPriorArt.length} references)\n\n`;
            const priorArtPreview = inventionContext.savedPriorArt.slice(0, 3);
            priorArtPreview.forEach(ref => {
              systemPrompt += `- **${ref.patentNumber}**: "${ref.title}" (Saved: ${new Date(ref.savedAt).toLocaleDateString()})\n`;
            });
            if (inventionContext.savedPriorArt.length > 3) {
              systemPrompt += `\n*...and ${inventionContext.savedPriorArt.length - 3} more references*\n`;
            }
          }

          // Add last action context if provided
          if (lastAction) {
            systemPrompt += `\n### Recent User Action\n\n`;
            switch (lastAction.type) {
              case 'claim-revised':
                systemPrompt += `The user just revised claim ${lastAction.claimNumber}. You should:\n`;
                systemPrompt += `- Acknowledge the revision if appropriate\n`;
                systemPrompt += `- Check if dependent claims need updates\n`;
                systemPrompt += `- Suggest any improvements to the revised claim\n`;
                break;
              case 'claim-added':
                systemPrompt += `The user just added a new claim (claim ${lastAction.claimNumber}). You should:\n`;
                systemPrompt += `- Review the new claim for clarity and breadth\n`;
                systemPrompt += `- Suggest appropriate dependencies if needed\n`;
                systemPrompt += `- Check for overlap with existing claims\n`;
                break;
              case 'claim-deleted':
                systemPrompt += `The user just deleted claim ${lastAction.claimNumber}. You should:\n`;
                systemPrompt += `- Note any dependent claims that may need updating\n`;
                systemPrompt += `- Suggest if any important subject matter was lost\n`;
                break;
              case 'claims-mirrored':
                systemPrompt += `The user just mirrored claims. You should:\n`;
                systemPrompt += `- Acknowledge the mirroring action\n`;
                systemPrompt += `- Explain what was updated\n`;
                systemPrompt += `- Suggest next steps for claim refinement\n`;
                break;
              case 'claims-reordered':
                systemPrompt += `The user just reordered claims ${lastAction.claimNumbers?.join(' and ')}. You should:\n`;
                systemPrompt += `- Acknowledge the reordering\n`;
                systemPrompt += `- Check if the new order improves logical flow\n`;
                systemPrompt += `- Suggest any dependency updates if needed\n`;
                break;
            }
            systemPrompt += `\nBe proactive and helpful based on this recent action, but don't be pushy.\n`;
          }
        } else {
          logger.warn(
            '[ChatAgentService] No invention context found for project',
            {
              projectId,
              tenantId,
            }
          );
        }
      }

      // Use streaming API
      const stream = OpenaiServerService.getChatCompletionStream({
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      });

      let fullResponse = '';
      
      // Stream tokens as they arrive
      for await (const chunk of stream) {
        if (chunk.token) {
          fullResponse += chunk.token;
          yield { token: chunk.token };
        }
        
        if (chunk.done) {
          // Check if the response is a tool call
          const toolCall = safeJsonParse<ChatToolCall>(fullResponse.trim());
          const toolChain = safeJsonParse<ChatToolChain>(fullResponse.trim());

          if (toolChain && toolChain.tools && Array.isArray(toolChain.tools)) {
            // Process tool chain and stream the result
            const toolResult = await ChatAgentService.processToolChain(toolChain, projectId!, tenantId!);
            // Clear the streamed JSON and send the formatted result
            yield { token: '\r' }; // Carriage return to "clear" the line in some terminals
            for (const char of toolResult) {
              yield { token: char };
            }
          } else if (toolCall && toolCall.tool) {
            // Process single tool and stream the result  
            const toolResult = await ChatAgentService.processSingleTool(toolCall, projectId!, tenantId!);
            yield { token: '\r' };
            for (const char of toolResult) {
              yield { token: char };
            }
          } else if (
            (fullResponse.trim().startsWith('{"tool":') &&
            fullResponse.includes('"args":')) ||
            (fullResponse.trim().startsWith('{"tools":') &&
            fullResponse.includes('['))
          ) {
            // AI returned raw tool JSON despite instructions
            logger.error(
              '[ChatAgentService] AI returned raw tool JSON despite instructions',
              {
                projectId,
                rawResponse: fullResponse,
              }
            );
            yield { token: '\r' };
            const errorMsg = "I apologize, but I encountered an issue while trying to process your request. Please try asking me again.";
            for (const char of errorMsg) {
              yield { token: char };
            }
          }
          
          yield { done: true };
        }
      }
    } catch (error) {
      logger.error('[ChatAgentService] Failed to generate streaming response', {
        projectId,
        error,
      });
      yield { error: 'Failed to generate response', done: true };
    }
  }
}
