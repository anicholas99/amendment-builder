import { logger } from '@/server/logger';
import {
  getInventionContextForChat,
  type InventionChatContext,
} from '@/repositories/chatRepository';
import { getAvailableTools } from '@/server/tools/toolExecutor';

export type PageContext = 'technology' | 'claim-refinement' | 'patent';

interface SystemPromptOptions {
  pageContext: PageContext;
  inventionContext: InventionChatContext | null;
  lastAction?: {
    type:
      | 'claim-revised'
      | 'claim-added'
      | 'claim-deleted'
      | 'claims-mirrored'
      | 'claims-reordered';
    claimNumber?: number;
    claimNumbers?: number[];
    details?: string;
  };
}

// Static prompt constants to reduce token usage and improve maintainability
const PROMPT_CONSTANTS = {
  ROLE: `You are a patent expert assistant helping users with their patent applications. You have access to various tools to analyze and modify patent data. You also have full access to any documents the user has uploaded to their project, including parent patents, office actions, and reference documents.`,

  LEGAL_DISCLAIMER: `\n**Important:** You are a technical drafting assistant providing technical assistance only. You are not a lawyer and do not provide legal advice.\n`,

  TONE: `Be professional, concise, and helpful. Use markdown for formatting, bullet points for clarity, and code blocks for examples.`,

  JSON_INSTRUCTION: `## Tool Calling Instructions:

When you need to use tools to help the user, respond with ONLY the raw JSON - no markdown formatting, no code blocks, no explanatory text. The system will automatically detect and execute your tools.

### CRITICAL RULES:
1. When user asks you to PERFORM an action (mirror claims, edit claim, add claim, proofread, check for errors, etc.), respond with ONLY the JSON - nothing else
2. When user asks you to EXPLAIN or DISCUSS something, respond normally with text
3. NEVER mix JSON and regular text in the same response
4. NEVER put JSON in code blocks or format it with markdown
5. The JSON will be invisible to the user - they'll only see the results`,

  ERROR_HANDLING: `### Error Handling:
- If a tool fails, explain the issue clearly and suggest alternatives
- Never expose technical error details or stack traces
- Provide helpful guidance on how to proceed`,

  CLAIM_STRUCTURE_RULES: `### GOLDEN RULE FOR PATENT CLAIMS:
**A seasoned patent attorney NEVER mixes claim types. Claims are ALWAYS grouped by type (apparatus/system together, then method/process together, then CRM together). This is fundamental patent drafting practice.**

### Patent Claim Structure and Numbering Rules:
- **CRITICAL**: Claims must be grouped by type in proper order:
  - Apparatus/System claims (e.g., 1-8)
  - Method/Process claims (e.g., 9-16)
  - CRM (Computer-Readable Medium) claims (e.g., 17-20)
- **NEVER** suggest adding dependent claims after a different claim type has started
- When adding dependent claims:
  - Insert them within the same claim type group
  - Renumber subsequent claims to maintain proper grouping`,

  MIRROR_CLAIM_RULES: `### Mirror Claim Consistency:
- **Mirror claims** are claims of different types (e.g., system vs method) that cover the same invention
- When claims appear to be mirrors, they should have:
  - Corresponding technical elements (with appropriate type transformations)
  - Similar structure and coverage
  - Matching dependent claim patterns`,

  FIGURE_RULES: `### Figure and Reference Numeral Management:
- **Reference numerals** are numbered elements (e.g., "10", "12", "100a") that identify parts in patent figures
- Each figure can have multiple reference numerals with descriptions
- Reference numeral best practices:
  - Use consistent numbering across figures
  - Start with round numbers (10, 20, 30) for major components
  - Use sub-numbers (12, 14, 16) for sub-components
  - Use letters (100a, 100b) for variations of the same element`,

  CONTEXT_RECOGNITION: `### Context Recognition:
- When users say "my claim", "my invention", "my patent", etc., they are ALWAYS referring to their actual project data
- NEVER create hypothetical examples when users reference "my" data
- Always work with the user's real data, not made-up examples`,
} as const;

/**
 * Manages context loading and system prompt generation for the chat agent
 * Extracted from ChatAgentService for better modularity
 */
export class ContextManager {
  /**
   * Load invention context for a project
   */
  static async loadProjectContext(
    projectId: string | undefined,
    tenantId: string | undefined,
    sessionId?: string,
    pageContext?: PageContext
  ): Promise<InventionChatContext | null> {
    if (!projectId || !tenantId) {
      return null;
    }

    try {
      const baseContext = await getInventionContextForChat(projectId, tenantId);

      // Load uploaded patent files if available
      if (baseContext && baseContext.invention) {
        // Import prisma dynamically to avoid initialization issues
        const { prisma } = await import('@/lib/prisma');

        // Load draft documents if in patent view
        if (pageContext === 'patent' && prisma) {
          try {
            const draftDocuments = await prisma.draftDocument.findMany({
              where: { projectId },
              select: {
                id: true,
                type: true,
                content: true,
              },
            });

            (baseContext as any).draftDocuments = draftDocuments;

            logger.debug(
              '[ContextManager] Loaded draft documents for patent view',
              {
                projectId,
                count: draftDocuments.length,
                sections: draftDocuments.map(d => ({
                  type: d.type,
                  hasContent: !!(d.content && d.content.trim().length > 0),
                })),
              }
            );
          } catch (err) {
            logger.error('[ContextManager] Failed to load draft documents', {
              projectId,
              error: err,
            });
          }
        }

        // Load project documents (user uploads)
        let projectDocuments: any[] = [];
        if (prisma) {
          try {
            const documents = await (prisma as any).projectDocument.findMany({
              where: { projectId },
              select: {
                id: true,
                fileName: true,
                originalName: true,
                fileType: true,
                extractedText: true,
                extractedMetadata: true,
                createdAt: true,
              },
            });

            // Transform to match expected format
            projectDocuments = documents.map((doc: any) => ({
              id: doc.id,
              patentNumber: doc.fileName, // For backward compatibility
              title: doc.originalName,
              extractedText: doc.extractedText,
              fileType: doc.fileType,
              metadata: doc.extractedMetadata
                ? JSON.parse(doc.extractedMetadata)
                : null,
            }));
          } catch (err) {
            logger.error('[ContextManager] Failed to load project documents', {
              projectId,
              error: err,
            });
          }
        }

        // Load saved prior art (from searches)
        let savedPriorArt: any[] = [];
        if (prisma) {
          try {
            savedPriorArt = await prisma.savedPriorArt.findMany({
              where: {
                projectId,
              },
              select: {
                id: true,
                patentNumber: true,
                title: true,
                claim1: true,
                abstract: true,
              },
            });
          } catch (err) {
            logger.error('[ContextManager] Failed to load saved prior art', {
              projectId,
              error: err,
            });
          }
        }

        // Load session files if sessionId provided (temporary uploads)
        let sessionFiles: any[] = [];
        if (sessionId && prisma) {
          sessionFiles = (await prisma.savedPriorArt.findMany({
            where: {
              sessionId,
            } as any,
            select: {
              id: true,
              patentNumber: true,
              title: true,
              claim1: true,
            },
          })) as any[];
        }

        // Add all document types to context
        (baseContext as any).projectDocuments = projectDocuments;
        (baseContext as any).savedPriorArt = savedPriorArt;
        (baseContext as any).sessionReferences = sessionFiles;
      }

      return baseContext;
    } catch (error) {
      logger.error('[ContextManager] Failed to load project context', {
        projectId,
        error,
      });
      return null;
    }
  }

  /**
   * Generate tool definitions section
   */
  private static generateToolSection(): string {
    let section = '### Available Tools:\n';

    // Get tools from the central registry
    const tools = getAvailableTools();

    tools.forEach(tool => {
      section += `- **${tool.name}**: ${tool.description}\n`;

      // Add args hint based on tool name - this could be improved
      // by including args in the tool registry itself
      const argsHint = this.getToolArgsHint(tool.name);
      if (argsHint) {
        section += `  - args: ${argsHint}\n`;
      }
    });

    return section;
  }

  /**
   * Get args hint for a tool (temporary solution until args are in registry)
   */
  private static getToolArgsHint(toolName: string): string | null {
    const argsHints: Record<string, string> = {
      mirrorClaims:
        'claimNumbers (array), targetType (string: "method", "system", "apparatus", "process", "crm")',
      proposeClaimRevision: 'claimNumber (number), instruction (string)',
      batchProposeRevisions:
        'claimNumbers (array) or allClaims (boolean), instruction (string)',
      editClaim: 'claimNumber (number), newText (string)',
      addClaims: 'claims (array of {number, text})',
      deleteClaims: 'claimNumbers (array)',
      reorderClaims: 'claim1Number (number), claim2Number (number)',
      updateInventionDetails: 'additionalDetails (string)',
      enhancePatentSection: 'sectionName (string), instruction (string)',
      batchEnhancePatentSections:
        'sectionNames (array of strings), instruction (string)',
      getFigureElements: 'figureKey (optional string)',
      addFigureElement:
        'figureKey (string), elementNumber (string), description (string)',
      updateFigureElement:
        'figureKey (string), elementNumber (string), newDescription (string)',
      removeFigureElement: 'figureKey (string), elementNumber (string)',
      getDocument: 'documentId (optional string) or fileName (optional string)',
      searchPriorArt: 'query (string), limit (optional number)',
      updatePatentClaims: '(no arguments needed - syncs from claim refinement)',
      setPatentClaimsDirectly: 'claimsText (string)',
      checkClaimEligibility101: 'claimText (string)',
      batchCheckClaimEligibility101: 'claimIds (optional array of strings)',
    };

    return argsHints[toolName] || null;
  }

  /**
   * Generate the system prompt based on context
   */
  static generateSystemPrompt(options: SystemPromptOptions): string {
    const { pageContext, inventionContext, lastAction } = options;

    // Build prompt from constants and dynamic content
    let systemPrompt = PROMPT_CONSTANTS.ROLE + '\n\n';
    systemPrompt += PROMPT_CONSTANTS.LEGAL_DISCLAIMER;
    systemPrompt += PROMPT_CONSTANTS.JSON_INSTRUCTION + '\n\n';

    // Add format examples
    systemPrompt += `### Single Tool Call Format:
{"tool": "toolName", "args": {"param1": "value1", "param2": "value2"}}

### Multiple Tools (Tool Chain) Format:
{"tools": [{"tool": "getClaims", "args": {}}, {"tool": "mirrorClaims", "args": {"claimNumbers": [1, 2, 3], "targetType": "method"}}]}

`;

    // Add auto-generated tool definitions
    systemPrompt += this.generateToolSection() + '\n';

    // Add behavioral rules
    systemPrompt += PROMPT_CONSTANTS.CLAIM_STRUCTURE_RULES + '\n\n';
    systemPrompt += PROMPT_CONSTANTS.MIRROR_CLAIM_RULES + '\n\n';
    systemPrompt += PROMPT_CONSTANTS.FIGURE_RULES + '\n\n';
    systemPrompt += PROMPT_CONSTANTS.CONTEXT_RECOGNITION + '\n\n';

    // Add proofreading emphasis
    systemPrompt += `### NEVER CREATE MANUAL PROOFREADING RESPONSES:
- When asked to proofread, check, review, or analyze claims for errors, ALWAYS use the batchProposeRevisions tool
- Do NOT manually format claim text with "Original:" and "Proofread Version:" sections
- The tools will handle all formatting automatically

### IMPORTANT - Claim Number to ID Mapping:
Most claim tools require claim IDs (not claim numbers). When a user references claims by number:
1. First use getClaims to get the full list and map numbers to IDs
2. Then use the IDs for operations like edit, delete, reorder, etc.
3. For convenience, when users say "delete claim 7", execute: {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "deleteClaims", "args": {"claimIds": ["<claim-7-id>"]}}]}

### CRITICAL - Contextual Offers and Acceptance:
When you offer to help with specific claims and the user responds affirmatively (yes, sure, ok, please, etc.):
1. **Remember what you offered** - If you suggested "Would you like help amending claims 6 and 7?", track those claim numbers
2. **Use batch tools for multiple items** - For multiple claims, ALWAYS use batchProposeRevisions, not single proposeClaimRevision
3. **Apply the same instruction to all mentioned claims** - User's acceptance applies to ALL claims you mentioned

Examples of contextual acceptance:
- Agent: "Would you like help amending claims 6 and 7?" 
  User: "Yes" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "batchProposeRevisions", "args": {"claimNumbers": [6, 7], "instruction": "improve clarity and fix any issues"}}]}
- Agent: "I can help improve claims 3, 4, and 5 for clarity"
  User: "Please do" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "batchProposeRevisions", "args": {"claimNumbers": [3, 4, 5], "instruction": "improve clarity"}}]}
- Agent: "Claims 2 and 8 have similar issues. Should I fix them?"
  User: "Sure" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "batchProposeRevisions", "args": {"claimNumbers": [2, 8], "instruction": "fix the identified issues"}}]}

### CRITICAL - When Identifying Issues with Multiple Claims:
When you identify issues or improvements needed for multiple claims:
1. **Always offer to fix ALL identified claims together** - Don't just fix one and ignore others
2. **List all affected claims in your offer** - Be explicit about which claims need attention
3. **Use batchProposeRevisions for the entire set** - More efficient and better user experience

Examples:
- If you find grammar issues in claims 4, 5, and 6, say: "I found grammar issues in claims 4, 5, and 6. Would you like me to fix all of them?"
- If claims 2 and 7 have similar clarity problems, say: "Claims 2 and 7 both have clarity issues. Should I improve both?"
- When analyzing all claims and finding multiple issues, offer: "I found issues in claims 3, 5, 8, and 9. Would you like me to propose revisions for all of them?"

`;

    // Add tool response examples
    systemPrompt += `### Tool Response Examples:
- User: "Mirror my claims to method claims" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "mirrorClaims", "args": {"claimIds": ["<all-claim-ids>"], "targetType": "method"}}]}
- User: "Show me all claims" → {"tool": "getClaims", "args": {}}
- User: "Delete claim 7" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "deleteClaims", "args": {"claimIds": ["<claim-7-id>"]}}]}
- User: "Remove claims 5 and 6" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "deleteClaims", "args": {"claimIds": ["<claim-5-id>", "<claim-6-id>"]}}]}
- User: "Edit claim 3 to say..." → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "editClaim", "args": {"claimId": "<claim-3-id>", "newText": "..."}}]}
- User: "Proofread my claims" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "batchProposeRevisions", "args": {"claimIds": ["<all-claim-ids>"], "instruction": "proofread for grammar, clarity, proper antecedent basis, and conciseness"}}]}
- User: "Fix claims 6 and 7" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "batchProposeRevisions", "args": {"claimNumbers": [6, 7], "instruction": "fix grammar and clarity issues"}}]}
- User: "Make claims 3-5 broader" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "batchProposeRevisions", "args": {"claimNumbers": [3, 4, 5], "instruction": "broaden the claim scope"}}]}
- User: "Check consistency" or "Run consistency check" → {"tool": "checkPatentConsistency", "args": {}}
- User: "Search for drone delivery patents" → {"tool": "searchPriorArt", "args": {"query": "drone delivery", "limit": 10}}
- User: "Find prior art about blockchain voting" → {"tool": "searchPriorArt", "args": {"query": "blockchain voting", "limit": 10}}
- User: "What are mirror claims?" → Normal text explanation (no tools needed)
- User: "Show me the office action" → {"tool": "getDocument", "args": {"fileName": "office action"}}
- User: "Analyze the parent patent" → {"tool": "getDocument", "args": {"fileName": "parent patent"}}
- User: "Is claim 3 patentable under 101?" → {"tools": [{"tool": "getClaims", "args": {}}, {"tool": "checkClaimEligibility101", "args": {"claimText": "<claim-3-text>"}}]}
- User: "Check if my claims are too abstract" → {"tool": "batchCheckClaimEligibility101", "args": {}}
- User: "Does this claim look eligible: A method comprising..." → {"tool": "checkClaimEligibility101", "args": {"claimText": "A method comprising..."}}
- User: "Check all claims for 101 issues" → {"tool": "batchCheckClaimEligibility101", "args": {}}

### IMPORTANT - Batch Processing Rule:
When users mention multiple items of the same type (multiple claims, multiple sections, etc.), prefer batch tools over sequential single-item tools:
- Multiple claims → Use batchProposeRevisions instead of multiple proposeClaimRevision calls
- Multiple patent sections → Use batchEnhancePatentSections instead of multiple enhancePatentSection calls
- This provides better performance and cleaner user experience

**NEVER do this:**
- Call proposeClaimRevision for claim 6, then proposeClaimRevision for claim 7 separately
- This creates a poor user experience and requires multiple interactions

**ALWAYS do this:**
- Call batchProposeRevisions with claimNumbers: [6, 7] to handle both at once
- The UI will show both revisions with individual Apply/Reject buttons for each

### Patent Application View Examples (when pageContext = 'patent'):
- User: "Enhance my summary" → {"tool": "enhancePatentSection", "args": {"sectionName": "summary", "instruction": "make it more comprehensive"}}
- User: "Improve the abstract" → {"tool": "enhancePatentSection", "args": {"sectionName": "abstract", "instruction": "ensure it's under 150 words and covers key aspects"}}
- User: "Update the background section" → {"tool": "enhancePatentSection", "args": {"sectionName": "background", "instruction": "add more context about the problem being solved"}}
- User: "Make the detailed description more thorough" → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "add more implementation details"}}
- User: "Make my field and background sections shorter" → {"tool": "batchEnhancePatentSections", "args": {"sectionNames": ["field", "background"], "instruction": "make them shorter and more concise"}}
- User: "Make my field section shorter and my background longer" → {"tool": "batchEnhancePatentSections", "args": {"sectionNames": ["field", "background"], "instruction": "make field shorter and background longer with more technical context"}}
- User: "Shorten field and expand background" → {"tool": "batchEnhancePatentSections", "args": {"sectionNames": ["field", "background"], "instruction": "shorten field to be more concise, expand background with more detail"}}
- User: "Update field and background" → {"tool": "batchEnhancePatentSections", "args": {"sectionNames": ["field", "background"], "instruction": "improve both sections"}}
- User: "Improve all my patent sections" → {"tool": "batchEnhancePatentSections", "args": {"sectionNames": ["field", "background", "summary", "detailed_description", "abstract"], "instruction": "improve clarity and conciseness"}}
- User: "Check if my patent is consistent" → {"tool": "checkPatentConsistency", "args": {}}
- User: "Add my claims to the patent application" → {"tool": "updatePatentClaims", "args": {}}
- User: "Update the claims section in my patent" → {"tool": "updatePatentClaims", "args": {}}
- User: "Set the claims section to: 1. A method..." → {"tool": "setPatentClaimsDirectly", "args": {"claimsText": "1. A method..."}}

### CRITICAL - Context-Specific Tool Usage:
**In Technology Details View (pageContext = 'technology'):**
- User: "Add that the device uses carbon fiber" → {"tool": "updateInventionDetails", "args": {"additionalDetails": "The device uses carbon fiber"}}
- User: "Include wireless charging capability" → {"tool": "updateInventionDetails", "args": {"additionalDetails": "Includes wireless charging capability"}}

**In Patent Application View (pageContext = 'patent'):**
- User: "Add that the device uses carbon fiber" → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "Add that the device uses carbon fiber"}}
- User: "Incorporate these details into my patent: [technical specs]" → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "Incorporate these details: [technical specs]"}}
- User: "Add this embodiment: In one embodiment..." → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "Add this embodiment: In one embodiment..."}}

### Note on Tool Chains:
When you need claim IDs, always chain getClaims first. The system will automatically map claim numbers to IDs from the getClaims result before executing the next tool.

`;

    // Add important JSON format note
    systemPrompt += `### IMPORTANT - Correct JSON Format:
When adding claims, you MUST use this exact format:
{"tool": "addClaims", "args": {"claims": [{"number": 2, "text": "..."}, {"number": 3, "text": "..."}, ...]}}

`;

    // Add general guidelines
    systemPrompt += `## Important Instructions:

${PROMPT_CONSTANTS.TONE}

${PROMPT_CONSTANTS.ERROR_HANDLING}

### General Guidelines:
- Use tools proactively when users ask you to perform actions
- Tool calls are processed automatically - users won't see the JSON
- Results are formatted nicely for the user
- If a tool operation takes time, the user sees a loading indicator
- You can chain multiple tools together for complex operations

`;

    // Add page-specific context
    systemPrompt += this.generatePageContext(pageContext);

    // Add invention context if available
    if (inventionContext) {
      systemPrompt += this.formatInventionContext(inventionContext);
    }

    // Add last action context if available
    if (lastAction) {
      systemPrompt += this.formatLastAction(lastAction);
    }

    return systemPrompt;
  }

  /**
   * Generate page-specific context
   */
  private static generatePageContext(pageContext: PageContext): string {
    let context = `### Context Awareness:
You're on the ${
      pageContext === 'technology'
        ? 'Technology Details'
        : pageContext === 'claim-refinement'
          ? 'Claim Refinement'
          : 'Patent Application'
    } page.
`;

    if (pageContext === 'technology') {
      context += `Focus on helping with invention details, technical descriptions, advantages, and novelty.
    
### Invention Details Updates:
- When users want to add or update invention details (e.g., "add that the drone is made of carbon fiber"), use the updateInventionDetails tool
- This tool intelligently merges new information into the appropriate sections of the invention
- It maintains existing data while adding or enhancing with new details
- Always confirm what was updated after using this tool

### Figure Analysis and Creation:
- When users ask to analyze their invention and suggest figures, use the analyzeAndSuggestFigures tool
- This tool will create figure slots, add reference numerals, and update the invention text
- For creating individual figures, use createFigureSlot with a specific figure key
- For managing reference numerals, use addFigureElement, updateFigureElement, removeFigureElement`;
    } else if (pageContext === 'claim-refinement') {
      context +=
        'Focus on claim analysis, dependencies, breadth, and improvements.';
    } else {
      // Patent Application context
      context += `Focus on patent application sections and overall document quality.

### CRITICAL CONTEXT FOR PATENT APPLICATION VIEW:
- **When users refer to "claims", "summary", "abstract", etc., they are referring to the PATENT DOCUMENT SECTIONS, not invention data or claim management**
- The patent application is a formal document with these specific sections:
  - **Title**: The invention title
  - **Field**: Field of the invention (technical area)
  - **Background**: Background of the invention
  - **Summary**: Summary of the invention
  - **Brief Description of the Drawings**: Description of patent figures
  - **Detailed Description**: Detailed description of the invention
  - **Claims**: The formal patent claims section (different from claim management)
  - **Abstract**: Patent abstract (150 words or less)

### Important Distinctions:
- "Edit the summary" = Edit the SUMMARY section of the patent document
- "Update claims" = Update the CLAIMS section in the patent document
- "Check my abstract" = Review the ABSTRACT section of the patent document
- These are NOT the invention details or claim refinement features

### CRITICAL - Incorporating New Technical Details:
When users provide specific technical details, embodiments, or implementation examples:
- **"Incorporate these details into my patent"** → Use enhancePatentSection with sectionName: "detailed_description"
- **"Add this embodiment to my patent"** → Use enhancePatentSection with sectionName: "detailed_description"
- **"Include these specifications in my patent"** → Use enhancePatentSection with sectionName: "detailed_description"
- The instruction should include the full technical details provided by the user

### Examples of Incorporating Details:
- User: "Incorporate these details into my patent: The solar panel is 15% efficient..." 
  → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "Add the following embodiment details: The solar panel is 15% efficient..."}}
- User: "Add this embodiment: In one embodiment, a carbon fiber frame..."
  → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "Add this embodiment: In one embodiment, a carbon fiber frame..."}}
- User: "Please add these technical specifications to my patent..."
  → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "Add these technical specifications: [full specs provided by user]"}}

### CRITICAL - Two Different Claims Systems:
1. **Claim Refinement System** (Database):
   - Used for iterative claim drafting and editing
   - Tools: addClaims, editClaim, deleteClaims, reorderClaims, mirrorClaims
   - These modify claims in the refinement workspace

2. **Patent Document CLAIMS Section**:
   - The actual CLAIMS section in the patent application document
   - Tools: updatePatentClaims (syncs from refinement), setPatentClaimsDirectly
   - This is what appears in the final patent document

### When User Says "Add claims to my patent application":
- Use: updatePatentClaims (syncs from claim refinement system)
- OR: setPatentClaimsDirectly (if they provide the full claims text)
- NOT: addClaims (that's for the refinement system)

### Patent Document Enhancement:
- Use the enhancePatentSection tool to improve specific sections
- Use batchEnhancePatentSections to improve multiple sections at once
- Use checkPatentConsistency to verify all sections work together
- The patent document is the formal application that will be filed

### CRITICAL - Multiple Section Rule:
**ALWAYS use batchEnhancePatentSections when the user mentions 2 or more sections in the same request**, even if they have different instructions for each section. The batch tool can handle different instructions per section by including them all in the instruction parameter.

Examples requiring batch tool:
- "make field shorter and background longer" → Use batch with instruction covering both
- "update my field and background sections" → Use batch for both sections
- "improve summary and abstract" → Use batch for both sections
- "field needs to be shorter, background needs more detail" → Use batch with combined instruction

### Other Patent View Examples:
- User: "Enhance my summary" → {"tool": "enhancePatentSection", "args": {"sectionName": "summary", "instruction": "make it more comprehensive"}}
- User: "Improve the abstract" → {"tool": "enhancePatentSection", "args": {"sectionName": "abstract", "instruction": "ensure it's under 150 words and covers key aspects"}}
- User: "Update the background section" → {"tool": "enhancePatentSection", "args": {"sectionName": "background", "instruction": "add more context about the problem being solved"}}
- User: "Make the detailed description more thorough" → {"tool": "enhancePatentSection", "args": {"sectionName": "detailed_description", "instruction": "add more implementation details"}}
- User: "Make my field and background sections shorter" → {"tool": "batchEnhancePatentSections", "args": {"sectionNames": ["field", "background"], "instruction": "make them shorter and more concise"}}
- User: "Check if my patent is consistent" → {"tool": "checkPatentConsistency", "args": {}}
- User: "Add my claims to the patent application" → {"tool": "updatePatentClaims", "args": {}}
- User: "Update the claims section in my patent" → {"tool": "updatePatentClaims", "args": {}}
- User: "Set the claims section to: 1. A method..." → {"tool": "setPatentClaimsDirectly", "args": {"claimsText": "1. A method..."}}

### Note: When enhancing the detailed description with new embodiments, the AI should intelligently merge the new content into the existing section, maintaining proper patent formatting and structure.`;
    }

    return context + '\n';
  }

  /**
   * Group claims by type for summarization
   */
  private static groupClaimsByType(
    claims: Array<{ number: number; text: string }>
  ): Record<string, number[]> {
    const claimTypes: Record<string, number[]> = {};

    claims.forEach(claim => {
      const claimText = claim.text.toLowerCase();
      let type = 'unknown';

      // Determine claim type based on text
      if (claimText.includes('system') || claimText.includes('apparatus')) {
        type = 'apparatus/system';
      } else if (
        claimText.includes('method') ||
        claimText.includes('process')
      ) {
        type = 'method/process';
      } else if (
        claimText.includes('computer-readable medium') ||
        claimText.includes('crm')
      ) {
        type = 'crm';
      } else if (
        claimText.includes('the system of') ||
        claimText.includes('the apparatus of')
      ) {
        type = 'apparatus/system';
      } else if (
        claimText.includes('the method of') ||
        claimText.includes('the process of')
      ) {
        type = 'method/process';
      }

      if (!claimTypes[type]) {
        claimTypes[type] = [];
      }
      claimTypes[type].push(claim.number);
    });

    return claimTypes;
  }

  /**
   * Summarize claims if there are too many to prevent token overflow
   */
  private static summarizeClaims(
    claims: Array<{ number: number; text: string }>
  ): string {
    const MAX_FULL_CLAIMS = 10;
    const MAX_PREVIEW_LENGTH = 150;

    if (claims.length <= MAX_FULL_CLAIMS) {
      // Show all claims if small set
      let claimsStr = '';
      claims.forEach(claim => {
        claimsStr += `\n**Claim ${claim.number}:** ${claim.text}\n`;
      });
      return claimsStr;
    }

    // For large claim sets, provide a summary
    let summary = `\n### Claims Summary (${claims.length} total)\n\n`;

    // Group by type
    const claimTypes = this.groupClaimsByType(claims);

    // Show breakdown by type
    Object.entries(claimTypes).forEach(([type, numbers]) => {
      if (numbers.length > 0) {
        const sortedNumbers = numbers.sort((a, b) => a - b);
        summary += `- **${type} claims:** ${sortedNumbers.length} claims (${sortedNumbers.slice(0, 5).join(', ')}${sortedNumbers.length > 5 ? '...' : ''})\n`;
      }
    });

    // Show independent claims (claims that don't reference other claims)
    const independentClaims = claims.filter(c => {
      const lowerText = c.text.toLowerCase();
      return (
        !lowerText.includes(' of claim ') && !lowerText.includes(' of claims ')
      );
    });

    if (independentClaims.length > 0) {
      summary += `\n**Independent claims (${independentClaims.length}):**\n`;
      independentClaims.slice(0, 3).forEach(claim => {
        const preview =
          claim.text.length > MAX_PREVIEW_LENGTH
            ? claim.text.substring(0, MAX_PREVIEW_LENGTH) + '...'
            : claim.text;
        summary += `\n**Claim ${claim.number}:** ${preview}\n`;
      });
    }

    // Note about using getClaims
    summary += `\n(Use the getClaims tool to see all ${claims.length} claims in detail)\n`;

    return summary;
  }

  /**
   * Format invention context for the system prompt
   */
  private static formatInventionContext(context: InventionChatContext): string {
    let contextStr = `\n\n## Current Project Context (You Have Access To All This Data)\n\n`;
    contextStr += `**Project:** ${context.project.name} (Status: ${context.project.status})\n\n`;

    // Add patent document status if available
    if ((context as any).draftDocuments) {
      const draftDocs = (context as any).draftDocuments as Array<{
        type: string;
        content: string | null;
      }>;

      contextStr += `### Patent Document Status:\n`;
      const patentSections = [
        'Title',
        'FIELD',
        'BACKGROUND',
        'SUMMARY',
        'BRIEF DESCRIPTION OF THE DRAWINGS',
        'DETAILED DESCRIPTION',
        'CLAIMS',
        'ABSTRACT',
      ];

      patentSections.forEach(section => {
        const doc = draftDocs.find(d => d.type === section);
        if (doc) {
          const hasContent = doc.content && doc.content.trim().length > 0;
          contextStr += `- **${section}**: ${hasContent ? '✓ Has content' : '✗ Empty'}\n`;
        }
      });
      contextStr += '\n';
    }

    if (context.invention) {
      const inv = context.invention;
      contextStr += `### Invention Details\n\n`;
      if (inv.title) contextStr += `**Title:** ${inv.title}\n`;
      if (inv.patentCategory)
        contextStr += `**Category:** ${inv.patentCategory}\n`;
      if (inv.technicalField)
        contextStr += `**Technical Field:** ${inv.technicalField}\n`;

      if (inv.summary) {
        contextStr += `\n**Summary:**\n${inv.summary}\n`;
      }

      if (inv.noveltyStatement) {
        contextStr += `\n**Novelty Statement:**\n${inv.noveltyStatement}\n`;
      }

      if (inv.advantages && inv.advantages.length > 0) {
        contextStr += `\n**Key Advantages:**\n\n`;
        inv.advantages.forEach((adv, idx) => {
          contextStr += `${idx + 1}. ${adv}\n`;
        });
      }

      if (inv.features && inv.features.length > 0) {
        contextStr += `\n**Key Features:**\n\n`;
        inv.features.forEach((feat, idx) => {
          contextStr += `${idx + 1}. ${feat}\n`;
        });
      }
    }

    // Add claims context with summarization for large sets
    if (context.claims && context.claims.length > 0) {
      contextStr += `\n### Current Claims\n`;
      contextStr += this.summarizeClaims(context.claims);
    }

    // Add prior art context
    if (context.savedPriorArt && context.savedPriorArt.length > 0) {
      contextStr += `\n### Saved Prior Art (${context.savedPriorArt.length} references)\n\n`;
      context.savedPriorArt.slice(0, 3).forEach((ref, idx) => {
        contextStr += `${idx + 1}. **${ref.title}** (${ref.patentNumber})\n`;
      });
      if (context.savedPriorArt.length > 3) {
        contextStr += `... and ${context.savedPriorArt.length - 3} more references\n`;
      }
    }

    // Add project documents context
    const contextWithDocs = context as any;
    if (
      contextWithDocs.projectDocuments &&
      contextWithDocs.projectDocuments.length > 0
    ) {
      contextStr += `\n### Project Documents (${contextWithDocs.projectDocuments.length} files)\n`;
      contextStr += `User has uploaded these documents to the project:\n\n`;

      contextWithDocs.projectDocuments.forEach((doc: any, idx: number) => {
        contextStr += `${idx + 1}. **${doc.title}** (${doc.patentNumber})\n`;
        contextStr += `   - Type: ${doc.fileType}\n`;
        if (doc.metadata?.title) {
          contextStr += `   - Document Title: ${doc.metadata.title}\n`;
        }
        if (doc.metadata?.claim1) {
          contextStr += `   - First Claim: ${doc.metadata.claim1.substring(0, 150)}${doc.metadata.claim1.length > 150 ? '...' : ''}\n`;
        }
      });

      contextStr += `\n**To access document content, use the getDocument tool:**\n`;
      contextStr += `- Use documentId if you know it, or fileName for fuzzy search\n`;
      contextStr += `- Example: {"tool": "getDocument", "args": {"fileName": "office action"}}\n`;
      contextStr += `- The tool will return the full extracted text for analysis\n`;
    }

    // Add linked patent files context
    const contextWithFiles = context as any;
    if (
      contextWithFiles.linkedPatentFiles &&
      contextWithFiles.linkedPatentFiles.length > 0
    ) {
      contextStr += `\n### Linked Patent Documents (Full Text Available)\n`;
      contextStr += `These files are formally associated with this invention:\n\n`;

      contextWithFiles.linkedPatentFiles.forEach((file: any, idx: number) => {
        const fileType = file.fileType || 'document';
        contextStr += `${idx + 1}. **${file.title || 'Untitled'}** (${file.patentNumber})\n`;
        contextStr += `   - Type: ${fileType}\n`;
        if (file.claim1) {
          contextStr += `   - First Claim: ${file.claim1.substring(0, 150)}${file.claim1.length > 150 ? '...' : ''}\n`;
        }
      });

      contextStr += `\nUse these documents for:\n`;
      contextStr += `- Continuation analysis and claim consistency\n`;
      contextStr += `- Identifying overlapping subject matter\n`;
      contextStr += `- Legal compliance and dependency tracking\n`;
      contextStr += `- Comparing invention features and advantages\n`;
    }

    // Add session reference files context
    if (
      contextWithFiles.sessionReferences &&
      contextWithFiles.sessionReferences.length > 0
    ) {
      contextStr += `\n### Uploaded Reference Documents (Full Text Available)\n`;
      contextStr += `User uploaded these documents for discussion and analysis:\n\n`;

      contextWithFiles.sessionReferences.forEach((file: any, idx: number) => {
        contextStr += `${idx + 1}. **${file.title || 'Untitled'}** (${file.patentNumber})\n`;
      });

      contextStr += `\nYou have full access to analyze these documents for:\n`;
      contextStr += `- Novelty and inventive step comparisons\n`;
      contextStr += `- Prior art analysis and differentiation\n`;
      contextStr += `- Identifying technical advantages over the references\n`;
      contextStr += `- Summarizing key features and claims\n`;
    }

    return contextStr;
  }

  /**
   * Format last action context
   */
  private static formatLastAction(
    lastAction: SystemPromptOptions['lastAction']
  ): string {
    if (!lastAction) return '';

    let actionStr = `\n\n## Recent Action Context\n\n`;

    switch (lastAction.type) {
      case 'claim-revised':
        actionStr += `The user just revised claim ${lastAction.claimNumber}. `;
        break;
      case 'claim-added':
        actionStr += `The user just added new claim(s): ${lastAction.claimNumbers?.join(', ')}. `;
        break;
      case 'claim-deleted':
        actionStr += `The user just deleted claim(s): ${lastAction.claimNumbers?.join(', ')}. `;
        break;
      case 'claims-mirrored':
        actionStr += `The user just mirrored claims to create new ${lastAction.details} claims. `;
        break;
      case 'claims-reordered':
        actionStr += `The user just reordered claims. `;
        break;
    }

    actionStr += `Be aware of this recent change when responding.\n`;
    return actionStr;
  }
}
