import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // You can add test-specific options here
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}); 