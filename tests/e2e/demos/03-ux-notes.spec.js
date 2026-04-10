import { test, expect } from '@playwright/test';

/**
 * Demo: UX Notes — Notes persistantes par page
 * saveNote / loadNote / getAllNotes, localStorage, debounce, panneau toggle
 */
test.describe('Demo 03-ux/notes: Persistent Notes', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('❌ Browser console error:', msg.text());
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.error('❌ Page error:', err.message);
    });
  });

  test('should load without console errors', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content with H1', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });
    const h1 = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || '');
    expect(h1.length).toBeGreaterThan(0);
    console.log('✅ H1 found:', h1);
  });

  test('should inject UX toolbar with notes button', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    const notesBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#ow-ux-toolbar button, .ow-ux-toolbar button'));
      return buttons.some(btn => btn.textContent.includes('📝') || btn.title?.toLowerCase().includes('note'));
    });
    expect(notesBtn).toBe(true);
    console.log('✅ Notes button found in UX toolbar');
  });

  test('should toggle notes panel open on button click', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Click the notes button
    const notesBtn = page.locator('#ow-ux-toolbar button, .ow-ux-toolbar button').filter({ hasText: '📝' });
    await notesBtn.click();
    await page.waitForTimeout(400);

    const panel = await page.$('.ow-notes-panel');
    expect(panel).toBeTruthy();

    const display = await panel.evaluate(el => window.getComputedStyle(el).display);
    expect(display).not.toBe('none');
    console.log('✅ Notes panel visible after button click');
  });

  test('should close notes panel on second button click', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    const notesBtn = page.locator('#ow-ux-toolbar button, .ow-ux-toolbar button').filter({ hasText: '📝' });

    // Open
    await notesBtn.click();
    await page.waitForTimeout(400);

    // Close
    await notesBtn.click();
    await page.waitForTimeout(400);

    const panel = await page.$('.ow-notes-panel');
    if (panel) {
      const display = await panel.evaluate(el => window.getComputedStyle(el).display);
      expect(display).toBe('none');
      console.log('✅ Notes panel closed on second click');
    } else {
      // Panel removed from DOM is also acceptable
      console.log('✅ Notes panel removed from DOM after close');
    }
  });

  test('should contain a textarea in the notes panel', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Open notes panel
    const notesBtn = page.locator('#ow-ux-toolbar button, .ow-ux-toolbar button').filter({ hasText: '📝' });
    await notesBtn.click();
    await page.waitForTimeout(400);

    const textarea = await page.$('.ow-notes-panel textarea');
    expect(textarea).toBeTruthy();
    console.log('✅ Textarea found in notes panel');
  });

  test('should save note to localStorage after typing', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Open notes panel
    const notesBtn = page.locator('#ow-ux-toolbar button, .ow-ux-toolbar button').filter({ hasText: '📝' });
    await notesBtn.click();
    await page.waitForTimeout(400);

    // Set textarea value and fire input event directly (Playwright fill() doesn't work in this env)
    await page.evaluate(() => {
      const ta = document.querySelector('.ow-notes-panel textarea');
      if (!ta) throw new Error('textarea not found');
      ta.value = 'Test note e2e playwright';
      ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });

    // Wait for debounce (600ms) + margin
    await page.waitForTimeout(900);

    // Check localStorage
    const saved = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('ow-note:'));
      if (keys.length === 0) return null;
      return localStorage.getItem(keys[0]);
    });

    expect(saved).toContain('Test note e2e playwright');
    console.log('✅ Note saved to localStorage:', saved);
    console.log('✅ Note saved to localStorage:', saved);
  });

  test('should restore note after page reload', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Pre-seed a note in localStorage using the key format ux.ts uses: 'ow-note:' + location.hash
    await page.evaluate(() => {
      const key = 'ow-note:' + (location.hash || '#/');
      localStorage.setItem(key, 'Note restaurée après rechargement');
    });

    await page.reload();
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Open notes panel
    const notesBtn = page.locator('#ow-ux-toolbar button, .ow-ux-toolbar button').filter({ hasText: '📝' });
    await notesBtn.click();
    await page.waitForTimeout(400);

    const textarea = page.locator('.ow-notes-panel textarea');
    const content = await textarea.inputValue();
    expect(content).toContain('Note restaurée après rechargement');
    console.log('✅ Note restored after reload:', content);
  });

  test('should hide notes panel in print context', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Open notes panel so it's in the DOM
    const notesBtn = page.locator('#ow-ux-toolbar button, .ow-ux-toolbar button').filter({ hasText: '📝' });
    await notesBtn.click();
    await page.waitForTimeout(400);

    // Switch to print media
    await page.emulateMedia({ media: 'print' });

    const panelVisible = await page.evaluate(() => {
      const panel = document.querySelector('.ow-notes-panel');
      if (!panel) return false;
      return window.getComputedStyle(panel).display !== 'none';
    });
    expect(panelVisible).toBe(false);
    console.log('✅ Notes panel hidden in print media context');

    await page.emulateMedia({ media: 'screen' });
  });

  test('should render API section in the document', async ({ page }) => {
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });

    const codeBlocks = await page.$$eval('pre code', els =>
      els.map(el => el.textContent)
    );
    const hasApi = codeBlocks.some(c => c.includes('saveNote') || c.includes('loadNote'));
    expect(hasApi).toBe(true);
    console.log('✅ API code examples rendered in document');
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ow-reading-theme', 'light');
      // Clear any stale notes
      Object.keys(localStorage)
        .filter(k => k.startsWith('ow-note:'))
        .forEach(k => localStorage.removeItem(k));
    });
    await page.goto('/demos/03-ux/notes.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('03-ux-notes.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});
