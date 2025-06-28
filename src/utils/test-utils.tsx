import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../theme';

// Add custom providers here
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

// Export only what's actually used
export { render };

// Export types that might be needed
export type { RenderOptions };
