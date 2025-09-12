import { test, expect } from '@playwright/test';

test.describe('OntoWave Configuration Panel - UI Improvements', () => {
  test('should show improved configuration panel with proper sizing and visual feedback', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu', { timeout: 10000 });
    
    // Étape 1: Ouvrir le menu
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    
    // Étape 2: Vérifier que le bouton Configuration n'est pas sélectionné initialement
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await expect(configButton).toBeVisible();
    await expect(configButton).not.toHaveClass(/selected/);
    
    // Étape 3: Cliquer sur Configuration et vérifier l'état sélectionné
    await configButton.click();
    await expect(configButton).toHaveClass(/selected/);
    
    // Étape 4: Vérifier que le panneau apparaît avec la bonne taille
    const configPanel = page.locator('#ontowave-config-panel');
    await expect(configPanel).toBeVisible();
    
    // Vérifier que le panneau a une largeur minimale suffisante
    const panelBox = await configPanel.boundingBox();
    expect(panelBox.width).toBeGreaterThan(450); // Au moins 450px de large
    expect(panelBox.height).toBeGreaterThan(250); // Au moins 250px de haut
    
    // Étape 5: Vérifier que l'icône dans le panneau correspond à celle du bouton
    const panelTitle = page.locator('.config-form-compact h3');
    await expect(panelTitle).toContainText('⚙️ Configuration');
    
    // Étape 6: Vérifier que les éléments sont bien visibles et lisibles
    await expect(page.locator('#config-title-mini')).toBeVisible();
    await expect(page.locator('#config-locales-mini')).toBeVisible();
    await expect(page.locator('#config-showGallery-mini')).toBeVisible();
    
    // Vérifier la zone de prévisualisation
    const codePreview = page.locator('.code-preview-mini');
    await expect(codePreview).toBeVisible();
    
    // Étape 7: Fermer le panneau et vérifier que le bouton n'est plus sélectionné
    await configButton.click();
    await expect(configPanel).not.toBeVisible();
    await expect(configButton).not.toHaveClass(/selected/);
  });

  test('should maintain responsive design on smaller screens', async ({ page }) => {
    // Simuler un écran mobile
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto('http://localhost:8080');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu');
    
    // Ouvrir le menu et le panneau
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await configButton.click();
    
    // Vérifier que le panneau s'adapte à l'écran mobile
    const configPanel = page.locator('#ontowave-config-panel');
    await expect(configPanel).toBeVisible();
    
    const panelBox = await configPanel.boundingBox();
    expect(panelBox.width).toBeGreaterThan(500); // Au moins 90% de la largeur d'écran mobile
  });
});
