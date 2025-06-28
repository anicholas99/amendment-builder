import { PromptTemplate } from '../utils';

/**
 * System message for figure generation AI assistant
 */
export const FIGURE_GENERATION_SYSTEM_MESSAGE_V1: PromptTemplate = {
  version: '1.0.0',
  template:
    'You are a helpful AI assistant specialized in patent drafting. Analyze invention details and existing figures to suggest necessary new figures or updates to existing figure details (description, elements). Respond strictly in JSON format as specified.',
  variables: [],
};

/**
 * Main prompt template for generating figure suggestions
 */
export const FIGURE_SUGGESTION_PROMPT_V1: PromptTemplate = {
  version: '1.0.0',
  template: `You are an AI assistant helping draft patent applications. 
Analyze the invention details and the CURRENT figures provided.

Invention Details:
Title: {{title}}
Summary: {{summary}}
Key Features: {{features}}
Preferred Embodiment: {{preferredEmbodiment}}

Current Figures:
{{existingFiguresString}}

Your Task:
1. Determine if any NEW figures are needed to better illustrate the invention based on the description (e.g., flowcharts for methods, block diagrams for systems). Assign appropriate keys like "FIG. X".
2. Examine the CURRENT figures. Identify any that are missing a description or have insufficient elements defined in their 'elements' object to properly describe the components mentioned in the invention context.
3. For ONLY the NEW figures you identify OR existing figures you identify as needing detail:
    a. Generate a concise and accurate description explaining what the figure depicts in relation to the invention.
    b. Identify key elements relevant to that figure based on the invention context and generate a JSON object mapping reference numerals (e.g., "10", "12", "100a") to short, clear descriptions of those elements.

Output Format:
Return a single JSON object containing ONLY the figures you are suggesting to add or update. The keys should be the figure keys (e.g., "FIG. 1", "FIG. 3"). The value for each key should be an object with "description" and "elements" keys.

Example Output (if suggesting updates to FIG. 1 and adding FIG. 3):
{
  "FIG. 1": {
    "description": "Updated description for FIG. 1...",
    "elements": { "10": "Updated Element A", "14": "Component C" }
  },
  "FIG. 3": {
    "description": "Description for new FIG. 3 (e.g., a flowchart)...",
    "elements": { "300": "Step 1", "302": "Decision Point" }
  }
}

If you determine NO new figures are needed and all existing figures have sufficient detail, return an empty JSON object: {}

Provide ONLY the JSON object in your response.`,
  variables: [
    'title',
    'summary',
    'features',
    'preferredEmbodiment',
    'existingFiguresString',
  ],
};
