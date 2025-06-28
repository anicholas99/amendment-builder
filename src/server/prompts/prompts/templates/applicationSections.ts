/**
 * Application Section Generation Prompt Templates
 *
 * Structured prompts for generating various sections of patent applications
 */

export const SYSTEM_MESSAGE_V1 = {
  version: '1.0.0',
  template:
    'You are a seasoned patent attorney expert at drafting patent applications. Return only the requested text without any additional commentary.',
  variables: [],
};

export const FIELD_SECTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `Write a single concise sentence describing the technical field of the invention. 
Begin with "The present invention relates to" and be specific but brief.
{{fullInventionData}}

Example format:
The present invention relates to [technical field].

Return only the final text with no additional commentary.`,
  variables: ['fullInventionData'],
};

export const BACKGROUND_SECTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `Write 1-2 paragraphs of background for this invention. 
{{fullInventionData}}

Include known methods and mention the issues they face. Do not include headings, labels, or extra commentary.`,
  variables: ['fullInventionData'],
};

export const SUMMARY_SECTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `Write a concise summary (~1 paragraph) of the invention. Use the following data as context:
{{fullInventionData}}

Do not include headings, labels, or extra commentary.`,
  variables: ['fullInventionData'],
};

export const DRAWINGS_SECTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `Write a brief description of the drawings for a patent application.

{{#if hasFigures}}
Start with: "The accompanying drawings, which are incorporated herein and form a part of the specification, illustrate certain embodiments of the present invention and, together with the description, serve to explain the principles of the invention:"

Then list each figure on a new line using this format:
FIG. [number] shows [description].

Use these figures:
{{figuresList}}
{{else}}
Write: "No drawings have been included in the present application as the nature of the invention may be readily understood from the following written description."
{{/if}}

Return ONLY the brief description text, nothing else.`,
  variables: ['hasFigures', 'figuresList'],
};

export const DETAILED_DESCRIPTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `Write the content for the Detailed Description section of a patent application. DO NOT include the section header "DETAILED DESCRIPTION" - it will be added automatically.

Reference only the data provided below, and adhere to these guidelines:

1. **Overall Structure**:
   - Start directly with introducing the invention in a general manner.
   - Use "In one embodiment," "In another embodiment," or similar phrases when discussing variations or additional details.
   - Provide enough disclosure so that a person of ordinary skill in the art could practice the invention.

{{#if hasFigures}}
2. **Figures & Elements**:
   - For each figure, first introduce it with its full description.
   - When referencing a figure, use the EXACT format "FIG. X" (e.g., "FIG. 1", "FIG. 2").
   - When referencing elements, use the EXACT number after the element name (e.g., "shelf unit 101)").
   - Use the EXACT element labels and numbers as provided below - do not modify or create new ones.
   - Always introduce an element with "a" or "an" on first use, then use "the" for subsequent references.
{{/if}}

3. **Technical Implementation & Alternative Embodiments**:
   - Use the data from "technical_implementation" to expand the description.
   - Include relevant details about how components interface or interact.
   - If multiple embodiments exist, describe them in separate paragraphs.

4. **No Extra Invention Details**:
   {{#if hasFigures}}- Strictly use ONLY the figures and elements provided below.{{else}}- Do not reference any figures or elements as none are provided.{{/if}}
   - Do not add any features or elements not listed.
   - DO NOT include any section headers or labels.

Below is the data for the invention. Use only this information:
-----------------------------------------------------
{{fullInventionData}}
-----------------------------------------------------

Return ONLY the final text for the Detailed Description content, with no commentary, section headers, or labels.`,
  variables: ['hasFigures', 'fullInventionData'],
};

export const ABSTRACT_SECTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `Write a single-paragraph abstract (~150 words) for this invention. Use the following details as context:
{{fullInventionData}}

Do not include headings or figure references. Output only the final abstract text.`,
  variables: ['fullInventionData'],
};
