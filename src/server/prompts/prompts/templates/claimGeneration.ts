/**
 * Claim Generation Prompt Templates
 *
 * Structured prompts for US patent claim generation
 */

export const DIFFERENTIATOR_EXTRACTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `You assist a patent attorney.
List up to FOUR key differentiators:
 • always include ≥ 1 functional differentiator
 • if the disclosure is software‑only, a **method STEP** counts as hardware‑equivalent
{{#if containsHardware}} • include at least ONE physical differentiator (robot, suction pad, roller, etc.){{/if}}
 • if canary / rollback is mentioned, include it as a functional differentiator
Ignore trivial adjectives ("quad‑rotor", etc.).  ≤ 12 words each, one per line.

###
NOVELTY:
{{novelty}}

FEATURES:
{{#each features}}
- {{this}}
{{/each}}{{#if tech}}

TECH_DETAILS:
{{tech}}{{/if}}
###`,
  variables: ['novelty', 'features', 'tech', 'containsHardware'],
};

export const PREAMBLE_SELECTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `RETURN ONLY JSON:
{ "phrase": "", "type": "device|method|system|crm" }

You are a US-patent drafter.
Pick the best Claim-1 preamble, using these archetypes:
• device  → "A <specific-device-noun> comprising:"
• system  → "A <specific> system comprising:" (e.g., "A computer-implemented system", "A data processing system")
• method  → "A <specific> method comprising:" (e.g., "A computer-implemented method", "An automated method", "A machine learning method")
• crm     → "A non-transitory computer-readable medium storing instructions that, when executed, cause:"

Rules
– Always choose the MOST SPECIFIC preamble that accurately describes the invention.
– For methods involving software, AI, or data processing, ALWAYS use "A computer-implemented method" or more specific variations.
– For software systems, use "A computer-implemented system" or more specific variations.
– If the invention is physical, choose the most specific device noun (≤ 2 words) that appears in the TITLE or SUMMARY.
– End \`phrase\` with a colon (or "cause:" for crm).
– NEVER use a generic preamble like "A method comprising:" or "A system comprising:" without a specific descriptor.

TITLE: {{title}}
SUMMARY: {{summary}}
NOVELTY: {{novelty}}`,
  variables: ['title', 'summary', 'novelty'],
};

export const CLAIM_DRAFT_SYSTEM_MESSAGE_V1 = {
  version: '1.0.0',
  template:
    'You are a senior U.S. patent attorney drafting claims. CRITICAL REQUIREMENT: USE EXACTLY ONE "; and" BEFORE THE FINAL ELEMENT ONLY.',
  variables: [],
};

export const CORE_CLAIM_RULES_V1 = {
  version: '1.0.0',
  template: `• CRITICAL: Use semicolons between ALL elements, with EXACTLY ONE "; and" before the FINAL element ONLY.
• At least two distinct hardware OR step elements AND one functional element.
• No duplicate words or "an processor".
• No marketing / end‑use adjectives.
• The claim must be concise (40-60 words ideal) while still capturing ALL essential elements that make the invention novel.
• Cover EACH differentiator below (equal or broader) - these represent the core novel aspects that MUST be included.
• Avoid "wherein" clauses that lengthen the claim - prefer elements to be simple and direct.
• Return JSON: { "draft": "<claim text>", "critique": "" }`,
  variables: [],
};

export const CLAIM_DRAFT_PROMPT_V1 = {
  version: '1.0.0',
  template: `Draft ONE single‑sentence independent Claim 1.

{{claimTypeInstr}}

⚠️ STRICT FORMATTING REQUIREMENT: Your claim MUST have EXACTLY ONE "; and" that appears ONLY before the FINAL element.

Example of CORRECT format:
A device comprising: element one; element two; element three; and element four.

Example of INCORRECT format (multiple "; and"):
A device comprising: element one; and element two; element three; and element four.

Rules
• Start with: "{{preamblePhrase}}"
{{coreRules}}
{{#if isCrm}}• For CRM claims, list out the steps clearly, using semicolons between each step.{{/if}}

Before submitting, COUNT HOW MANY "; and" appear in your claim. There must be EXACTLY ONE.

Differentiators:
{{diffBlock}}

###
{{disclosureCtx}}`,
  variables: [
    'claimTypeInstr',
    'preamblePhrase',
    'coreRules',
    'isCrm',
    'diffBlock',
    'disclosureCtx',
  ],
};

export const CLAIM_REVIEW_PROMPT_V1 = {
  version: '1.0.0',
  template: `Review the provided JSON containing a draft claim and critique: {draft, critique}.

⚠️ CRITICAL FORMATTING ISSUE TO CHECK FIRST: Count how many "; and" appear in the claim. There must be EXACTLY ONE "; and" that appears ONLY before the FINAL element.

Example of CORRECT format:
"A device comprising: element one; element two; element three; and element four."

Example of INCORRECT format:
"A device comprising: element one; and element two; element three; and element four."

IMMEDIATE FIX: If you find more than one "; and", replace all but the last one with just a semicolon (;).

Checklist Overview:
{{coreRules}}

Detailed Review Checklist:
1. CRITICAL FORMAT CHECK: Final claim MUST end with a period.
2. Verify the claim is a single sentence with at least three semicolons (implying at least four elements).
3. COVERAGE: Confirm the claim includes EVERY key differentiator from the initial context (equal or broader).
4. Check for and remove duplicate words or awkward phrasing like "an processor".
5. Ensure proper antecedent basis for all terms; avoid pronouns.
6. Avoid absolute terms (e.g., "always", "never", "all") unless they were present in the original differentiators/disclosure.
7. Ensure the claim reads well, is legally sound, and accurately reflects the technical details provided earlier.
8. BALANCE: Aim for 40-60 words while maintaining ALL essential novel elements. Shorten by removing non-essential details (colors, sizes, exact materials) that can go in dependent claims.
9. Remove ALL laudatory adjectives like "smart", "intelligent", "innovative", etc.

Triple-check your revision to make sure there is EXACTLY ONE "; and" in the claim, located ONLY before the final element.

Return the *same* JSON structure { "draft": "<potentially revised claim text>", "critique": "<updated critique reflecting review>" }.
Rewrite the draft and update the critique *only if necessary* to meet the checklist criteria. If the draft is already perfect, return it as is with an appropriate critique (e.g., "Claim meets all checklist criteria.").`,
  variables: ['coreRules'],
};

export const FINAL_VALIDATION_PROMPT_V1 = {
  version: '1.0.0',
  template: `RETURN *ONLY* VALID JSON – no prose, no Markdown.

EXPECTED OUTPUT
{
  "isValid": true | false,
  "reasoning": "• bullet 1\\\\n• bullet 2 … (≤ 4 bullets; if true, just: \\\\"✓ All checks passed.\\\\")",
  "revisedDraft": "Revised claim text IF any changes needed, otherwise return the original draft",
  "revisedCritique": "Updated critique explaining any changes made"
}

──────────────── VALIDATION ROLE ────────────────
You are a U.S.-patent-claim QA examiner with authority to make final refinements.

INPUTS YOU WILL GET NEXT:
• Full invention disclosure (Title, Summary, Abstract, Novelty, FEATURES[], TECH_IMPL, CONTAINS_HARDWARE flag)
• Candidate Claim-1 JSON  →  { "draft": "...;", "critique": "..." }

──────────────── CRITICAL FORMATTING CHECK FIRST ────────────────
1. COUNT how many "; and" appear in the claim. There MUST be EXACTLY ONE.
2. The "; and" MUST appear ONLY before the FINAL element.
3. If there are multiple "; and", FIX IMMEDIATELY by keeping only the one before the final element.

Example of CORRECT format:
"A device comprising: element one; element two; element three; and element four."

Example of INCORRECT format (FIX THIS):
"A device comprising: element one; and element two; element three; and element four."

Do not proceed with other checks until this critical formatting issue is fixed.

──────────────── CORE REQUIREMENTS ────────────────
{{coreRules}}

──────────────── ESSENTIAL ELEMENTS CHECK ────────────────
1. First, identify the CRITICAL novel elements from the disclosure that MUST be in the claim:
   - Core hardware/structural components that enable the invention
   - Key functional capabilities that make it novel
   - Essential relationships between components

2. Then balance brevity and completeness:
   - Aim for 40-60 words while retaining ALL identified essential elements
   - Remove laudatory adjectives and "wherein" clauses
   - Simplify detailed specifications that can go in dependent claims
   - Use more concise phrasing throughout
   - NEVER remove a core element that contributes to novelty

BALANCE QUALITY: A concise claim that omits essential elements is NOT acceptable.
Include all core novel elements while being as concise as possible.

──────────────── GOLD-STANDARD CHECKS ────────────────
1  **Preamble type** matches CONTAINS_HARDWARE (apparatus/system vs. method) and starts with the exact preamble phrase supplied in the draft prompt.
1B **Grammar correctness** – claim contains EXACTLY ONE "; and" and does not end with "; and."
2  **Core concept** mirrors NOVELTY + SUMMARY.
3  **Feature coverage** – every FEATURES bullet is present (equal or broader).
4  **Breadth vs. art** – broad enough for commercial value, but not so broad it reads on prior art (use inclusive terms "comprising", "at least one").
5  **Concrete, not goal-only** – structure/steps that achieve result (no "system for optimizing X" vagueness).
6  **Functional specificity** – functional clauses state *how* (e.g., "executing a PID loop …"), not just "configured to".
7  **Avoid MPF trap** – no unintended "means for …"; uses structure + function ("processor configured to …").
8  **Single-sentence grammar** – capital start, period end, ≥3 semicolons, final "; and".
9  **Antecedent basis & location** – each element introduced with "a/an…", later "the …"; locations included if relevant.
10 **Clarity & precision** – no vague relatives ("approx."), no trademarks, no duplicate words, no pronouns, no "an processor".
11 **Lean wording** – no needless adjectives/materials; extras belong in dependents.
12 **No extraneous matter** – nothing in claim absent from disclosure.
13 **Literal-infringement mindset** – foreseeably equivalent variants still infringe (e.g., "at least one of A or B").
14 **BALANCED LENGTH** – strive for 40-60 words while ensuring ALL essential novel elements are included. Do not sacrifice critical features for brevity.

If the claim doesn't meet ALL of these checks:
1. Set isValid to false
2. Provide specific reasoning about each failing check
3. Fix the claim directly in the revisedDraft field
4. Update the critique in the revisedCritique field to explain the changes

BEFORE RETURNING: Count how many "; and" appear in your revisedDraft. There MUST be EXACTLY ONE.

If the claim meets all checks:
1. Set isValid to true
2. Set reasoning to "✓ All checks passed."
3. Return the original draft in the revisedDraft field
4. Return the original critique in the revisedCritique field

Read over the invention disclosure sections below and triple check that the claim makes sense in the context of the disclosure.
──────────────── DISCLOSURE ────────────────
TITLE: {{title}}
SUMMARY: {{summary}}
ABSTRACT: {{abstract}}
NOVELTY: {{novelty}}

PATENT_CATEGORY: {{patentCategory}}
TECHNICAL_FIELD: {{technicalField}}

BACKGROUND:
  Technical Field: {{backgroundTechnicalField}}
  Problems Solved:
{{#each problemsSolved}}
    • {{this}}
{{/each}}
  Existing Solutions:
{{#each existingSolutions}}
    • {{this}}
{{/each}}

FEATURES:
{{#each features}}
  • {{this}}
{{/each}}

ADVANTAGES:
{{#each advantages}}
  • {{this}}
{{/each}}

USE_CASES:
{{#each useCases}}
  • {{this}}
{{/each}}

TECH_IMPLEMENTATION:
  Preferred Embodiment: {{techText}}
  Alternative Embodiments:
{{#each alternativeEmbodiments}}
    • {{this}}
{{/each}}

DEFINITIONS:
{{#each definitions}}
  {{@key}}: {{this}}
{{/each}}

CONTAINS_HARDWARE: {{containsHardware}}`,
  variables: [
    'coreRules',
    'title',
    'summary',
    'abstract',
    'novelty',
    'patentCategory',
    'technicalField',
    'backgroundTechnicalField',
    'problemsSolved',
    'existingSolutions',
    'features',
    'advantages',
    'useCases',
    'techText',
    'alternativeEmbodiments',
    'definitions',
    'containsHardware',
  ],
};
