/**
 * Mock tool invocations for testing the chat interface
 */

import { ChatMessage } from '../types';
import { ToolInvocation } from '../types/tool-invocation';

/**
 * Create a mock tool message for testing
 */
export function createMockToolMessage(
  tools: Partial<ToolInvocation>[]
): ChatMessage {
  return {
    id: `tool-msg-${Date.now()}`,
    role: 'tool',
    content: '',
    toolInvocations: tools.map((tool, index) => ({
      id: tool.id || `tool-${Date.now()}-${index}`,
      toolName: tool.toolName || 'search-prior-art',
      status: tool.status || 'running',
      parameters: tool.parameters || [],
      startTime: tool.startTime || Date.now(),
      displayName: tool.displayName,
      description: tool.description,
      result: tool.result,
      error: tool.error,
      endTime: tool.endTime,
      icon: tool.icon,
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simulate tool invocation updates for testing
 * This can be used to test the real-time updates in the chat
 */
export function simulateToolUpdates(
  updateCallback: (message: ChatMessage) => void,
  initialTools: Partial<ToolInvocation>[]
) {
  // Create initial message with running tools
  const toolMessage = createMockToolMessage(initialTools);
  updateCallback(toolMessage);

  // Simulate updates over time
  initialTools.forEach((tool, index) => {
    setTimeout(
      () => {
        // Update to completed
        const updatedMessage = {
          ...toolMessage,
          toolInvocations: toolMessage.toolInvocations?.map((inv, i) =>
            i === index
              ? {
                  ...inv,
                  status: 'completed' as const,
                  endTime: Date.now(),
                  result: tool.result || `Completed ${inv.toolName}`,
                }
              : inv
          ),
        };
        updateCallback(updatedMessage);
      },
      (index + 1) * 3000
    ); // Complete each tool 3 seconds apart
  });
}

/**
 * Example test scenarios
 */
export const TEST_SCENARIOS = {
  // Single tool search
  singleSearch: [
    {
      toolName: 'search-prior-art',
      displayName: 'Prior Art Search',
      description: 'Searching patent databases',
      parameters: [
        { name: 'query', value: 'wireless charging technology' },
        { name: 'dateRange', value: '2020-2024' },
      ],
    },
  ],

  // Multiple parallel tools
  parallelTools: [
    {
      toolName: 'search-prior-art',
      displayName: 'Prior Art Search',
      status: 'running' as const,
      parameters: [{ name: 'query', value: 'IoT sensor networks' }],
    },
    {
      toolName: 'analyze-claims',
      displayName: 'Claim Analysis',
      status: 'running' as const,
      parameters: [{ name: 'claimCount', value: 5 }],
    },
    {
      toolName: 'generate-description',
      displayName: 'Description Generation',
      status: 'pending' as const,
      parameters: [{ name: 'style', value: 'technical' }],
    },
  ],

  // Tool with error
  errorScenario: [
    {
      toolName: 'update-invention',
      displayName: 'Update Invention Data',
      parameters: [
        { name: 'field', value: 'technicalField' },
        { name: 'value', value: 'Invalid' },
      ],
      error:
        'Validation failed: Technical field must be at least 20 characters',
    },
  ],
};

/**
 * Helper to inject test tool messages into chat
 * Usage: Call this in browser console or from a test button
 */
export function injectTestToolMessage(scenario: keyof typeof TEST_SCENARIOS) {
  const tools = TEST_SCENARIOS[scenario];
  const message = createMockToolMessage(tools);

  // Log for debugging
  console.log('Test tool message:', message);

  return message;
}
