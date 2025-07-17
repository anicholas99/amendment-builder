import { logger } from '@/server/logger';
import { safeJsonParse } from '@/utils/jsonUtils';
import environment from '@/config/environment';

// Define ValidationResult interface locally to match what's in suggestion-validation service
interface ValidationResult {
  suggestionText: string;
  isDisclosed: boolean;
  disclosureEvidence: string[];
  validationScore: number;
  recommendation: 'keep' | 'modify' | 'remove';
}

export function constructDeepAnalysisPrompt(
  rawDataJsonString: string,
  claimElements: string[],
  claimText: string,
  referenceNumber: string,
  priorArtAbstract?: string | null,
  referenceTitle?: string | null,
  referenceApplicant?: string | null,
  referenceAssignee?: string | null,
  referencePublicationDate?: string | null,
  maxCitations?: number,
  isValidationPhase?: boolean,
  validationResults?: Record<string, any>
): string {
  let formattedRawData = rawDataJsonString;
  try {
    const parsedJson = safeJsonParse<unknown>(rawDataJsonString);
    if (parsedJson !== undefined) {
      formattedRawData = JSON.stringify(parsedJson, null, 2);
    }
  } catch (e) {
    logger.warn(
      '[DeepAnalysisPrompt] Raw data for prompt construction was not valid JSON. Using raw string.'
    );
  }

  const elementListString = claimElements.map(el => `- "${el}"`).join('\\n');

  if (isValidationPhase && validationResults) {
    // Phase 2: First construct the original prompt, then add validation results
    const originalPrompt = constructDeepAnalysisPrompt(
      rawDataJsonString, // rawDataJsonString comes first
      claimElements,
      claimText,
      referenceNumber,
      priorArtAbstract, // priorArtAbstract parameter
      referenceTitle,
      referenceApplicant,
      referenceAssignee,
      referencePublicationDate, // Add missing parameter
      maxCitations, // Add missing parameter
      false, // isValidationPhase = false to get the base prompt
      undefined // no validation results for base prompt
    );
    
    // Convert validationResults to array if it's an object
    const validationResultsArray = Array.isArray(validationResults) 
      ? validationResults 
      : Object.values(validationResults);
    
    return constructValidationAwarePrompt(
      originalPrompt,
      validationResultsArray as ValidationResult[]
    );
  }

  // Phase 1: Initial analysis with potential suggestions
  let promptContent =
    'You are an experienced USPTO patent examiner evaluating prior art. Provide thorough analysis while being clear and focused.\\n\\n';
  promptContent +=
    'When referring to patent or publication numbers in your output, always write them as a single string of letters and numbers with no dashes or spaces (e.g., US20180053140A1).\\n\\n';
  promptContent += `PRIOR ART REFERENCE: ${referenceNumber}${referenceTitle ? ` - ${referenceTitle}` : ''}\\n`;
  if (referenceApplicant || referenceAssignee) {
    promptContent += `APPLICANT/ASSIGNEE: ${referenceApplicant || referenceAssignee}\\n`;
  }
  if (referencePublicationDate) {
    promptContent += `PUBLICATION DATE: ${referencePublicationDate}\\n`;
  }
  promptContent += `ABSTRACT: "${priorArtAbstract || 'Abstract not provided.'}"\\n\\n`;
  promptContent += `FULL CLAIM 1 TEXT (as written by the user):\\n"""\\n${claimText}\\n"""\\n\\n`;
  promptContent += `CLAIM ELEMENTS FOR EXAMINATION UNDER 35 U.S.C. 102/103:\\n${elementListString}\\n\\n`;
  promptContent += 'PRIOR ART DATA:\\n';
  const citationLimit =
    maxCitations || environment.openai.deepAnalysisMaxCitationsPerElement;
  promptContent += `Note: For efficiency, only the top ${citationLimit} most relevant citations per claim element are shown below (ranked by relevance score).\\n`;
  promptContent += '```json\\n';
  promptContent += formattedRawData + '\\n';
  promptContent += '```\\n\\n';

  promptContent +=
    'TASK: Analyze each claim element to determine: (1) if it is anticipated under 35 U.S.C. 102, (2) rendered obvious under 35 U.S.C. 103, or (3) patentable over this reference. Provide Office Action-style rejection rationales.\\n\\n';

  promptContent +=
    'CRITICAL REQUIREMENT: For each claim element in your analysis, identify the SPECIFIC citations from the provided data that support your rejection analysis. Include the most relevant 2-3 citations with their full text.\\n\\n';

  promptContent +=
    'After the element-by-element analysis, provide a holistic examiner-style analysis of Claim 1 as a whole. In the "holisticAnalysis" field, do the following:\\n' +
    '- Explain, in 2-4 sentences, how the reference reads on Claim 1 as a whole (not just its individual elements).\\n' +
    '- Clearly state whether Claim 1 is patentable over this reference as written, or if it is anticipated or obvious.\\n' +
    '- Provide your overall assessment from an examiner perspective.\\n\\n';

  promptContent +=
    'CRITICAL INSTRUCTIONS FOR STRATEGIC CLAIM AMENDMENTS:\\n' +
    'If ANY element has a rejection (102 or 103), you MUST think like a seasoned patent attorney and provide STRATEGIC amendment options.\\n\\n' +
    
    '**ATTORNEY STRATEGIC ANALYSIS REQUIRED:**\\n' +
    '1. **Gap Analysis**: What exactly is disclosed vs. merely similar in the prior art?\\n' +
    '2. **Scope Preservation**: What is the minimum needed to distinguish while maintaining maximum scope?\\n' +
    '3. **Prosecution Strategy**: What are the 2-3 strongest angles to overcome this rejection?\\n' +
    '4. **Commercial Value**: Which approach maintains the broadest commercially valuable claim?\\n\\n' +
    
    '**STRATEGIC THINKING PROCESS:**\\n' +
    'Before generating amendments, analyze like an experienced attorney:\\n' +
    '- Is this reference really anticipating or just describing something similar?\\n' +
    '- What specific technical gaps exist in the prior art disclosure?\\n' +
    '- What would be the minimum addition to clearly distinguish?\\n' +
    '- Which approach avoids over-narrowing while ensuring allowability?\\n' +
    '- What would a seasoned prosecutor choose as their best 2-3 options?\\n\\n' +
    
    '**AMENDMENT GENERATION RULES:**\\n' +
    'Generate ONLY 3-5 high-quality strategic amendments that a seasoned attorney would actually consider:\\n' +
    '- Each must address a clear gap identified in the prior art\\n' +
    '- Each must maintain reasonable claim scope for commercial value\\n' +
    '- Each must be technically sound and practically implementable\\n' +
    '- Avoid over-narrowing or "kitchen sink" approaches\\n' +
    '- Focus on the strongest distinguishing features that matter\\n\\n' +
    
    '**STRATEGIC AMENDMENT CATEGORIES (choose the best applicable ones):**\\n' +
    '1. **Structural Distinction**: Add specific structural features not disclosed in prior art\\n' +
    '2. **Functional Enhancement**: Add functional capabilities that go beyond prior art\\n' +
    '3. **Integration Approach**: Specify unique ways components work together\\n' +
    '4. **Operational Context**: Add context about how/when the invention operates\\n' +
    '5. **Technical Implementation**: Add specific technical approaches not taught\\n\\n' +
    
    'For EACH strategic amendment provide:\\n' +
    '- suggestionText: Specific, technically sound limitation (attorney-quality language)\\n' +
    '- reasoning: Clear strategic explanation of why this overcomes the prior art\\n' +
    '- scopeImpact: Assessment of how this affects claim breadth and commercial value\\n' +
    '- prosecutionStrength: How strong this approach is for USPTO prosecution\\n' +
    '- priority: high/medium/low based on strategic effectiveness\\n\\n' +
    
    '**QUALITY REQUIREMENTS:**\\n' +
    '- Each suggestion must target a specific gap in the prior art coverage\\n' +
    '- Avoid generic language - be specific and technical\\n' +
    '- Consider dependent claim potential for features that might over-narrow\\n' +
    '- Think about examiner response and prosecution feasibility\\n' +
    '- Ensure each suggestion is genuinely strategic, not just different\\n\\n';

  promptContent +=
    'The revised claim MUST be written as a proper patent claim following these rules:\\n' +
    '1. NEVER mention prior art references in the claim (no "not disclosed in...", no patent numbers)\\n' +
    '2. NEVER use explanatory language in the claim (no "to overcome...", no "to distinguish from...")\\n' +
    '3. Use proper claim language with technical limitations only\\n' +
    '4. Add specific technical features that distinguish over the prior art\\n' +
    '5. Write it EXACTLY as a patent attorney would write it for filing with the USPTO\\n' +
    '6. The claim should stand alone as a complete technical description\\n' +
    '7. NEVER include claim numbering (no "1.", "2.", etc.) - just provide the claim text\\n\\n' +
    'The revisedClaim field must contain a clean, complete version of Claim 1 — but may omit narrower features if they would better belong in dependent claims. If needed, you may include additional dependent claim text as an inline comment or strategic note.\\n\\n' +
    'Example of WRONG revised claim: "...using a technique not disclosed in US123..."\\n' +
    'Example of CORRECT revised claim: "...using a neural network comprising at least three hidden layers trained on multimodal sensor data..."\\n\\n' +
    'MORE EXAMPLES:\\n' +
    'WRONG: "wherein the algorithm (which is different from the one in US789) processes..."\\n' +
    'CORRECT: "wherein the algorithm comprises a Kalman filter with adaptive covariance estimation that processes..."\\n\\n' +
    'WRONG: "using a specific data fusion technique not disclosed in the prior art"\\n' +
    'CORRECT: "using a weighted sensor fusion algorithm that applies temporal correlation analysis across the weight sensors, RFID detectors, and gas sensors"\\n\\n' +
    'The revised claim should add SPECIFIC technical limitations that make it patentable, not vague references to being different.\\n\\n';

  promptContent +=
    'IMPORTANT REVISION RULES:\\n' +
    '- If overallRejection is "102 Anticipation" or "103 Obviousness", you MUST provide a different revisedClaim that addresses the rejection\\n' +
    '- Only if overallRejection is "Not Rejected" should revisedClaim be identical to originalClaim\\n' +
    '- The revisedClaim should incorporate specific technical features that overcome the identified prior art\\n\\n';

  promptContent +=
    'Provide a revised version of Claim 1 based on your analysis. If there are ANY rejections (102 or 103), the revisedClaim MUST be different from originalClaim and address those rejections. Only if there are NO rejections should revisedClaim be identical to originalClaim. Output both as "originalClaim" and "revisedClaim" in your JSON.\\n\\n';

  promptContent += 'REQUIRED OUTPUT FORMAT:\\n';
  promptContent += 'Return ONLY a JSON object with this exact structure:\\n';
  promptContent += '{\\n';
  promptContent += '  "elementAnalysis": {\\n';
  promptContent += '    "[exact claim element text]": {\\n';
  promptContent +=
    '      "analysis": "2-3 sentences analyzing how this prior art reads on this element",\\n';
  promptContent += '      "relevanceLevel": "high|medium|low",\\n';
  promptContent += '      "relevanceScore": 0.0-1.0,\\n';
  promptContent +=
    '      "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3"],\\n';
  promptContent +=
    '      "rejectionType": "102 Anticipation" | "103 Obviousness" | "Not Rejected",\\n';
  promptContent += '      "primaryCitations": [\\n';
  promptContent += '        {\\n';
  promptContent +=
    '          "location": "Col. 3, Lines 15-20" or "Paragraph 55",\\n';
  promptContent +=
    '          "citationText": "The relevant text from the prior art",\\n';
  promptContent +=
    '          "reasoning": "Explanation of why this citation supports the rejection"\\n';
  promptContent += '        }\\n';
  promptContent += '      ],\\n';
  promptContent +=
    '      "rejectionRationale": "Office Action-style explanation for this element"\\n';
  promptContent += '    }\\n';
  promptContent += '  },\\n';
  promptContent += '  "overallAssessment": {\\n';
  promptContent += '    "summary": "2-3 sentences overall summary",\\n';
  promptContent +=
    '    "patentabilityScore": 0.0-1.0 (where 0.0 = not patentable, 1.0 = fully patentable),\\n';
  promptContent +=
    '    "keyConcerns": ["Primary concern", "Secondary concern"],\\n';
  promptContent +=
    '    "overallRejection": "102 Anticipation" | "103 Obviousness" | "Not Rejected",\\n';
  promptContent +=
    '    "rejectionSummary": "Office Action-style summary for the entire claim",\\n';
  promptContent +=
    '    "strategicRecommendations": ["Primary recommendation", "Secondary recommendation"]\\n';
  promptContent += '  },\\n';
  promptContent +=
    '  "holisticAnalysis": "Examiner-style holistic summary of the reference and its impact on the claim",\\n';
  promptContent +=
    '  "amendmentExplanation": "If amendments needed, explain why and how they overcome the prior art",\\n';
  promptContent += '  "potentialAmendments": [\\n';
  promptContent += '    {\\n';
  promptContent += '      "suggestionText": "Specific technical limitation text (attorney-quality language)",\\n';
  promptContent += '      "reasoning": "Strategic explanation of why this overcomes the prior art",\\n';
  promptContent += '      "scopeImpact": "Assessment of how this affects claim breadth and commercial value",\\n';
  promptContent += '      "prosecutionStrength": "How strong this approach is for USPTO prosecution",\\n';
  promptContent += '      "priority": "high|medium|low"\\n';
  promptContent += '    }\\n';
  promptContent += '  ],\\n';
  promptContent +=
    '  "originalClaim": "The original Claim 1 text as provided.",\\n';
  promptContent +=
    '  "revisedClaim": "PLACEHOLDER - Final revision will be generated after validation"\\n';
  promptContent += '}\\n\\n';

  promptContent +=
    'IMPORTANT: Your response MUST be a single valid JSON object exactly matching the format above. Do not include any text outside the JSON object. Use only ONE relevance score per element (not per citation). Focus on the 2-3 most impactful citations that directly support your rejection analysis.\n\n';

  promptContent +=
    'CRITICAL: Keep your analysis CONCISE. Each "analysis" field should be 2-3 sentences maximum. Each "reasoning" should be 1-2 sentences. Focus on the most important findings only to ensure the response fits within token limits.';

  return promptContent;
}

/**
 * Construct validation-aware prompt for phase 2
 */
function constructValidationAwarePrompt(
  originalPrompt: string,
  validationResults: ValidationResult[]
): string {
  let validationPrompt = originalPrompt;
  
  // Add validation context
  validationPrompt += '\\n\\n**VALIDATION PHASE INSTRUCTIONS:**\\n';
  validationPrompt += 'You are now in Phase 2 of a two-phase strategic analysis. In Phase 1, potential amendments were identified and validated against the prior art.\\n\\n';
  
  validationPrompt += 'VALIDATION RESULTS:\\n';
  validationResults.forEach((result, index) => {
    validationPrompt += `${index + 1}. SUGGESTION: "${result.suggestionText}"\\n`;
    validationPrompt += `   VALIDATION: ${result.isDisclosed ? 'DISCLOSED in prior art' : 'NOT DISCLOSED - NOVEL'}\\n`;
    validationPrompt += `   RECOMMENDATION: ${result.recommendation.toUpperCase()}\\n`;
    if (result.disclosureEvidence && result.disclosureEvidence.length > 0) {
      validationPrompt += `   EVIDENCE: ${result.disclosureEvidence.join('; ')}\\n`;
    }
    validationPrompt += '\\n';
  });
  
  // Filter to only kept suggestions
  const keptSuggestions = validationResults.filter(r => r.recommendation === 'keep');
  
  validationPrompt += `\\n**VALIDATED SUGGESTIONS (${keptSuggestions.length} suggestions passed validation):**\\n`;
  keptSuggestions.forEach((result, index) => {
    validationPrompt += `${index + 1}. "${result.suggestionText}" - VALIDATED AS NOVEL\\n`;
  });
  
  validationPrompt += '\\n**PHASE 2 TASK:**\\n';
  validationPrompt += 'Based on the validation results above, provide a final strategic analysis that:\\n';
  validationPrompt += '1. Incorporates ONLY the validated (novel) suggestions\\n';
  validationPrompt += '2. Combines the best validated suggestions into one coherent amendment strategy\\n';
  validationPrompt += '3. Provides a prosecutable revised claim incorporating the strongest validated elements\\n';
  validationPrompt += '4. Explains the strategic rationale for the final combined approach\\n\\n';
  
  validationPrompt += 'Include in your JSON response:\\n';
  validationPrompt += '- validationPerformed: true\\n';
  validationPrompt += '- validationResults: (the validation data provided above)\\n';
  validationPrompt += '- validatedAmendments: (array of the validated suggestion texts)\\n';
  validationPrompt += '- finalRevisedClaim: (claim with the best validated amendments incorporated)\\n';
  validationPrompt += '- validationSummary: (summary of the validation process and results)\\n\\n';
  
  return validationPrompt;
}
