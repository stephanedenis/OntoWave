import { test, expect } from '@playwright/test';

test.describe('OntoWave Configuration Panel - Final Improvements', () => {
  test('should show enlarged panel with 3 buttons and OntoWave.org branding', async ({ page }) => {
    await page.goto('http://localhost:8000/debug-test.html');
    
    // Attendre que OntoWave soit chargé avec plus de temps
    await page.waitForSelector('#ontowave-floating-menu', { timeout: 15000 });
    
    // Étape 1: Vérifier le branding OntoWave.org
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    
    // Attendre que le menu ait la classe expanded
    await page.waitForSelector('.ontowave-floating-menu.expanded', { timeout: 5000 });
    
    // Tester que le contenu OntoWave.org est présent même si l'élément a des problèmes de layout
    const ontoWaveBrand = page.locator('.ontowave-menu-brand');
    await expect(ontoWaveBrand).toContainText('OntoWave.org');
    
    // Attendre que le brand ait une largeur > 0 (fin de transition)
    await page.waitForFunction(() => {
      const brand = document.querySelector('.ontowave-menu-brand');
      return brand && brand.getBoundingClientRect().width > 0;
    }, { timeout: 5000 });
    
    const ontoWaveBrand = page.locator('.ontowave-menu-brand');
    await expect(ontoWaveBrand).toBeVisible();
    await expect(ontoWaveBrand).toContainText('OntoWave.org');
    
    // Vérifier que le .org a le bon style
    const orgSuffix = page.locator('.org-suffix');
    await expect(orgSuffix).toBeVisible();
    await expect(orgSuffix).toContainText('.org');
    
    // Étape 2: Ouvrir le panneau de configuration
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await configButton.click();
    
    // Étape 3: Vérifier la taille agrandie du panneau
    const configPanel = page.locator('#ontowave-config-panel');
    await expect(configPanel).toBeVisible();
    
    const panelBox = await configPanel.boundingBox();
    expect(panelBox.width).toBeGreaterThan(600); // Au moins 600px de large
    expect(panelBox.height).toBeGreaterThan(350); // Au moins 350px de haut
    
    // Étape 4: Vérifier la présence des 3 boutons
    const applyButton = page.locator('button:has-text("Appliquer")');
    const downloadHtmlButton = page.locator('button:has-text("Télécharger HTML")');
    const downloadScriptButton = page.locator('button:has-text("Télécharger ontowave.min.js")');
    
    await expect(applyButton).toBeVisible();
    await expect(downloadHtmlButton).toBeVisible();
    await expect(downloadScriptButton).toBeVisible();
    
    // Étape 5: Tester le fonctionnement du nouveau bouton de téléchargement
    const downloadPromise = page.waitForEvent('download');
    await downloadScriptButton.click();
    
    // Vérifier que le téléchargement commence
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('ontowave.min.js');
    
    // Étape 6: Vérifier que l'interface est bien organisée
    const formSection = page.locator('.config-form-compact');
    const previewSection = page.locator('.config-preview-compact');
    
    await expect(formSection).toBeVisible();
    await expect(previewSection).toBeVisible();
    
    // Vérifier que les sections sont côte à côte
    const formBox = await formSection.boundingBox();
    const previewBox = await previewSection.boundingBox();
    
    // Les deux sections doivent être approximativement à la même hauteur (côte à côte)
    expect(Math.abs(formBox.y - previewBox.y)).toBeLessThan(50);
  });

  test('should maintain responsive design with enlarged panel on mobile', async ({ page }) => {
    // Simuler un écran mobile
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('http://localhost:8000/minimal.html');
    
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
    
    // Sur mobile, le panneau devrait être responsive
    const panelBox = await configPanel.boundingBox();
    expect(panelBox.width).toBeGreaterThan(600); // Largeur minimale maintenue
    
    // Vérifier que les 3 boutons sont toujours visibles
    await expect(page.locator('button:has-text("Appliquer")')).toBeVisible();
    await expect(page.locator('button:has-text("Télécharger HTML")')).toBeVisible();
    await expect(page.locator('button:has-text("Télécharger ontowave.min.js")')).toBeVisible();
  });

  test('should test all three buttons functionality', async ({ page }) => {
    await page.goto('http://localhost:8000/minimal.html');
    
    // Ouvrir le panneau
    await page.waitForSelector('#ontowave-floating-menu');
    const menuIcon = page.locator('#ontowave-menu-icon');
    await menuIcon.click();
    
    const configButton = page.locator('.ontowave-menu-option:has-text("Configuration")');
    await configButton.click();
    
    await page.waitForSelector('#ontowave-config-panel');
    
    // Test du bouton Appliquer
    const titleInput = page.locator('#config-title-mini');
    await titleInput.clear();
    await titleInput.fill('Test Site');
    
    const applyButton = page.locator('button:has-text("Appliquer")');
    await applyButton.click();
    
    // Vérifier que le titre a changé
    await expect(page).toHaveTitle('Test Site');
    
    // Test du bouton Télécharger HTML
    const downloadHtmlPromise = page.waitForEvent('download');
    const downloadHtmlButton = page.locator('button:has-text("Télécharger HTML")');
    await downloadHtmlButton.click();
    
    const htmlDownload = await downloadHtmlPromise;
    expect(htmlDownload.suggestedFilename()).toBe('index.html');
    
    // Test du bouton Télécharger ontowave.min.js
    const downloadScriptPromise = page.waitForEvent('download');
    const downloadScriptButton = page.locator('button:has-text("Télécharger ontowave.min.js")');
    await downloadScriptButton.click();
    
    const scriptDownload = await downloadScriptPromise;
    expect(scriptDownload.suggestedFilename()).toBe('ontowave.min.js');
  });
});
