import { test, expect } from '@playwright/test';

/**
 * Demo: Notes légères (03-reader/notes)
 */
test.describe('Demo 03-reader: Notes légères', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });
  });

  test('devrait charger sans erreurs console', async ({ page }) => {
    await page.goto('/demos/03-reader/notes.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1500);
    const critical = consoleErrors.filter(e =>
      !e.includes('net::ERR') && !e.includes('Failed to fetch') && !e.includes('ERR_')
    );
    expect(critical).toHaveLength(0);
  });

  test('devrait rendre le contenu principal', async ({ page }) => {
    await page.goto('/demos/03-reader/notes.html');
    await page.waitForSelector('h1', { timeout: 5000 });
    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
  });

  test('devrait afficher le bouton notes', async ({ page }) => {
    await page.goto('/demos/03-reader/notes.html');
    await page.waitForTimeout(1500);
    const notesBtn = page.locator('#ow-btn-notes');
    await expect(notesBtn).toBeVisible({ timeout: 5000 });
  });

  test('le bouton notes ouvre le panneau', async ({ page }) => {
    await page.goto('/demos/03-reader/notes.html');
    await page.waitForTimeout(1500);
    const notesBtn = page.locator('#ow-btn-notes');
    await notesBtn.click();
    const panel = page.locator('#ow-notes-panel');
    await expect(panel).toHaveClass(/visible/, { timeout: 3000 });
  });

  test('les notes sont sauvegardées dans localStorage', async ({ page }) => {
    await page.goto('/demos/03-reader/notes.html');
    await page.waitForTimeout(1500);
    // Ouvrir le panneau
    await page.locator('#ow-btn-notes').click();
    // Saisir une note
    const textarea = page.locator('#ow-notes-textarea');
    await textarea.fill('Test note OntoWave');
    await page.waitForTimeout(600); // Attendre l'autosave (500ms)
    // Vérifier dans localStorage
    const stored = await page.evaluate(() => {
      const hash = location.hash.split('?')[0] || '#/';
      return localStorage.getItem(`ow-notes:${hash}`);
    });
    expect(stored).toBe('Test note OntoWave');
  });

  test('devrait correspondre au snapshot visuel', async ({ page }) => {
    await page.goto('/demos/03-reader/notes.html');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('03-reader-notes.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});
