import { test, expect } from '@playwright/test';

test.describe('OntoWave Drag Disable Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de test
    await page.goto('http://localhost:8081/test-drag-disable.html');
    
    // Attendre que OntoWave soit initialisé
    await page.waitForSelector('#ontowave-floating-menu', { timeout: 5000 });
  });

  test('should allow dragging when menu is collapsed', async ({ page }) => {
    const menu = page.locator('#ontowave-floating-menu');
    
    // Vérifier que le menu est présent
    await expect(menu).toBeVisible();
    
    // Vérifier que le curseur est 'move' (déplaçable)
    const cursor = await menu.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('move');
    
    // Vérifier qu'il n'a pas la classe 'no-drag'
    await expect(menu).not.toHaveClass(/no-drag/);
  });

  test('should disable dragging when menu is expanded', async ({ page }) => {
    const menu = page.locator('#ontowave-floating-menu');
    const menuIcon = page.locator('#ontowave-menu-icon');
    
    // Cliquer pour étendre le menu
    await menuIcon.click();
    
    // Attendre que le menu soit étendu
    await expect(menu).toHaveClass(/expanded/);
    
    // Vérifier que la classe 'no-drag' est ajoutée
    await expect(menu).toHaveClass(/no-drag/);
    
    // Vérifier que le curseur change
    const cursor = await menu.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('default');
  });

  test('should disable dragging when config panel is open', async ({ page }) => {
    const menu = page.locator('#ontowave-floating-menu');
    const menuIcon = page.locator('#ontowave-menu-icon');
    
    // Étendre le menu
    await menuIcon.click();
    await expect(menu).toHaveClass(/expanded/);
    
    // Cliquer sur Configuration
    const configOption = page.locator('.ontowave-menu-option').filter({ hasText: 'Configuration' });
    await configOption.click();
    
    // Attendre que le panneau de configuration soit ouvert
    await page.waitForSelector('.ontowave-config-panel', { timeout: 5000 });
    
    // Vérifier que la classe 'no-drag' est maintenue
    await expect(menu).toHaveClass(/no-drag/);
    
    // Vérifier que le curseur reste 'default'
    const cursor = await menu.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('default');
  });

  test('should re-enable dragging when menu and panel are closed', async ({ page }) => {
    const menu = page.locator('#ontowave-floating-menu');
    const menuIcon = page.locator('#ontowave-menu-icon');
    
    // Étendre le menu et ouvrir le panneau de configuration
    await menuIcon.click();
    const configOption = page.locator('.ontowave-menu-option').filter({ hasText: 'Configuration' });
    await configOption.click();
    await page.waitForSelector('.ontowave-config-panel');
    
    // Fermer le panneau de configuration (re-cliquer sur Configuration)
    await configOption.click();
    await page.waitForSelector('.ontowave-config-panel', { state: 'detached' });
    
    // Le menu devrait encore être étendu, donc le drag désactivé
    await expect(menu).toHaveClass(/no-drag/);
    
    // Fermer le menu
    await page.click('body'); // Clic en dehors du menu
    await expect(menu).not.toHaveClass(/expanded/);
    
    // Maintenant le drag devrait être réactivé
    await expect(menu).not.toHaveClass(/no-drag/);
    
    const cursor = await menu.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('move');
  });

  test('should not allow mousedown to start drag when disabled', async ({ page }) => {
    const menu = page.locator('#ontowave-floating-menu');
    const menuIcon = page.locator('#ontowave-menu-icon');
    
    // Obtenir position initiale
    const initialBox = await menu.boundingBox();
    
    // Étendre le menu pour désactiver le drag
    await menuIcon.click();
    await expect(menu).toHaveClass(/no-drag/);
    
    // Essayer de faire du drag & drop
    await menu.hover();
    await page.mouse.down();
    await page.mouse.move(initialBox.x + 100, initialBox.y + 50);
    await page.mouse.up();
    
    // Vérifier que la position n'a pas changé
    const finalBox = await menu.boundingBox();
    expect(Math.abs(finalBox.x - initialBox.x)).toBeLessThan(5); // Tolérance de 5px
    expect(Math.abs(finalBox.y - initialBox.y)).toBeLessThan(5);
  });
});
