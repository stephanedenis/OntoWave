import { test, expect } from '@playwright/test';

/**
 * Demo: UX Print / PDF Export
 * CSS d'impression, éléments masqués, bouton 🖨 dans la toolbar
 */
test.describe('Demo 03-ux/print: PDF Export', () => {
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
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content with H1', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });
    const h1 = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || '');
    expect(h1.length).toBeGreaterThan(0);
    console.log('✅ H1 found:', h1);
  });

  test('should inject UX toolbar with print button', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Look for a button containing the printer icon or print text
    const printBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#ow-ux-toolbar button, .ow-ux-toolbar button'));
      return buttons.some(btn => btn.textContent.includes('🖨') || btn.title?.toLowerCase().includes('print'));
    });
    expect(printBtn).toBe(true);
    console.log('✅ Print button found in UX toolbar');
  });

  test('should render elements-hidden table', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('table', { timeout: 5000 });

    // Should have a table documenting hidden selectors
    const tableText = await page.evaluate(() =>
      Array.from(document.querySelectorAll('table')).map(t => t.textContent).join(' ')
    );
    expect(tableText).toContain('#sidebar');
    console.log('✅ CSS selectors table rendered with #sidebar entry');
  });

  test('should render print CSS in the page stylesheet', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Check that @media print rules exist in the injected styles
    const hasPrintCSS = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.type === CSSRule.MEDIA_RULE &&
                rule.conditionText?.includes('print')) {
              return true;
            }
          }
        } catch {
          // Cross-origin sheets throw — skip them
        }
      }
      return false;
    });
    expect(hasPrintCSS).toBe(true);
    console.log('✅ @media print rule found in document stylesheets');
  });

  test('should show sidebar as hidden in print context', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    // Emulate print media to verify sidebar is hidden
    await page.emulateMedia({ media: 'print' });

    const sidebarVisible = await page.evaluate(() => {
      const sidebar = document.querySelector('#sidebar');
      if (!sidebar) return false; // no sidebar = already not visible
      const style = window.getComputedStyle(sidebar);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    expect(sidebarVisible).toBe(false);
    console.log('✅ #sidebar is hidden in print media context');

    await page.emulateMedia({ media: 'screen' });
  });

  test('should show UX toolbar as hidden in print context', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });

    await page.emulateMedia({ media: 'print' });

    const toolbarVisible = await page.evaluate(() => {
      const toolbar = document.querySelector('#ow-ux-toolbar, .ow-ux-toolbar');
      if (!toolbar) return false;
      return window.getComputedStyle(toolbar).display !== 'none';
    });
    expect(toolbarVisible).toBe(false);
    console.log('✅ UX toolbar hidden in print media context');

    await page.emulateMedia({ media: 'screen' });
  });

  test('should render code blocks as printable content', async ({ page }) => {
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('h1', { state: 'attached', timeout: 5000 });

    const codeBlock = await page.$('pre code');
    expect(codeBlock).toBeTruthy();
    console.log('✅ Code block rendered (printable content)');
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ow-reading-theme', 'light'));
    await page.goto('/demos/03-ux/print.html');
    await page.waitForSelector('#ow-ux-toolbar', { timeout: 6000 });
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('03-ux-print.png', {
      fullPage: true,
      maxDiffPixels: 500,
    });
  });
});
