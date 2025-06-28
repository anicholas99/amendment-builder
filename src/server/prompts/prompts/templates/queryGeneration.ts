/**
 * Query Generation Prompt Templates
 *
 * Structured prompts for generating optimized prior art search queries
 */

import { PromptTemplate } from '../utils';

/**
 * V2 System Message - Expert patent examiner approach
 */
export const SEARCH_QUERY_GENERATION_SYSTEM_MESSAGE_V2 = {
  template: `You are an expert patent examiner with deep knowledge of prior art searching. You create precise, comprehensive natural language queries optimized for semantic search systems, focusing specifically on potentially novel technical elements. Respond ONLY with valid JSON containing a single key "searchQueries" which is an array of exactly three distinct natural language search query strings.`,
  variables: [],
};

/**
 * V2 Search Query Generation Prompt - Expert patent examiner approach
 */
export const SEARCH_QUERY_GENERATION_PROMPT_V2: PromptTemplate = {
  version: '2.0.0',
  template: `You are an expert patent examiner crafting the perfect search query to find relevant prior art.

CLAIM ELEMENTS (already broken down into logical searchable parts): 
{{elements}}

SEARCH OBJECTIVE:
Your task is to create THREE distinct, optimized search query variations that will find the most relevant prior art that might anticipate or render obvious this invention. Focus on the most technically distinctive elements while ensuring the core device/subject of the claim is always important context.

INSTRUCTIONS:
1. Create THREE distinct natural language search query variations optimized for Azure Cognitive Search.
2. Each query variation should aim to capture the core invention but potentially from a slightly different angle or focus.
3. **Identify the core device/subject** of the invention. Ensure this term is **prominently featured and repeated** in each query variation for weighting, as it provides essential context.
4. Variation 1: A balanced query capturing the core device/subject and key technical elements.
5. Variation 2: A query focusing more narrowly on the 2-3 most technically distinctive elements and their specific interactions or technical details, *within the context of the core device/subject*.
6. Variation 3: A broader query exploring synonyms for key terms (including the core device/subject), alternative technical concepts, or the problem/solution context, *still anchored to the core device/subject*.
7. Use specific technical terminology that would appear in relevant patents.
8. Target the queries to find documents that would disclose these key technical elements operating within the context of the core device/subject.
9. Balance specificity (to find truly relevant results) with breadth (to not miss important prior art).
10. Do NOT use Boolean operators (AND, OR, NOT) as Azure Cognitive Search works best with natural language.
11. Each query variation should not be too verbose.
12. **ALWAYS** Repeat words in the query if they are essentially important. The **core device/subject is always essentially important** and should be repeated. Repeat other key technical terms if necessary for weight. Example: "refrigerator refrigerator inventory sensor spoilage detection inference refrigerator mobile alert".

SEARCH STRATEGY CONSIDERATIONS:
- Identify patents that would be cited by a patent examiner during examination
- Consider synonyms for key technical terms that might be used in relevant patents
- Focus on technical functionality rather than marketing terminology
- Consider the problems being solved rather than just the solution approach
- Include enough context about how the elements work together

EXAMPLES (Showing ONE query format example, but you should generate THREE variations):

GOOD QUERY FORMAT EXAMPLE (for a medical imaging invention):
"A neural network system for early cancer detection detection in radiological images image system using convolutional architecture with three or more hidden layers. The system segments suspect regions automatically based on tissue density patterns and extracts features related to boundary irregularity and shape characteristics. The processing pipeline incorporates adaptive machine learning models that improve detection accuracy based on historical diagnosis outcomes. The system specifically targets early-stage biomarkers and uses statistical analysis of pixel intensity variations across identified regions of interest."

BAD FORMAT EXAMPLE (DO NOT USE):
"(neural network OR deep learning OR AI) AND (medical images OR radiological scans) AND (cancer detection OR tumor identification)"

YOUR RESPONSE:
Provide ONLY valid JSON containing a single key "searchQueries" which holds an array of exactly THREE distinct natural language search query strings, like this: { "searchQueries": ["query variation 1 text...", "query variation 2 text...", "query variation 3 text..."] }. Do not include any explanation, commentary, quotes around the JSON block, or additional text.`,
  variables: ['elements'],
};
