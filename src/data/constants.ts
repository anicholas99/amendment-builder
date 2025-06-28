// Constants for the ClaimRefinementView component

// Define the Message type locally
export interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

// Initial assistant messages
export const INITIAL_ASSISTANT_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content:
      'I can help you refine your drone system patent claims. Would you like me to analyze them for potential improvements?',
  },
];

// Default claim text if none exists
export const DEFAULT_CLAIM_1_TEXT =
  'A solar-powered agricultural drone system comprising a lightweight carbon fiber frame, integrated solar panels on wing surfaces, a power management system, a main control unit, a multispectral imaging array, a precision spraying mechanism, and a smart navigation system.';

// Production constants
// -------------------

// API endpoints are now in appConfig.ts
