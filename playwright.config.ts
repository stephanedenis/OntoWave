import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration - OntoWave Demos
 * 
 * Tests serve as both showcase validation and regression detection.
 * Each demo has:
 * - Console error tracking
 * - Content assertions
 * - Visual regression (screenshots)
 */
export default defineConfig({
  testDir: './tests/e2e/demos',
  
  // Fully parallel for speed
  fullyParallel: true,
  
  // CI strictness
  forbidOnly: !!process.env.CI,
  
  // Retries
  retries: process.env.CI ? 2 : 0,
  
  // Workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporters
  reporter: [
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // Global settings
  use: {
    // Base URL - serves docs/ folder (GitHub Pages root)
    baseURL: 'http://localhost:8080',
    
    // Tracing
    trace: 'on-first-retry',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
  },

  // Test match patterns
  testMatch: '**/*.spec.js',

  // Projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for cross-browser testing in CI
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

    // Web server - MUST serve docs/ folder (GitHub Pages root)
  // ⚠️ CRITIQUE: Le serveur doit TOUJOURS servir docs/, jamais la racine projet
  // - GitHub Pages sert automatiquement docs/
  // - Tests E2E doivent simuler l'environnement de production
  webServer: {
    command: 'python3 -m http.server 8080 --directory docs',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,  // 2 minutes startup
  },

  // Timeout settings
  timeout: 30 * 1000,  // 30s per test
  expect: {
    timeout: 5 * 1000,  // 5s for assertions
    toHaveScreenshot: {
      maxDiffPixels: 100,  // Tolerance for visual regression
      threshold: 0.2,
    },
  },
});
