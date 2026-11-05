import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // The published color library uses extensionless ESM imports, which plain Node cannot load.
    server: { deps: { inline: ['@material/material-color-utilities'] } },
  },
});
