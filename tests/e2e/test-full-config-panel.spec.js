import { test, expect } from '@playwright/test';

test.describe('OntoWave - Panneau de Configuration Complet', () => {
  test('should display all configuration options with sections', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu', { timeout: 15000 });
    
    // Ouvrir le menu
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    
    // Attendre que le menu soit étendu
    await page.waitForSelector('.ontowave-floating-menu.expanded', { timeout: 5000 });
    
    // Ouvrir le panneau de configuration
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await configButton.click();
    
    // Vérifier que le panneau est visible
    const configPanel = page.locator('#ontowave-config-panel');
    await expect(configPanel).toBeVisible();
    
    // Vérifier le titre principal
    await expect(page.locator('h3:has-text("🌊 OntoWave - Configuration Complète")')).toBeVisible();
    
    // Vérifier toutes les sections
    await expect(page.locator('h4:has-text("📖 Général")')).toBeVisible();
    await expect(page.locator('h4:has-text("🌍 Langues et Localisation")')).toBeVisible();
    await expect(page.locator('h4:has-text("🧭 Navigation et Interface")')).toBeVisible();
    await expect(page.locator('h4:has-text("📊 Diagrammes Mermaid")')).toBeVisible();
    await expect(page.locator('h4:has-text("🌿 Diagrammes PlantUML")')).toBeVisible();
    await expect(page.locator('h4:has-text("🎨 Coloration Syntaxique")')).toBeVisible();
    await expect(page.locator('h4:has-text("💻 Interface Utilisateur")')).toBeVisible();
  });

  test('should have all input fields for general settings', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu', { timeout: 15000 });
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Vérifier les champs généraux
    await expect(page.locator('#config-title-full')).toBeVisible();
    await expect(page.locator('#config-defaultPage-full')).toBeVisible();
    await expect(page.locator('#config-baseUrl-full')).toBeVisible();
    
    // Vérifier les valeurs par défaut
    const titleValue = await page.locator('#config-title-full').inputValue();
    expect(titleValue).toBe('OntoWave Documentation');
    
    const defaultPageValue = await page.locator('#config-defaultPage-full').inputValue();
    expect(defaultPageValue).toBe('index.md');
  });

  test('should have all multilingual options', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Vérifier les options multilingues
    await expect(page.locator('#config-locales-full')).toBeVisible();
    await expect(page.locator('#config-fallbackLocale-full')).toBeVisible();
    
    // Vérifier les options de la langue de fallback
    const fallbackOptions = page.locator('#config-fallbackLocale-full option');
    await expect(fallbackOptions.nth(0)).toHaveText('English (en)');
    await expect(fallbackOptions.nth(1)).toHaveText('Français (fr)');
    await expect(fallbackOptions.nth(2)).toHaveText('Español (es)');
    await expect(fallbackOptions.nth(3)).toHaveText('Deutsch (de)');
  });

  test('should have all navigation checkboxes', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Vérifier toutes les checkboxes de navigation
    await expect(page.locator('#config-showGallery-full')).toBeVisible();
    await expect(page.locator('#config-navHome-full')).toBeVisible();
    await expect(page.locator('#config-navBreadcrumb-full')).toBeVisible();
    await expect(page.locator('#config-navToc-full')).toBeVisible();
    
    // Vérifier les états par défaut (la plupart cochées)
    await expect(page.locator('#config-navHome-full')).toBeChecked();
    await expect(page.locator('#config-navBreadcrumb-full')).toBeChecked();
    await expect(page.locator('#config-navToc-full')).toBeChecked();
    
    // Gallery devrait être décochée par défaut
    await expect(page.locator('#config-showGallery-full')).not.toBeChecked();
  });

  test('should have all Mermaid diagram options', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Vérifier les options Mermaid
    await expect(page.locator('#config-mermaidTheme-full')).toBeVisible();
    await expect(page.locator('#config-mermaidStart-full')).toBeVisible();
    await expect(page.locator('#config-mermaidMaxWidth-full')).toBeVisible();
    
    // Vérifier les thèmes Mermaid
    const mermaidOptions = page.locator('#config-mermaidTheme-full option');
    await expect(mermaidOptions.nth(0)).toHaveText('Default (clair)');
    await expect(mermaidOptions.nth(1)).toHaveText('Dark (sombre)');
    await expect(mermaidOptions.nth(2)).toHaveText('Forest (vert)');
    await expect(mermaidOptions.nth(3)).toHaveText('Neutral (neutre)');
  });

  test('should have all PlantUML options', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Vérifier les options PlantUML
    await expect(page.locator('#config-plantumlServer-full')).toBeVisible();
    await expect(page.locator('#config-plantumlFormat-full')).toBeVisible();
    
    // Vérifier la valeur par défaut du serveur
    const serverValue = await page.locator('#config-plantumlServer-full').inputValue();
    expect(serverValue).toBe('https://www.plantuml.com/plantuml');
    
    // Vérifier les formats PlantUML
    const formatOptions = page.locator('#config-plantumlFormat-full option');
    await expect(formatOptions.nth(0)).toHaveText('SVG (vectoriel)');
    await expect(formatOptions.nth(1)).toHaveText('PNG (bitmap)');
  });

  test('should have all 4 action buttons', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Vérifier tous les boutons d'action
    await expect(page.locator('button:has-text("✅ Appliquer Configuration")')).toBeVisible();
    await expect(page.locator('button:has-text("💾 Télécharger HTML")')).toBeVisible();
    await expect(page.locator('button:has-text("📥 Télécharger ontowave.min.js")')).toBeVisible();
    await expect(page.locator('button:has-text("🔄 Réinitialiser")')).toBeVisible();
  });

  test('should apply configuration changes', async ({ page }) => {
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Modifier le titre
    const titleInput = page.locator('#config-title-full');
    await titleInput.clear();
    await titleInput.fill('Mon Site OntoWave');
    
    // Cocher la galerie
    await page.check('#config-showGallery-full');
    
    // Changer le thème Mermaid
    await page.selectOption('#config-mermaidTheme-full', 'dark');
    
    // Appliquer les changements
    await page.click('button:has-text("✅ Appliquer Configuration")');
    
    // Vérifier qu'une notification apparaît
    await expect(page.locator(':has-text("Configuration appliquée avec succès")')).toBeVisible({ timeout: 3000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Simuler un écran mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/debug-test.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    await page.click('#ontowave-menu-icon');
    await page.waitForSelector('.ontowave-floating-menu.expanded');
    await page.click('.ontowave-menu-option:has-text("Configuration")');
    
    // Vérifier que le panneau est visible et adapté
    const configPanel = page.locator('#ontowave-config-panel');
    await expect(configPanel).toBeVisible();
    
    // Vérifier que les boutons sont empilés verticalement sur mobile
    const actionsContainer = page.locator('.form-actions-full');
    await expect(actionsContainer).toBeVisible();
    
    // Tous les boutons doivent toujours être visibles
    await expect(page.locator('button:has-text("✅ Appliquer Configuration")')).toBeVisible();
    await expect(page.locator('button:has-text("💾 Télécharger HTML")')).toBeVisible();
    await expect(page.locator('button:has-text("📥 Télécharger ontowave.min.js")')).toBeVisible();
    await expect(page.locator('button:has-text("🔄 Réinitialiser")')).toBeVisible();
  });
});
