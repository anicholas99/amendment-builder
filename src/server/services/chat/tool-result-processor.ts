import { logger } from '@/server/logger';
import type {
  ToolExecutionResult,
  ConsistencyIssue,
  ClaimRevision,
  ClaimOperationResult,
  BatchRevisionResult,
} from '@/types/tools';
import type { ClaimData } from '@/types/claimTypes';

interface GetClaimsResult {
  message: string;
  claims: ClaimData[];
}

interface VisualizationResult {
  summary: {
    totalClaims: number;
    independentClaims: number;
    dependentClaims: number;
    maxDepth: number;
  };
  mermaidDiagram: string;
}

interface FigureResult {
  message: string;
  figures?: any[];
  element?: any;
}

/**
 * Processes tool execution results and formats them for chat responses
 * Extracted from ChatAgentService for better modularity
 */
export class ToolResultProcessor {
  /**
   * Process any tool result and return formatted response
   */
  static processResult(
    toolName: string,
    result: ToolExecutionResult,
    args?: Record<string, any>
  ): string {
    try {
      logger.debug('[ToolResultProcessor] Processing result', {
        toolName,
        success: result.success,
        hasData: !!result.data,
        dataType: result.data ? typeof result.data : 'undefined',
      });

      if (!result.success) {
        return `I tried to run the ${toolName} analysis but encountered an error: ${result.error}. Please try again or let me know if you need help differently.`;
      }

      // Route to specific processors based on tool name
      switch (toolName) {
        case 'validateInventionConsistency':
          return this.processConsistencyCheck(
            result.data as ConsistencyIssue[]
          );

        case 'checkPatentConsistency':
          return this.processPatentConsistencyCheck(result.data as any);

        case 'checkClaimEligibility101':
          return this.processClaimEligibility101(result.data as any);

        case 'batchCheckClaimEligibility101':
          return this.processBatchClaimEligibility101(result.data as any);

        case 'getClaims':
          return this.processGetClaims(result.data as GetClaimsResult);

        case 'addClaims':
        case 'editClaim':
        case 'deleteClaims':
        case 'reorderClaims':
        case 'autoRenumberClaims':
          return this.processClaimOperation(
            toolName,
            result.data as ClaimOperationResult
          );

        case 'mirrorClaims':
          return this.processMirrorClaims(
            result.data as ClaimOperationResult,
            args
          );

        case 'updatePatentClaims':
        case 'setPatentClaimsDirectly':
          return this.processPatentClaimsOperation(toolName, result.data as any);

        case 'proposeClaimRevision':
          return this.processClaimRevision(result.data as ClaimRevision);

        case 'batchProposeRevisions':
          return this.processBatchRevisions(result.data as BatchRevisionResult);

        case 'visualizeClaimDependencies':
          return this.processVisualization(result.data as VisualizationResult);

        case 'getFigureElements':
        case 'addFigureElement':
        case 'updateFigureElement':
        case 'removeFigureElement':
        case 'createFigureSlot':
          return this.processFigureOperation(
            toolName,
            result.data as FigureResult
          );

        case 'updateInventionDetails':
          return (result.data as any).message;

        case 'analyzeAndSuggestFigures':
          return this.processAnalyzeAndSuggestFigures(result.data);

        case 'enhancePatentSection':
          return this.processEnhancePatentSection(result.data as any);

        case 'batchEnhancePatentSections':
          return this.processBatchEnhancePatentSections(result.data as any);

        case 'runProjectDiagnostics':
          return this.processProjectDiagnostics(result.data as any[]);

        default:
          // Handle unknown tools or tools without specific processors
          if (
            result.data &&
            typeof result.data === 'object' &&
            'message' in result.data
          ) {
            return (result.data as any).message;
          }
          return `Tool ${toolName} executed successfully.`;
      }
    } catch (error) {
      logger.error('[ToolResultProcessor] Error processing result', {
        toolName,
        error,
        resultData: result.data,
      });
      return `I encountered an error processing the ${toolName} result. The operation may have completed, but I couldn't format the response properly.`;
    }
  }

  private static processPatentConsistencyCheck(data: any): string {
    if (!data || typeof data !== 'object') {
      return "I've completed the patent consistency check but couldn't retrieve the results. Please try again.";
    }

    const { issues = [], summary = '', overallScore = 0 } = data;

    let response = `## 🔍 Patent Application Consistency Check\n\n`;
    response += `**Overall Score:** ${overallScore}/100\n`;
    response += `**Summary:** ${summary}\n\n`;

    if (issues.length === 0) {
      response += `✅ **Excellent!** Your patent application has no consistency issues.\n\n`;
      return response;
    }

    response += `Found **${issues.length} issue${issues.length > 1 ? 's' : ''}** in your patent application:\n\n`;

    // Group issues by severity
    const errors = issues.filter((i: any) => i.severity === 'error');
    const warnings = issues.filter((i: any) => i.severity === 'warning');
    const info = issues.filter((i: any) => i.severity === 'info');

    if (errors.length > 0) {
      response += `### 🚨 Critical Issues (${errors.length})\n\n`;
      errors.forEach((issue: any) => {
        response += `**${issue.section}** - ${issue.type}\n`;
        response += `- ${issue.message}\n`;
        if (issue.suggestion) {
          response += `  💡 **Suggestion:** ${issue.suggestion}\n`;
        }
        response += `\n`;
      });
    }

    if (warnings.length > 0) {
      response += `### ⚠️ Warnings (${warnings.length})\n\n`;
      warnings.forEach((issue: any) => {
        response += `**${issue.section}** - ${issue.type}\n`;
        response += `- ${issue.message}\n`;
        if (issue.suggestion) {
          response += `  💡 **Suggestion:** ${issue.suggestion}\n`;
        }
        response += `\n`;
      });
    }

    if (info.length > 0) {
      response += `### ℹ️ Suggestions (${info.length})\n\n`;
      info.forEach((issue: any) => {
        response += `**${issue.section}** - ${issue.type}\n`;
        response += `- ${issue.message}\n`;
        if (issue.suggestion) {
          response += `  💡 **Suggestion:** ${issue.suggestion}\n`;
        }
        response += `\n`;
      });
    }

    response += `Would you like me to help you:\n`;
    response += `- Address specific issues\n`;
    response += `- Enhance particular sections\n`;
    response += `- Review your claims for consistency\n`;
    response += `- Generate missing sections`;

    return response;
  }

  private static processConsistencyCheck(
    issues: ConsistencyIssue[] | undefined
  ): string {
    // Handle undefined or invalid data
    if (!issues || !Array.isArray(issues)) {
      logger.warn('[ToolResultProcessor] Invalid consistency check data', {
        dataType: typeof issues,
      });
      return "I've completed the consistency check but couldn't retrieve the results. Please try again.";
    }

    if (issues.length === 0) {
      return "✅ **Great news!** I've checked your invention for consistency and found no issues. Your claims are properly structured and consistent.";
    }

    let response = `I've analyzed your invention for consistency and found ${issues.length} issue${issues.length > 1 ? 's' : ''}:\n\n`;

    // Check for mirror claim patterns first
    const mirrorClaimIssues = issues.filter(i =>
      i.message.includes('mirror claim pattern')
    );
    if (mirrorClaimIssues.length > 0) {
      response += '### 🔄 Mirror Claim Analysis\n\n';
      mirrorClaimIssues.forEach(issue => {
        response += `- ${issue.message}\n`;
      });
      response += '\n';
    }

    const errors = issues.filter(
      i => i.severity === 'error' && !i.message.includes('mirror')
    );
    const warnings = issues.filter(
      i =>
        i.severity === 'warning' && !i.message.includes('mirror claim pattern')
    );
    const mirrorErrors = issues.filter(
      i => i.severity === 'error' && i.message.includes('mirror')
    );

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

  private static processGetClaims(result: GetClaimsResult): string {
    if (result.claims.length === 0) {
      return `## 📋 Current Claims\n\n${result.message}\n\nWould you like me to help you add some claims?`;
    }

    let response = `## 📋 Current Claims\n\n${result.message}\n\n`;
    let hasIncompleteClaims = false;

    result.claims.forEach(claim => {
      response += `**Claim ${claim.number}**\n`;

      // Check if claim is incomplete
      const claimText = claim.text.replace(/\n\s*/g, ' ').trim();
      if (
        claimText.endsWith('wherein') ||
        claimText.endsWith('comprising') ||
        claimText.endsWith('wherein:') ||
        claimText.endsWith('comprising:') ||
        claimText.length < 20
      ) {
        response += `⚠️ **INCOMPLETE CLAIM**: ${claimText}\n\n`;
        hasIncompleteClaims = true;
      } else {
        response += `${claimText}\n\n`;
      }
    });

    if (hasIncompleteClaims) {
      response += `\n⚠️ **Warning:** One or more claims appear to be incomplete.\n\n`;
    }

    response += `\nWhat would you like to do with these claims? I can:\n`;
    response += `- Edit any claim text\n`;
    response += `- Add new claims\n`;
    response += `- Delete claims\n`;
    response += `- Reorder claims\n`;
    response += `- Mirror claims to a different type (system, method, etc.)\n`;
    response += `- Proofread and suggest improvements\n`;
    response += `- Check for errors and consistency issues`;
    return response;
  }

  private static processClaimOperation(
    toolName: string,
    result: ClaimOperationResult
  ): string {
    logger.info('[ToolResultProcessor] Processing claim operation', {
      toolName,
      hasResult: !!result,
      resultMessage: result?.message,
      hasClaim: !!result?.claim,
      hasClaims: !!result?.claims,
      claimsCount: result?.claims?.length || 0,
    });

    let response = `## ✅ Claim Operation Completed\n\n`;
    response += `${result.message}\n\n`;

    if (result.claim) {
      const claimText = result.claim.text.replace(/\n\s*/g, ' ').trim();
      response += `**Updated claim ${result.claim.number}:**\n${claimText}\n\n`;
    }

    // For addClaims, include the claim numbers that were added
    if (toolName === 'addClaims' && result.claims && result.claims.length > 0) {
      const claimNumbers = result.claims.map((c: any) => c.number).join(',');
      response += `<!-- CLAIMS_ADDED:${claimNumbers} -->\n`;
      logger.info('[ToolResultProcessor] Added claims marker', {
        toolName,
        claimNumbers,
        marker: `<!-- CLAIMS_ADDED:${claimNumbers} -->`,
      });
    }

    // Generic claims update marker
    response += `<!-- CLAIMS_UPDATED -->\n`;

    logger.info('[ToolResultProcessor] Completed claim operation response', {
      toolName,
      hasUpdateMarker: response.includes('<!-- CLAIMS_UPDATED -->'),
      hasAddedMarker: response.includes('<!-- CLAIMS_ADDED:'),
      responseLength: response.length,
      responsePreview: response.substring(0, 200) + '...',
    });

    return response;
  }

  private static processMirrorClaims(
    result: ClaimOperationResult,
    args?: Record<string, any>
  ): string {
    let response = `## ✨ Claims Mirrored Successfully\n\n`;
    response += `${result.message}\n\n`;
    response += `The new ${args?.targetType || ''} claims have been added to your claim set. `;
    response += `They maintain the same structure and dependencies as the original claims but are written in ${args?.targetType || ''} format.\n\n`;
    response += `Would you like me to:\n`;
    response += `- Show you all claims (including the new ones)\n`;
    response += `- Make further edits to any claims\n`;
    response += `- Check the consistency of your expanded claim set`;
    response += '\n\n<!-- CLAIMS_UPDATED -->';
    return response;
  }

  private static processClaimRevision(revision: ClaimRevision): string {
    let response = `## 🔍 Claim Revision Proposal\n\n`;
    response += `I've analyzed claim ${revision.claimNumber} and generated a revision based on your instruction.\n\n`;

    response += `**Confidence:** ${Math.round(revision.confidence * 100)}%\n`;
    response += `**Reasoning:** ${revision.reasoning}\n\n`;

    response += `### Original Claim ${revision.claimNumber}:\n`;
    response += `${revision.original.replace(/\n\s*/g, ' ').trim()}\n\n`;

    response += `### Proposed Revision:\n`;
    response += `${revision.proposed.replace(/\n\s*/g, ' ').trim()}\n\n`;

    response += `### Changes:\n`;
    response += `<!-- REVISION_DIFF -->\n`;
    response += JSON.stringify(
      {
        claimId: revision.claimId,
        claimNumber: revision.claimNumber,
        changes: revision.changes,
        proposedText: revision.proposed,
      },
      null,
      0
    ); // Ensure single-line JSON
    response += `\n<!-- END_REVISION_DIFF -->\n\n`;

    // Debug logging
    console.log(
      '🔍 [DEBUG] processClaimRevision output contains REVISION_DIFF:',
      response.includes('REVISION_DIFF')
    );
    console.log('🔍 [DEBUG] Response length:', response.length);

    response += `Would you like to:\n`;
    response += `- ✅ Apply this revision\n`;
    response += `- ❌ Reject and keep the original\n`;
    response += `- 🔄 Try a different instruction\n\n`;

    response += `To apply this revision, I can update the claim for you. Just let me know!`;

    return response;
  }

  private static processBatchRevisions(
    batchResult: BatchRevisionResult
  ): string {
    let response = `## 🔍 Proofreading Results\n\n`;
    response += `I've analyzed ${batchResult.summary.total} claims and found ${batchResult.summary.successful} that could be improved.\n\n`;

    if (batchResult.summary.failed > 0) {
      response += `⚠️ **Note:** ${batchResult.summary.failed} claim(s) could not be processed.\n\n`;
    }

    // Include all revision diffs in the response
    response += `### Suggested Improvements:\n\n`;
    batchResult.revisions.forEach(revision => {
      response += `#### Claim ${revision.claimNumber}`;

      // Check if claim has significant issues
      const hasGrammarIssues = revision.reasoning
        .toLowerCase()
        .includes('grammar');
      const hasClarity = revision.reasoning.toLowerCase().includes('clarity');
      const isIncomplete =
        revision.original.trim().endsWith('wherein') ||
        revision.original.trim().endsWith('comprising') ||
        revision.original.trim().length < 20;

      if (isIncomplete) {
        response += ` ⚠️ **INCOMPLETE CLAIM**`;
      } else if (hasGrammarIssues) {
        response += ` - Grammar issues found`;
      } else if (hasClarity) {
        response += ` - Clarity improvements suggested`;
      }

      response += `\n`;
      response += `**Confidence:** ${Math.round(revision.confidence * 100)}%\n`;
      response += `**Issues Found:** ${revision.reasoning}\n\n`;

      // Format original text with normalized spacing
      response += `**Original:**\n`;
      response += `${revision.original.replace(/\n\s*/g, ' ').trim()}\n\n`;

      // Format proposed text with normalized spacing
      response += `**Suggested Revision:**\n`;
      response += `${revision.proposed.replace(/\n\s*/g, ' ').trim()}\n\n`;

      response += `<!-- REVISION_DIFF -->\n`;
      response += JSON.stringify({
        claimId: revision.claimId,
        claimNumber: revision.claimNumber,
        changes: revision.changes,
        proposedText: revision.proposed,
      });
      response += `\n<!-- END_REVISION_DIFF -->\n\n`;
    });

    if (batchResult.revisions.length === 0) {
      response += `✅ **All claims look good!** No significant grammar, clarity, or formatting issues were found.\n\n`;
    }

    response += `### Actions Available:\n`;
    response += `- Click the **Apply** button on any claim to accept the suggested revision\n`;
    response += `- Click **Apply All** to accept all suggestions at once\n`;
    response += `- Click **Reject** to keep the original text\n\n`;
    response += `You can also ask me to make specific changes to any claim.`;

    return response;
  }

  private static processVisualization(result: VisualizationResult): string {
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

  private static processFigureOperation(
    toolName: string,
    result: FigureResult
  ): string {
    switch (toolName) {
      case 'getFigureElements': {
        const figures = result.figures || [];
        if (figures.length === 0) {
          return `## 🖼️ Figure Reference Numerals\n\nNo figures found in your project. Upload some figures first to add reference numerals.`;
        }

        let response = `## 🖼️ Figure Reference Numerals\n\n${result.message}\n\n`;

        figures.forEach((figure: any) => {
          response += `### ${figure.figureKey}\n`;
          if (figure.title) response += `**Title:** ${figure.title}\n`;
          if (figure.description)
            response += `**Description:** ${figure.description}\n`;
          response += `**Status:** ${figure.status === 'ASSIGNED' ? '✅ Has image' : '⏳ Pending image'}\n\n`;

          if (figure.elements.length > 0) {
            response += `**Reference Numerals:**\n`;
            figure.elements.forEach((el: any) => {
              response += `- **${el.number}** - ${el.description}\n`;
            });
          } else {
            response += `*No reference numerals defined yet*\n`;
          }
          response += `\n`;
        });

        response += `Would you like me to:\n`;
        response += `- Add a reference numeral to a figure\n`;
        response += `- Update existing reference numeral descriptions\n`;
        response += `- Remove reference numerals\n`;

        return response;
      }

      case 'addFigureElement': {
        let response = `## ✅ Reference Numeral Added\n\n`;
        response += `${result.message}\n\n`;
        response += `**Figure:** ${result.element!.figureKey}\n`;
        response += `**Number:** ${result.element!.number}\n`;
        response += `**Description:** ${result.element!.description}\n\n`;
        response += `Would you like to:\n`;
        response += `- Add more reference numerals\n`;
        response += `- View all reference numerals for this figure\n`;
        response += `- Update the description of this reference numeral`;
        response += '\n\n<!-- FIGURES_UPDATED -->';
        return response;
      }

      case 'updateFigureElement': {
        let response = `## ✅ Reference Numeral Updated\n\n`;
        response += `${result.message}\n\n`;
        response += `**Figure:** ${result.element!.figureKey}\n`;
        response += `**Number:** ${result.element!.number}\n`;
        response += `**New Description:** ${result.element!.description}\n\n`;
        response += `Would you like to:\n`;
        response += `- Update more reference numerals\n`;
        response += `- View all reference numerals\n`;
        response += `- Add new reference numerals`;
        response += '\n\n<!-- FIGURES_UPDATED -->';
        return response;
      }

      case 'removeFigureElement': {
        let response = `## ✅ Reference Numeral Removed\n\n`;
        response += `${result.message}\n\n`;
        response += `Would you like to:\n`;
        response += `- Remove more reference numerals\n`;
        response += `- View remaining reference numerals\n`;
        response += `- Add new reference numerals`;
        response += '\n\n<!-- FIGURES_UPDATED -->';
        return response;
      }

      case 'createFigureSlot': {
        const figure = (result as any).figure;
        if (figure) {
          return `## 🖼️ Figure Slot Created\n\n✅ Created **${figure.figureKey}** - ${figure.title || 'Untitled'}\n\n${figure.description || 'No description provided'}\n\nYou can now add reference numerals to this figure or upload an image.\n\n<!-- FIGURES_UPDATED -->`;
        }
        return result.message + '\n\n<!-- FIGURES_UPDATED -->';
      }

      default:
        return result.message;
    }
  }

  private static processEnhancePatentSection(data: any): string {
    let response =
      data.message || 'Patent section has been updated successfully.';

    // Add sync trigger marker if present - include the enhanced content for direct application
    if (data.syncTrigger && data.updatedSection) {
      const enhancedSyncTrigger = {
        ...data.syncTrigger,
        updatedContent: data.updatedSection, // Include the enhanced content
      };
      
      response += `\n\n<!-- PATENT_SECTION_UPDATED:${JSON.stringify(enhancedSyncTrigger)} -->`;
      logger.info('[ToolResultProcessor] Added patent section update marker with content', {
        syncTrigger: enhancedSyncTrigger,
        contentLength: data.updatedSection.length,
      });
    } else if (data.syncTrigger) {
      // Fallback without content
      response += `\n\n<!-- PATENT_SECTION_UPDATED:${JSON.stringify(data.syncTrigger)} -->`;
      logger.info('[ToolResultProcessor] Added patent section update marker', {
        syncTrigger: data.syncTrigger,
      });
    }

    return response;
  }

  private static processPatentClaimsOperation(
    toolName: string,
    result: any
  ): string {
    logger.info('[ToolResultProcessor] Processing patent claims operation', {
      toolName,
      hasResult: !!result,
      hasMessage: !!result?.message,
      claimCount: result?.claimCount,
    });

    let response = `## ✅ Patent Claims Updated\n\n`;
    response += `${result.message || 'Patent claims section updated successfully'}\n\n`;

    // Add claims update marker for UI synchronization
    response += `<!-- CLAIMS_UPDATED -->\n`;

    logger.info('[ToolResultProcessor] Completed patent claims operation response', {
      toolName,
      hasUpdateMarker: response.includes('<!-- CLAIMS_UPDATED -->'),
      responseLength: response.length,
    });

    return response;
  }

  private static processBatchEnhancePatentSections(data: any): string {
    let response = `## 📝 Batch Patent Section Enhancement\n\n`;

    if (data.summary.successful === data.summary.total) {
      response += `✅ Successfully enhanced ${data.summary.total} patent section${data.summary.total > 1 ? 's' : ''}!\n\n`;
    } else {
      response += `📊 **Results:** ${data.summary.successful} of ${data.summary.total} sections enhanced successfully\n\n`;
      if (data.summary.failed > 0) {
        response += `⚠️ **Note:** ${data.summary.failed} section${data.summary.failed > 1 ? 's' : ''} could not be enhanced.\n\n`;
      }
    }

    response += `### Enhancement Summary:\n\n`;

    // Include sync trigger data for each successful enhancement
    const syncTriggers: any[] = [];

    data.enhancements.forEach((enhancement: any) => {
      const icon = enhancement.success ? '✅' : '❌';
      response += `${icon} **${enhancement.sectionName}**: ${enhancement.message}\n`;

      if (enhancement.success && enhancement.syncTrigger) {
        syncTriggers.push(enhancement.syncTrigger);
        // Also add individual section update marker for immediate UI feedback
        response += `<!-- PATENT_SECTION_UPDATED:${JSON.stringify(enhancement.syncTrigger)} -->\n`;
      }
    });

    // Add a final marker with all sections for batch tracking
    response += `\n<!-- PATENT_BATCH_UPDATED:{"sections":${JSON.stringify(data.enhancements.filter((e: any) => e.success).map((e: any) => e.sectionName))}, "syncTriggers":${JSON.stringify(syncTriggers)}} -->`;

    return response;
  }

  private static processAnalyzeAndSuggestFigures(data: any): string {
    if (!data) return '❌ No analysis data available';

    const { figuresCreated, elementsAdded, analysis, message } = data;

    let response = `## 🎯 Figure Analysis Complete\n\n`;
    response += `${message}\n\n`;

    if (analysis && analysis.suggestedFigures) {
      response += `### Figures Created:\n\n`;
      analysis.suggestedFigures.forEach((fig: any) => {
        response += `**${fig.figureKey}** - ${fig.title}\n`;
        response += `*${fig.description}*\n`;
        if (fig.elements && fig.elements.length > 0) {
          response += `Reference numerals:\n`;
          fig.elements.forEach((el: any) => {
            response += `- **${el.number}** - ${el.description}\n`;
          });
        }
        response += `\n`;
      });
    }

    if (
      analysis &&
      analysis.consistencyNotes &&
      analysis.consistencyNotes.length > 0
    ) {
      response += `### Consistency Notes:\n\n`;
      analysis.consistencyNotes.forEach((note: string) => {
        response += `- ${note}\n`;
      });
    }

    response += `\n✨ Your invention data has been automatically updated to reference these figures and numerals.`;

    // Add marker for figure updates
    response += '\n\n<!-- FIGURES_UPDATED -->';

    return response;
  }

  private static processProjectDiagnostics(data: any[]): string {
    let response = `## 🔍 Project Diagnostics\n\n`;

    if (data.length === 0) {
      response += `✅ All systems normal. No issues detected in your project setup.\n`;
    } else {
      response += `Found ${data.length} diagnostic item${data.length > 1 ? 's' : ''}:\n\n`;

      data.forEach(item => {
        const icon =
          item.severity === 'error'
            ? '❌'
            : item.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';
        response += `${icon} **${item.type}**: ${item.message}\n`;
        if (item.suggestion) {
          response += `   💡 Suggestion: ${item.suggestion}\n`;
        }
        response += `\n`;
      });
    }

    return response;
  }

  private static processClaimEligibility101(data: any): string {
    if (!data) return '❌ No eligibility data available';

    const { eligible, verdict, issue, recommendation, confidence, analysis } = data;

    let response = `## ⚖️ §101 Eligibility Analysis\n\n`;
    
    // Verdict with emoji
    const verdictEmoji = eligible ? '✅' : verdict.includes('Risk') ? '⚠️' : '❌';
    response += `**Verdict:** ${verdictEmoji} ${verdict}\n`;
    response += `**Confidence:** ${confidence}%\n\n`;

    // Analysis details
    response += `### Analysis:\n`;
    if (analysis.isAbstractIdea) {
      response += `- **Abstract Idea Detected:** Yes\n`;
      if (analysis.abstractIdeaCategory) {
        const categoryName = analysis.abstractIdeaCategory
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase());
        response += `- **Category:** ${categoryName}\n`;
      }
      response += `- **Has Significantly More:** ${analysis.hasSignificantlyMore ? 'Yes' : 'No'}\n`;
    } else {
      response += `- **Abstract Idea Detected:** No\n`;
    }

    if (analysis.technicalImprovement) {
      response += `- **Technical Improvement:** ${analysis.technicalImprovement}\n`;
    }
    if (analysis.practicalApplication) {
      response += `- **Practical Application:** ${analysis.practicalApplication}\n`;
    }

    // Issue and recommendation
    if (issue) {
      response += `\n### Issue:\n${issue}\n`;
    }
    if (recommendation) {
      response += `\n### Recommendation:\n💡 ${recommendation}\n`;
    }

    return response;
  }

  private static processBatchClaimEligibility101(data: any[]): string {
    if (!data || data.length === 0) return '❌ No claims found to analyze';

    let response = `## ⚖️ Batch §101 Eligibility Analysis\n\n`;
    
    // Summary statistics
    const eligible = data.filter(d => d.result.eligible).length;
    const atRisk = data.filter(d => d.result.verdict.includes('Risk')).length;
    const ineligible = data.filter(d => d.result.verdict === '§101 Ineligible').length;
    
    response += `### Summary:\n`;
    response += `- ✅ **Eligible:** ${eligible} claim${eligible !== 1 ? 's' : ''}\n`;
    response += `- ⚠️ **At Risk:** ${atRisk} claim${atRisk !== 1 ? 's' : ''}\n`;
    response += `- ❌ **Ineligible:** ${ineligible} claim${ineligible !== 1 ? 's' : ''}\n\n`;

    // Detailed analysis for each claim
    response += `### Individual Claim Analysis:\n\n`;
    
    data.forEach(({ claimNumber, result }) => {
      const emoji = result.eligible ? '✅' : result.verdict.includes('Risk') ? '⚠️' : '❌';
      response += `**Claim ${claimNumber}:** ${emoji} ${result.verdict} (${result.confidence}% confidence)\n`;
      
      if (result.issue) {
        response += `- **Issue:** ${result.issue}\n`;
      }
      if (result.recommendation) {
        response += `- **Fix:** ${result.recommendation}\n`;
      }
      response += `\n`;
    });

    // Overall recommendations
    if (atRisk > 0 || ineligible > 0) {
      response += `### 💡 General Recommendations:\n`;
      response += `1. Add specific technical implementation details\n`;
      response += `2. Emphasize technical improvements to computer functionality\n`;
      response += `3. Include concrete, real-world applications\n`;
      response += `4. Avoid purely abstract business methods or mental processes\n`;
    }

    return response;
  }
}
