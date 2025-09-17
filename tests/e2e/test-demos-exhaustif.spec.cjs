const { test, expect } = require('@playwright/test');

/**
 * Tests exhaustifs pour toutes les démos OntoWave
 * Valide : minimal-demo, advanced-demo, full-config avec leurs fonctionnalités
 */

test.describe('🎮 Tests Démos Complètes OntoWave', () => {
  
  test('Démo minimale - Fonctionnement complet', async ({ page }) => {
    console.log('=== TEST DÉMO MINIMALE ===');
    
    await page.goto('http://localhost:8080/demo/minimal-demo.html');
    await page.waitForTimeout(3000);
    
    // Vérifier le chargement de base
    await expect(page).toHaveTitle(/Minimal Demo/);
    console.log('✅ Page démo minimale chargée');
    
    // Vérifier que OntoWave est chargé
    const ontoWaveLoaded = await page.evaluate(() => window.OntoWave !== undefined);
    expect(ontoWaveLoaded).toBe(true);
    console.log('✅ OntoWave chargé dans démo minimale');
    
    // Vérifier le contenu rendu
    const contentPresent = await page.locator('h1, h2, h3').first().isVisible();
    expect(contentPresent).toBe(true);
    
    const titleText = await page.locator('h1').first().textContent();
    expect(titleText).toContain('OntoWave');
    console.log(`✅ Titre démo minimale: "${titleText}"`);
    
    // Vérifier que le contenu markdown est rendu
    const paragraphs = await page.locator('p').count();
    expect(paragraphs).toBeGreaterThan(0);
    console.log(`✅ ${paragraphs} paragraphes rendus`);
    
    // Vérifier la configuration minimale
    const config = await page.evaluate(() => window.ontoWaveConfig);
    expect(config).toBeDefined();
    expect(config.locales).toContain('fr');
    console.log('✅ Configuration minimale valide');
  });

  test('Démo avancée - Fonctionnalités étendues', async ({ page }) => {
    console.log('=== TEST DÉMO AVANCÉE ===');
    
    await page.goto('http://localhost:8080/demo/advanced-demo.html');
    await page.waitForTimeout(4000);
    
    // Vérifier le chargement
    await expect(page).toHaveTitle(/Advanced Demo/);
    console.log('✅ Page démo avancée chargée');
    
    // Vérifier OntoWave avec fonctionnalités avancées
    const config = await page.evaluate(() => window.ontoWaveConfig);
    expect(config).toBeDefined();
    expect(config.locales.length).toBeGreaterThan(1);
    console.log(`✅ Support multilingue: ${config.locales.join(', ')}`);
    
    // Vérifier le contenu multilingue
    const mainContent = await page.textContent('body');
    expect(mainContent.length).toBeGreaterThan(500);
    console.log(`✅ Contenu avancé rendu (${mainContent.length} caractères)`);
    
    // Vérifier les boutons de langue si présents
    const langButtons = await page.locator('[onclick*="setLanguage"], [data-lang]').count();
    if (langButtons > 0) {
      console.log(`✅ ${langButtons} boutons de langue disponibles`);
      
      // Tester le changement de langue
      const firstLangButton = page.locator('[onclick*="setLanguage"], [data-lang]').first();
      await firstLangButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Changement de langue testé');
    }
    
    // Vérifier les styles MkDocs-like mentionnés
    const styledElements = await page.locator('[class*="md-"], [class*="mkdocs"], .content').count();
    console.log(`✅ ${styledElements} éléments stylés détectés`);
  });

  test('Démo configuration complète - Toutes fonctionnalités', async ({ page }) => {
    console.log('=== TEST DÉMO CONFIGURATION COMPLÈTE ===');
    
    await page.goto('http://localhost:8080/demo/full-config.html');
    await page.waitForTimeout(4000);
    
    // Vérifier le chargement
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    console.log(`✅ Page full-config chargée: "${title}"`);
    
    // Vérifier la configuration complète
    const config = await page.evaluate(() => window.ontoWaveConfig);
    expect(config).toBeDefined();
    console.log('✅ Configuration complète présente');
    
    // Vérifier les fonctionnalités activées
    const features = [];
    if (config.enablePrism) features.push('Prism');
    if (config.enableMermaid) features.push('Mermaid');
    if (config.enablePlantUML) features.push('PlantUML');
    if (config.enableSearch) features.push('Search');
    
    console.log(`✅ Fonctionnalités activées: ${features.join(', ')}`);
    expect(features.length).toBeGreaterThan(0);
    
    // Vérifier le contenu rendu
    const contentElements = await page.locator('h1, h2, h3, p').count();
    expect(contentElements).toBeGreaterThan(3);
    console.log(`✅ ${contentElements} éléments de contenu rendus`);
    
    // Vérifier les fonctionnalités UI
    if (config.ui) {
      if (config.ui.showMenu) {
        console.log('✅ Menu activé dans configuration');
      }
      if (config.ui.showConfiguration) {
        console.log('✅ Panneau de configuration activé');
      }
    }
  });

  test('Test de tous les fichiers de contenu démo', async ({ page }) => {
    console.log('=== TEST FICHIERS CONTENU DÉMO ===');
    
    // Tester l'accès aux fichiers de contenu
    const contentFiles = [
      'minimal-content.md',
      'advanced-content.md',
      'advanced-content.fr.md',
      'full-config.fr.md',
      'full-config.en.md'
    ];
    
    for (const file of contentFiles) {
      const response = await page.request.get(`http://localhost:8080/demo/${file}`);
      expect(response.status()).toBe(200);
      
      const content = await response.text();
      expect(content.length).toBeGreaterThan(10);
      console.log(`✅ ${file}: ${content.length} caractères`);
    }
  });

  test('Navigation entre démos', async ({ page }) => {
    console.log('=== TEST NAVIGATION ENTRE DÉMOS ===');
    
    // Démarrer depuis la page principale
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(2000);
    
    // Chercher et cliquer sur les liens vers les démos
    const demoLinks = await page.locator('a[href*="demo/"]').all();
    console.log(`✅ ${demoLinks.length} liens vers démos trouvés sur page principale`);
    
    for (let i = 0; i < Math.min(3, demoLinks.length); i++) {
      const link = demoLinks[i];
      const href = await link.getAttribute('href');
      
      if (href && href.includes('.html')) {
        console.log(`🔗 Test navigation vers: ${href}`);
        
        // Ouvrir dans un nouvel onglet pour préserver le contexte
        const [newPage] = await Promise.all([
          page.context().waitForEvent('page'),
          link.click({ modifiers: ['Meta'] }) // Cmd/Ctrl+click
        ]);
        
        await newPage.waitForTimeout(3000);
        
        // Vérifier que la démo se charge
        const newTitle = await newPage.title();
        expect(newTitle.length).toBeGreaterThan(0);
        console.log(`✅ Démo chargée: "${newTitle}"`);
        
        // Vérifier qu'OntoWave fonctionne
        const ontoWavePresent = await newPage.evaluate(() => window.OntoWave !== undefined);
        expect(ontoWavePresent).toBe(true);
        
        await newPage.close();
      }
    }
  });

  test('Test responsivité des démos', async ({ page }) => {
    console.log('=== TEST RESPONSIVITÉ DÉMOS ===');
    
    const demos = [
      'demo/minimal-demo.html',
      'demo/advanced-demo.html',
      'demo/full-config.html'
    ];
    
    const viewports = [
      { width: 1200, height: 800, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const demo of demos) {
      console.log(`📱 Test responsivité: ${demo}`);
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(`http://localhost:8080/${demo}`);
        await page.waitForTimeout(2000);
        
        // Vérifier que le contenu est visible
        const contentVisible = await page.locator('h1, h2, h3').first().isVisible();
        expect(contentVisible).toBe(true);
        
        console.log(`✅ ${demo} - ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
    }
    
    // Remettre le viewport par défaut
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('Test des erreurs et récupération', async ({ page }) => {
    console.log('=== TEST GESTION ERREURS ===');
    
    // Capturer les erreurs
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // Tester une démo
    await page.goto('http://localhost:8080/demo/minimal-demo.html');
    await page.waitForTimeout(3000);
    
    // Filtrer les erreurs critiques
    const criticalErrors = errors.filter(error => 
      !error.includes('404') &&
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError') &&
      !error.includes('config.json')
    );
    
    console.log(`📊 Erreurs détectées: ${errors.length} total, ${criticalErrors.length} critiques`);
    expect(criticalErrors.length).toBe(0);
    
    // Vérifier que même avec des erreurs mineures, OntoWave fonctionne
    const ontoWaveWorking = await page.evaluate(() => {
      return window.OntoWave && document.querySelector('h1');
    });
    expect(ontoWaveWorking).toBe(true);
    console.log('✅ OntoWave fonctionne malgré erreurs mineures');
  });
});
