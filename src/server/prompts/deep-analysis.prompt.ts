import { logger } from '@/lib/monitoring/logger';
import { safeJsonParse } from '@/utils/json-utils';
import environment from '@/config/environment';

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
  maxCitations?: number
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

  let promptContent =
    'You are an experienced USPTO patent examiner evaluating a patent application against prior art.\\n\\n';
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
    'TASK: Analyze each claim element to determine: (1) if it is anticipated under 35 U.S.C. 102, (2) rendered obvious under 35 U.S.C. 103, or (3) patentable over this reference. Provide Office Action-style rejection rationales and amendment suggestions.\\n\\n';

  promptContent +=
    'CRITICAL REQUIREMENT: For each claim element in your analysis, identify the SPECIFIC citations from the provided data that support your rejection analysis. Include the most relevant 2-3 citations with their full text.\\n\\n';

  promptContent +=
    'After the element-by-element analysis, provide a holistic examiner-style analysis of Claim 1 as a whole. In the "holisticAnalysis" field, do the following:\\n' +
    '- Explain, in 2-4 sentences, how the reference reads on Claim 1 as a whole (not just its individual elements).\\n' +
    '- Clearly state whether Claim 1 is patentable over this reference as written, or if it is anticipated or obvious.\\n' +
    '- If ANY element has a rejection (102 or 103), you MUST provide a clear, actionable amendment suggestion. Only if ALL elements are "Not Rejected" should you state that no amendment is needed.\\n\\n';

  promptContent +=
    'CRITICAL INSTRUCTIONS FOR CLAIM REVISION:\\n' +
    'If ANY element has a rejection (102 or 103), you MUST provide a revised version of Claim 1 that addresses at least one of the most critical rejections. You may include additional distinguishing limitations in the same claim **only if necessary** for patentability, but do NOT overload Claim 1 with all rejected details. Instead:\\n\\n' +
    '- Place **only one or two key limitations** into Claim 1 to overcome the strongest cited rejections.\\n' +
    '- Reserve secondary or narrower features (e.g., detailed algorithmic behavior, sensor calibration techniques, threshold values, UI logic) for dependent claims or as separate recommendations.\\n' +
    '- The goal is to produce a **legally defensible, reasonably broad Claim 1** that improves patentability without compromising enforceability.\\n\\n' +
    'The revised claim MUST be written as a proper patent claim following these rules:\\n' +
    '1. NEVER mention prior art references in the claim (no "not disclosed in...", no patent numbers)\\n' +
    '2. NEVER use explanatory language in the claim (no "to overcome...", no "to distinguish from...")\\n' +
    '3. Use proper claim language with technical limitations only\\n' +
    '4. Add specific technical features that distinguish over the prior art\\n' +
    '5. Write it EXACTLY as a patent attorney would write it for filing with the USPTO\\n' +
    '6. The claim should stand alone as a complete technical description\\n\\n' +
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
    '      "keyFindings": ["Key finding 1", "Key finding 2"],\\n';
  promptContent +=
    '      "rejectionType": "102 Anticipation" | "103 Obviousness" | "Not Rejected",\\n';
  promptContent += '      "primaryCitations": [\\n';
  promptContent += '        {\\n';
  promptContent +=
    '          "location": "Col. 3, Lines 15-20" or "Paragraph 55",\\n';
  promptContent +=
    '          "citationText": "The exact text from the prior art",\\n';
  promptContent +=
    '          "paragraphContext": "The full paragraph containing this citation (if available)",\\n';
  promptContent +=
    '          "reasoning": "1-2 sentences explaining why this specific citation supports the rejection"\\n';
  promptContent += '        }\\n';
  promptContent += '      ],\\n';
  promptContent +=
    '      "rejectionRationale": "Office Action-style explanation for this element",\\n';
  promptContent +=
    '      "recommendation": "Suggested amendment for this element if needed"\\n';
  promptContent += '    }\\n';
  promptContent += '  },\\n';
  promptContent += '  "overallAssessment": {\\n';
  promptContent += '    "summary": "1-3 sentences overall summary",\\n';
  promptContent +=
    '    "patentabilityScore": 0.0-1.0 (where 0.0 = not patentable/fully rejected, 1.0 = fully patentable/no issues),\\n';
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
    '  "originalClaim": "The original Claim 1 text as provided.",\\n';
  promptContent +=
    '  "revisedClaim": "The revised Claim 1 text with suggested amendment, or identical to originalClaim if no change is needed."\\n';
  promptContent += '}\\n\\n';

  promptContent +=
    'IMPORTANT: Your response MUST be a single valid JSON object exactly matching the format above. Do not include any text outside the JSON object. Use only ONE relevance score per element (not per citation). Focus on the 2-3 most impactful citations that directly support your rejection analysis.\n\n';

  promptContent +=
    'CRITICAL: Keep your analysis CONCISE. Each "analysis" field should be 2-3 sentences maximum. Each "reasoning" should be 1-2 sentences. Focus on the most important findings only to ensure the response fits within token limits.';

  return promptContent;
}
