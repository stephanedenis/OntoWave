import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Smoke Test Configuration — ontowave.org
 *
 * Runs post-deploy against the live production site.
 * No local webServer — tests target https://ontowave.org directly.
 *
 * Tests inclus :
 * - Absence d'erreurs console
 * - Rendu Markdown (tableaux, code)
 * - Routing multilingue (i18n)
 * - CDN jsdelivr accessible
 * - SEO (robots.txt, sitemap.xml)
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'audit-ontowave-org.spec.js',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/smoke-results.json' }],
  ],

  use: {
    baseURL: 'https://ontowave.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Per-test timeout: 60s because tests run against the live production site,
  // which may have network latency and heavier rendering (Mermaid, KaTeX, etc.)
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
});
