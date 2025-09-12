import { test, expect } from '@playwright/test';

test.describe('OntoWave Configuration Panel', () => {
  test('should open menu and show configuration panel', async ({ page }) => {
    await page.goto('http://localhost:8081');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu', { timeout: 10000 });
    
    // Vérifier que la page normale est affichée
    await expect(page.locator('#ontowave-content')).toBeVisible();
    
    // Étape 1: Cliquer sur l'icône du menu pour l'ouvrir
    const menuIcon = page.locator('#ontowave-menu-icon');
    await expect(menuIcon).toBeVisible();
    
    console.log('Clicking on menu icon...');
    await menuIcon.click();
    
    // Attendre que le menu soit étendu
    await page.waitForSelector('.ontowave-floating-menu.expanded', { timeout: 5000 });
    
    // Étape 2: Le bouton Configuration devrait maintenant être visible
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await expect(configButton).toBeVisible();
    
    console.log('Clicking on Configuration button...');
    await configButton.click();
    
    // Étape 3: Vérifier que le panneau de configuration apparaît
    await expect(page.locator('#ontowave-config-panel')).toBeVisible({ timeout: 5000 });
    
    // Vérifier les éléments du formulaire compact
    await expect(page.locator('#config-title-mini')).toBeVisible();
    await expect(page.locator('#config-locales-mini')).toBeVisible();
    await expect(page.locator('#config-showGallery-mini')).toBeVisible();
  });
});
