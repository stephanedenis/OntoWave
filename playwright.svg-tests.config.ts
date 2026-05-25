import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Config - SVG Inline Validation Tests
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/svg-*.spec.{js,ts}',
  
  fullyParallel: false,
  retries: 0,
  workers: 1,
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/svg-inline-report', open: 'never' }]
  ],
  
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1280, height: 720 },
  },

  webServer: {
    command: 'python3 -m http.server 8080 --directory docs',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
