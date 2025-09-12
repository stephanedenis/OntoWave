const { test, expect } = require('@playwright/test');

test.describe('OntoWave Configuration Panel', () => {
  test('should show configuration panel in floating menu', async ({ page }) => {
    await page.goto('http://localhost:8081');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu');
    await page.waitForTimeout(2000);
    
    // Vérifier que la page normale est affichée (pas l'interface de config pleine page)
    await expect(page.locator('#ontowave-content')).toBeVisible();
    
    // D'abord ouvrir le menu en cliquant sur l'icône
    const menuIcon = page.locator('#ontowave-menu-icon');
    await expect(menuIcon).toBeVisible();
    await menuIcon.click();
    
    // Attendre que le menu soit étendu
    await page.waitForTimeout(500);
    
    // Maintenant trouver et cliquer sur le bouton Configuration
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await expect(configButton).toBeVisible();
    await configButton.click({ force: true });
    
    // Vérifier que le panneau de configuration apparaît
    await expect(page.locator('#ontowave-config-panel')).toBeVisible();
    await expect(page.locator('.config-panel-content')).toBeVisible();
    
    // Vérifier les éléments du formulaire compact
    await expect(page.locator('#config-title-mini')).toBeVisible();
    await expect(page.locator('#config-locales-mini')).toBeVisible();
    await expect(page.locator('#config-showGallery-mini')).toBeVisible();
    
    // Vérifier la prévisualisation de code
    await expect(page.locator('.code-preview-mini')).toBeVisible();
  });

  test('should allow updating configuration from panel', async ({ page }) => {
    await page.goto('http://localhost:8081');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu');
    await page.waitForTimeout(2000);
    
    // Ouvrir le menu puis le panneau de configuration
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    await page.waitForTimeout(500);
    
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await configButton.click({ force: true });
    
    // Attendre que le panneau soit visible
    await page.waitForSelector('#ontowave-config-panel');
    
    // Modifier le titre
    const titleInput = page.locator('#config-title-mini');
    await titleInput.clear();
    await titleInput.fill('Mon nouveau site');
    
    // Modifier les locales
    const localesInput = page.locator('#config-locales-mini');
    await localesInput.clear();
    await localesInput.fill('fr, en, es');
    
    // Cocher la galerie
    const galleryCheckbox = page.locator('#config-showGallery-mini');
    await galleryCheckbox.check();
    
    // Appliquer les changements
    const applyButton = page.locator('button:has-text("Appliquer")');
    await applyButton.click();
    
    // Vérifier que le titre de la page a changé
    await expect(page).toHaveTitle('Mon nouveau site');
    
    // Vérifier que le code généré est mis à jour
    const generatedCode = page.locator('#generated-html-mini');
    await expect(generatedCode).toContainText('Mon nouveau site');
  });

  test('should toggle panel on and off', async ({ page }) => {
    await page.goto('http://localhost:8081');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu');
    await page.waitForTimeout(2000);
    
    // Ouvrir le menu
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    await page.waitForTimeout(500);
    
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    
    // Ouvrir le panneau
    await configButton.click({ force: true });
    await expect(page.locator('#ontowave-config-panel')).toBeVisible();
    
    // Fermer le panneau (toggle off)
    await configButton.click({ force: true });
    await expect(page.locator('#ontowave-config-panel')).not.toBeVisible();
    
    // Rouvrir le panneau (toggle on)
    await configButton.click({ force: true });
    await expect(page.locator('#ontowave-config-panel')).toBeVisible();
  });

  test('should have download functionality', async ({ page }) => {
    await page.goto('http://localhost:8081');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu');
    await page.waitForTimeout(2000);
    
    // Ouvrir le menu puis le panneau de configuration
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    await page.waitForTimeout(500);
    
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await configButton.click({ force: true });
    
    await page.waitForSelector('#ontowave-config-panel');
    
    // Vérifier que le bouton de téléchargement existe
    const downloadButton = page.locator('button:has-text("Télécharger HTML")');
    await expect(downloadButton).toBeVisible();
    
    // Préparer la capture du téléchargement
    const downloadPromise = page.waitForEvent('download');
    
    // Cliquer sur le bouton de téléchargement
    await downloadButton.click();
    
    // Vérifier que le téléchargement commence
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('index.html');
  });
});
