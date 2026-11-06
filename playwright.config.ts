import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4174/design-system/', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/serve-showcase.mjs', url: 'http://127.0.0.1:4174/design-system/', reuseExistingServer: !process.env.CI },
  projects: [{ name: 'chromium', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } }],
});
