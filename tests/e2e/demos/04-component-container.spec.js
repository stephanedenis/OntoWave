import { test, expect } from '@playwright/test';

test.describe('Demo 04-component: container mode', () => {
  test('should confine OntoWave DOM effects inside the target container', async ({ page }) => {
    await page.goto('/demos/04-component/container.html');

    await page.waitForSelector('#notes-viewer #app h1', { timeout: 8000 });

    const headerText = await page.textContent('#host-header');
    const footerText = await page.textContent('#host-footer');
    expect(headerText).toContain('Host app header');
    expect(footerText).toContain('Host app footer');

    await expect(page.locator('#notes-viewer #ow-content')).toHaveCount(1);
    await expect(page.locator('#notes-viewer #ontowave-floating-menu')).toHaveCount(1);
    await expect(page.locator('body > #ontowave-floating-menu')).toHaveCount(0);
  });
});
