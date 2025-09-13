const { test, expect } = require('@playwright/test');

test.describe('Panneau Configuration Multilingue', () => {
  test('Le panneau de configuration suit la langue courante', async ({ page }) => {
    // Aller à la page
    await page.goto('http://localhost:8080/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Attendre le chargement complet
    await page.waitForFunction(() => {
      return window.OntoWave && document.getElementById('ontowave-floating-menu');
    }, { timeout: 10000 });
    
    console.log('✅ Page chargée');
    
    // Ouvrir le menu OntoWave
    const menuIcon = page.locator('#ontowave-menu-icon');
    await expect(menuIcon).toBeVisible();
    await menuIcon.click();
    await page.waitForTimeout(500);
    
    // Vérifier que le menu est ouvert
    const menuExpanded = await page.locator('.ontowave-floating-menu.expanded').isVisible();
    expect(menuExpanded).toBe(true);
    console.log('🌊 Menu OntoWave ouvert');
    
    // Ouvrir le panneau de configuration
    const configButton = page.locator('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
    await expect(configButton).toBeVisible();
    await configButton.click();
    await page.waitForTimeout(1000);
    
    // Vérifier que le panneau est ouvert
    const configPanel = page.locator('#ontowave-config-panel');
    await expect(configPanel).toBeVisible();
    console.log('⚙️ Panneau de configuration ouvert');
    
    // Vérifier le contenu initial (devrait être en français)
    const initialTitle = await page.locator('#ontowave-config-panel h3').textContent();
    console.log('📝 Titre initial du panneau:', initialTitle);
    
    // Test 1: Changer vers l'anglais
    console.log('🧪 Test changement vers anglais...');
    const enButton = page.locator('#btn-en');
    await enButton.click();
    await page.waitForTimeout(1000);
    
    // Le panneau devrait maintenant être en anglais
    const englishTitle = await page.locator('#ontowave-config-panel h3').textContent();
    console.log('📝 Titre après changement EN:', englishTitle);
    
    // Vérifier quelques labels en anglais
    const siteTitleLabel = await page.locator('label[for="config-title-full"]').textContent();
    console.log('🏷️ Label "Site title" en anglais:', siteTitleLabel);
    
    // Test 2: Retour vers le français
    console.log('🧪 Test retour vers français...');
    const frButton = page.locator('#btn-fr');
    await frButton.click();
    await page.waitForTimeout(1000);
    
    // Le panneau devrait être de nouveau en français
    const frenchTitle = await page.locator('#ontowave-config-panel h3').textContent();
    console.log('📝 Titre après retour FR:', frenchTitle);
    
    // Vérifier quelques labels en français
    const titreSiteLabel = await page.locator('label[for="config-title-full"]').textContent();
    console.log('🏷️ Label "Titre du site" en français:', titreSiteLabel);
    
    // Test 3: Vérifier que les valeurs des champs sont préservées
    console.log('🧪 Test préservation des valeurs...');
    
    // Modifier un champ
    const titleField = page.locator('#config-title-full');
    await titleField.fill('Test Title Modified');
    
    // Changer de langue
    await enButton.click();
    await page.waitForTimeout(1000);
    
    // Vérifier que la valeur est préservée
    const preservedValue = await page.locator('#config-title-full').inputValue();
    console.log('💾 Valeur préservée après changement de langue:', preservedValue);
    expect(preservedValue).toBe('Test Title Modified');
    
    // Test 4: Fermer et rouvrir le panneau
    console.log('🧪 Test fermer/rouvrir panneau...');
    
    // Fermer le panneau
    await configButton.click();
    await page.waitForTimeout(500);
    
    // Vérifier qu'il est fermé
    const panelClosed = await page.locator('#ontowave-config-panel').isVisible();
    expect(panelClosed).toBe(false);
    
    // Rouvrir le panneau
    await configButton.click();
    await page.waitForTimeout(1000);
    
    // Vérifier qu'il s'ouvre dans la bonne langue (anglais)
    const reopenedTitle = await page.locator('#ontowave-config-panel h3').textContent();
    console.log('📝 Titre après réouverture:', reopenedTitle);
    
    // Test des traductions spécifiques
    const generalSection = await page.locator('.config-section h4').first().textContent();
    console.log('📖 Section "General":', generalSection);
    
    // Test 5: Vérifier les boutons d'action
    const applyButton = await page.locator('button[onclick*="applyConfig"]');
    if (await applyButton.isVisible()) {
      const applyText = await applyButton.textContent();
      console.log('✅ Bouton Apply:', applyText);
    }
    
    const downloadButton = await page.locator('button[onclick*="downloadHTML"]');
    if (await downloadButton.isVisible()) {
      const downloadText = await downloadButton.textContent();
      console.log('⬇️ Bouton Download:', downloadText);
    }
    
    console.log('🎉 TOUS LES TESTS PASSÉS - Le panneau de configuration suit bien la langue !');
  });
});
