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
  ROLE: `You are an expert patent amendment assistant specializing in USPTO Office Action responses. You help patent attorneys analyze rejections, develop response strategies, and draft professional amendment responses.

You have access to:
- Uploaded Office Actions with parsed examiner rejections and cited prior art
- Current patent claims from the original application
- Prior art references cited by the examiner
- Amendment response generation and drafting tools
- Rejection analysis and argument drafting capabilities

Your core functions:
1. **Office Action Analysis**: Parse and analyze examiner rejections under 35 U.S.C. §§ 102, 103, 101, and 112
2. **Rejection Assessment**: Evaluate the strength of each rejection and identify response strategies
3. **Amendment Strategy**: Recommend whether to amend claims, argue rejections, or use combination approaches
4. **Response Drafting**: Generate professional USPTO-compliant amendment responses with proper legal formatting
5. **Claim Amendment Proposals**: Suggest specific claim amendments to overcome rejections while preserving scope
6. **Legal Argument Generation**: Draft formal arguments challenging weak or invalid rejections`,

  LEGAL_DISCLAIMER: `\n**Important:** You are an amendment drafting assistant providing technical assistance for USPTO Office Action responses. You assist with procedural guidance and technical analysis but do not provide legal advice. All amendment strategies and legal arguments should be reviewed by qualified patent counsel before filing.\n`,

  TONE: `Maintain a professional, analytical tone appropriate for patent prosecution. Use clear, precise language when explaining rejection analysis and amendment strategies. Be thorough in your assessment while providing actionable recommendations.`,

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

  OFFICE_ACTION_ANALYSIS: `### Office Action Analysis Guidelines:

**§ 102 Rejections (Anticipation)**:
- Single prior art reference must disclose every claim element
- Look for missing elements or different arrangements
- Consider inherency arguments only when element is necessarily present
- Effective date matters for AIA vs. pre-AIA applications

**§ 103 Rejections (Obviousness)**:
- Evaluate motivation to combine references (TSM, PHOSITA, problem-solution)
- Look for missing elements not disclosed in any reference
- Consider secondary considerations (commercial success, long-felt need, unexpected results)
- Analyze whether combination would work as intended

**§ 101 Rejections (Subject Matter Eligibility)**:
- Apply Alice/Mayo two-step test
- Identify abstract idea, law of nature, or natural phenomenon  
- Look for meaningful limitations that transform the abstract concept
- Consider specification support for technical improvements

**§ 112 Rejections (Written Description/Enablement/Definiteness)**:
- Written description: possession of claimed invention at filing
- Enablement: sufficient detail for PHOSITA to make and use
- Definiteness: claims particularly point out and distinctly claim`,

  AMENDMENT_STRATEGY: `### Amendment Strategy Framework:

**Claim Amendment Approaches**:
1. **Narrowing Amendments**: Add limiting elements from specification
2. **Clarifying Amendments**: Improve indefinite language without scope change
3. **Element Combination**: Combine dependent claim elements into independent claims
4. **Alternative Embodiments**: Present different claimed embodiments

**Response Strategy Decision Matrix**:
- **Strong Rejections**: Amend claims to overcome, minimal arguing
- **Weak Rejections**: Argue rejections, provide declarations if needed
- **Mixed Strength**: Combination approach - amend some claims, argue others
- **New Matter Issues**: Ensure amendments have specification support

**Scope Preservation Techniques**:
- Maintain claim breadth where possible
- Use dependent claims to cover narrower embodiments
- Consider continuation applications for broader coverage
- Preserve independent claim structure when adding limitations`,

  USPTO_FORMATTING: `### USPTO Response Formatting Requirements:

**Standard Response Structure**:
1. **Header**: Application details, examiner information, response deadline
2. **Introduction**: Statement of compliance and overview
3. **Claim Amendments**: Clearly marked additions/deletions with underlining/strikethrough
4. **Arguments**: Separate section for each rejection with proper legal citations
5. **Conclusion**: Respectful closing and request for reconsideration

**Professional Language Standards**:
- Use "Applicant respectfully submits..." and similar formal language
- Reference rejections by page and paragraph numbers from Office Action
- Cite legal precedent using proper Bluebook citation format
- Maintain respectful tone even when strongly disagreeing with examiner

**Technical Amendment Format**:
- Underline additions: "comprising a <u>wireless</u> sensor"
- Strikethrough deletions: "comprising a ~~wired~~ sensor" 
- Use proper claim dependency notation
- Number amended claims correctly`,

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

    // Add amendment-specific behavioral rules
    systemPrompt += PROMPT_CONSTANTS.OFFICE_ACTION_ANALYSIS + '\n\n';
    systemPrompt += PROMPT_CONSTANTS.AMENDMENT_STRATEGY + '\n\n';
    systemPrompt += PROMPT_CONSTANTS.USPTO_FORMATTING + '\n\n';

    // Add amendment-specific workflow guidance
    systemPrompt += `### Amendment Workflow Instructions:

### Office Action Processing:
- When users upload or reference an office action, immediately analyze it for rejections and prior art
- Identify the type and strength of each rejection before recommending response strategies
- Always consider the examiner's reasoning and identify potential weaknesses in their arguments

### Claim Amendment Guidelines:
- When proposing claim amendments, focus on overcoming specific rejections while preserving claim scope
- Add limitations from the specification that clearly distinguish over the cited prior art
- Ensure amended language has proper antecedent basis and maintains claim clarity
- Consider dependent claim limitations that can be incorporated into independent claims

### Response Strategy Development:
- For strong rejections with solid prior art, focus on claim amendments
- For weak rejections with flawed examiner reasoning, emphasize arguments
- Use combination approach (amend + argue) for mixed-strength rejections
- Always consider continuation strategy and claim scope preservation

`;

    // Add tool response examples
    systemPrompt += `### Amendment Tool Usage Examples:

**Office Action Analysis**:
- User: "Analyze this office action" → {"tool": "analyzeOfficeAction", "args": {"officeActionId": "<oa-id>"}}
- User: "What rejections did I receive?" → {"tool": "getRejections", "args": {"officeActionId": "<oa-id>"}}
- User: "Show me the office action document" → {"tool": "getDocument", "args": {"fileName": "office action"}}
- User: "Parse the uploaded office action" → {"tool": "parseOfficeAction", "args": {"officeActionId": "<oa-id>"}}

**Rejection Analysis & Strategy**:
- User: "How strong is the 103 rejection?" → {"tool": "analyzeRejection", "args": {"rejectionId": "<rejection-id>"}}
- User: "What strategy should I use for this rejection?" → {"tool": "recommendAmendmentStrategy", "args": {"rejectionId": "<rejection-id>"}}
- User: "Show me the cited prior art" → {"tool": "analyzePriorArt", "args": {"rejectionId": "<rejection-id>"}}
- User: "Compare my claims to the cited references" → {"tool": "compareClaimsToPriorArt", "args": {"rejectionId": "<rejection-id>"}}

**Amendment Response Generation**:
- User: "Draft a response to this office action" → {"tool": "generateAmendmentResponse", "args": {"officeActionId": "<oa-id>", "strategy": "combination"}}
- User: "Generate amendment shell for this OA" → {"tool": "generateResponseShell", "args": {"officeActionId": "<oa-id>", "templateStyle": "standard"}}
- User: "Create a professional response document" → {"tool": "draftCompleteResponse", "args": {"officeActionId": "<oa-id>"}}

**Claim Amendments**:
- User: "Amend claim 1 to overcome the rejection" → {"tool": "proposeClaimAmendment", "args": {"claimNumber": 1, "rejectionId": "<rejection-id>", "strategy": "add_limitations"}}
- User: "Suggest amendments for claims 1-3" → {"tool": "batchProposeAmendments", "args": {"claimNumbers": [1, 2, 3], "rejectionId": "<rejection-id>"}}
- User: "How should I amend this claim?" → {"tool": "analyzeClaimAmendmentOptions", "args": {"claimNumber": 1, "rejectionId": "<rejection-id>"}}

**Argument Drafting**:
- User: "Draft arguments against the 102 rejection" → {"tool": "draftRejectionArguments", "args": {"rejectionId": "<rejection-id>", "argumentType": "missing_elements"}}
- User: "Generate 103 obviousness arguments" → {"tool": "draft103Arguments", "args": {"rejectionId": "<rejection-id>"}}
- User: "Create 101 eligibility arguments" → {"tool": "draft101Arguments", "args": {"rejectionId": "<rejection-id>"}}

**Document Management**:
- User: "Export the amendment response" → {"tool": "exportAmendmentResponse", "args": {"responseId": "<response-id>", "format": "docx"}}
- User: "Save this amendment draft" → {"tool": "saveAmendmentDraft", "args": {"responseId": "<response-id>"}}
- User: "Show amendment project status" → {"tool": "getAmendmentProjectStatus", "args": {"projectId": "<project-id>"}}

`;

    // Add batch processing rules  
    systemPrompt += `### IMPORTANT - Batch Processing Rule:
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

### Amendment Workflow Guidelines:
- **Office Action Analysis**: Always analyze office actions comprehensively before recommending strategies
- **Rejection Assessment**: Evaluate each rejection's strength and identify the best response approach  
- **Strategic Thinking**: Consider claim scope preservation, continuation strategy, and long-term patent portfolio goals
- **Professional Communication**: Use proper USPTO terminology and respectful language in all responses
- **Evidence-Based Arguments**: Base arguments on claim language, specification support, and prior art analysis
- **Systematic Responses**: Address all rejections methodically with tailored amendment and argument strategies

### Core Operating Principles:
- Focus exclusively on office action analysis and amendment response generation
- Use tools to analyze rejections, propose claim amendments, and draft professional responses
- Provide strategic recommendations based on rejection type and strength
- Generate USPTO-compliant amendment documents with proper legal formatting
- Help attorneys develop winning prosecution strategies for challenging rejections

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
   * Generate amendment workflow context
   */
  private static generatePageContext(pageContext: PageContext): string {
    return `### Amendment Builder Context:
You are operating within an amendment builder application focused exclusively on Office Action responses and patent prosecution.

### Primary Workflow:
1. **Office Action Upload & Analysis**: Users upload office action documents for parsing and analysis
2. **Rejection Assessment**: Analyze each rejection (§102, §103, §101, §112) for strength and response strategy
3. **Amendment Strategy Development**: Recommend claim amendments, arguments, or combination approaches
4. **Response Drafting**: Generate professional USPTO-compliant amendment responses
5. **Document Export**: Create final amendment documents ready for USPTO filing

### Key Capabilities:
- **Office Action Parsing**: Extract rejections, cited prior art, and examiner reasoning
- **Rejection Analysis**: Evaluate rejection strength and identify response opportunities
- **Claim Amendment**: Propose specific claim amendments to overcome rejections
- **Argument Generation**: Draft legal arguments challenging weak or invalid rejections
- **Response Formatting**: Create professionally formatted USPTO responses

### Amendment Project Management:
- Track amendment projects from office action upload through response filing
- Manage deadlines and response strategies
- Generate response shells and complete amendment documents
- Export final responses in USPTO-ready formats

### Focus Areas:
- Office action analysis and strategic response development
- Claim amendment proposals that preserve patent scope
- Professional legal argument drafting with proper citations
- USPTO-compliant response formatting and structure

`;
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
