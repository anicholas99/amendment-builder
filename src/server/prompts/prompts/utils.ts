/**
 * Prompt Template Utilities
 *
 * Central utilities for rendering and managing prompt templates
 */

/**
 * Interface for prompt templates with versioning
 */
export interface PromptTemplate {
  version: string;
  template: string;
  variables?: string[];
}

/**
 * Renders a prompt template with provided variables
 * Uses simple string replacement for now - can be enhanced with handlebars/mustache later
 *
 * @param promptTemplate The template to render
 * @param variables Object with variable values to substitute
 * @returns Rendered prompt string
 */
export function renderPromptTemplate(
  promptTemplate: PromptTemplate,
  variables: Record<string, unknown>
): string {
  let rendered = promptTemplate.template;

  // Handle conditional blocks with else
  for (const [key, value] of Object.entries(variables)) {
    // First handle if-else blocks
    const ifElseRegex = new RegExp(
      `{{#if ${key}}}([\\s\\S]*?){{else}}([\\s\\S]*?){{/if}}`,
      'g'
    );
    rendered = rendered.replace(
      ifElseRegex,
      (match, ifContent, elseContent) => {
        return value ? ifContent : elseContent;
      }
    );

    // Then handle simple if blocks (without else)
    const simpleIfRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, 'g');
    rendered = rendered.replace(simpleIfRegex, (match, content) => {
      return value ? content : '';
    });

    // Handle simple variable substitution
    const simpleRegex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(simpleRegex, String(value || ''));
  }

  // Clean up any remaining conditional syntax that wasn't matched
  rendered = rendered.replace(
    /{{#if \w+}}[\s\S]*?{{else}}[\s\S]*?{{\/if}}/g,
    ''
  );
  rendered = rendered.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, '');
  rendered = rendered.replace(/{{\w+}}/g, '');

  return rendered.trim();
}

/**
 * Validates that all required variables are provided
 *
 * @param template Prompt template with variable list
 * @param variables Provided variables
 * @returns Array of missing variables (empty if all provided)
 */
export function validateTemplateVariables(
  template: PromptTemplate,
  variables: Record<string, unknown>
): string[] {
  if (!template.variables) return [];

  return template.variables.filter(
    variable =>
      variables[variable] === undefined || variables[variable] === null
  );
}

/**
 * Gets template metadata for debugging and logging
 *
 * @param template Prompt template
 * @returns Metadata object
 */
export function getTemplateMetadata(template: PromptTemplate) {
  return {
    version: template.version,
    variableCount: template.variables?.length || 0,
    templateLength: template.template.length,
    requiredVariables: template.variables || [],
  };
}
