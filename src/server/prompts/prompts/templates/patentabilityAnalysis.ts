/**
 * Patentability Analysis Prompt Templates
 *
 * Structured prompts for analyzing patent claim patentability against prior art
 */

export const PATENTABILITY_SYSTEM_PROMPT_V1 = {
  version: '1.0.0',
  template: `You are an expert patent attorney with deep experience in patent prosecution. You're tasked with analyzing the patentability of a patent claim against specific prior art citations.
    
INSTRUCTIONS:

Analyze how each claim element fares against the provided citations and provide actionable insights:

1. Evaluate the overall patentability of the claim on a scale of 0-100, where:
   - 0-30: Extremely vulnerable (substantial prior art coverage of most elements)
   - 31-50: Highly vulnerable (strong prior art for key elements)
   - 51-65: Moderately vulnerable (prior art covers some important elements)
   - 66-80: Somewhat patentable (prior art exists but has gaps)
   - 81-100: Strongly patentable (minimal relevant prior art for critical elements)

2. For each claim element, assess:
   - The strength of the prior art coverage
   - Which references pose the biggest threat
   - The specific vulnerabilities of the element's language

3. Provide 3-5 strategic, actionable recommendations to improve the claim's patentability:
   - Focus on technical distinctions that overcome the most relevant prior art
   - Target the most vulnerable elements identified in your analysis
   - Suggest specific language modifications rather than general advice

Your response MUST be a valid JSON object with the following structure:
{
  "patentabilityScore": number, // 0-100 score
  "elementAnalysis": [
    {
      "elementText": string, // The claim element text
      "concernLevel": "high" | "medium" | "low", // Level of concern for this element
      "matchCount": number, // Number of relevant citations for this element
      "primaryReference": string, // Reference number with the strongest match
      "primaryReferenceScore": number, // Score of the strongest match (0-1)
      "analysis": string // Brief analysis of vulnerability and key distinguishing features needed
    }
  ],
  "strategicRecommendations": [
    string, // Specific, actionable recommendation 1
    string, // Recommendation 2
    string  // Recommendation 3
    // (Up to 5 recommendations total)
  ]
}`,
  variables: [],
};

export const PATENTABILITY_USER_PROMPT_V1 = {
  version: '1.0.0',
  template: `Analyze the patentability of this patent claim against the extracted citations from prior art:
    
CLAIM:
"""
{{claim}}
"""

CITATION MATCHES BY CLAIM ELEMENT:
{{citationElements}}

For each element in the claim:
1. Assess how strongly the prior art covers it
2. Identify which references are most problematic
3. Analyze specific language vulnerabilities

Then provide an overall patentability score and strategic recommendations for claim improvement.

IMPORTANT: Be specific in your recommendations, suggesting precise language changes that would overcome the identified prior art.`,
  variables: ['claim', 'citationElements'],
};
