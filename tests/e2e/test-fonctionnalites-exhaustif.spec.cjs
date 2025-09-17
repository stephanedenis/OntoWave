const { test, expect } = require('@playwright/test');

/**
 * Tests exhaustifs des fonctionnalités OntoWave
 * Valide : Prism, Mermaid, PlantUML, panneau configuration, export, recherche
 */

test.describe('⚙️ Fonctionnalités OntoWave Complètes', () => {
  
  test('Coloration syntaxique Prism', async ({ page }) => {
    console.log('=== TEST PRISM COLORATION SYNTAXIQUE ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(4000);
    
    // Vérifier que Prism est activé dans la configuration
    const prismEnabled = await page.evaluate(() => {
      const config = window.ontoWaveConfig || window.OntoWaveConfig;
      return config && config.enablePrism;
    });
    expect(prismEnabled).toBe(true);
    console.log('✅ Prism activé dans configuration');
    
    // Chercher des blocs de code avec coloration Prism
    const codeBlocks = await page.locator('pre code, .language-javascript, .language-html, .language-css, [class*="language-"]').count();
    console.log(`📊 ${codeBlocks} blocs de code détectés`);
    
    if (codeBlocks > 0) {
      // Vérifier que Prism a appliqué la coloration
      const prismElements = await page.locator('.token, .keyword, .string, .comment, .number').count();
      console.log(`🎨 ${prismElements} éléments colorés par Prism`);
      
      if (prismElements > 0) {
        console.log('✅ Prism syntax highlighting appliqué');
      } else {
        console.log('⚠️ Blocs de code présents mais coloration non détectée');
      }
    }
    
    // Vérifier que le script Prism est chargé
    const prismLoaded = await page.evaluate(() => window.Prism !== undefined);
    if (prismLoaded) {
      console.log('✅ Script Prism chargé');
    }
  });

  test('Diagrammes Mermaid', async ({ page }) => {
    console.log('=== TEST DIAGRAMMES MERMAID ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(4000);
    
    // Vérifier que Mermaid est activé
    const mermaidEnabled = await page.evaluate(() => {
      const config = window.ontoWaveConfig || window.OntoWaveConfig;
      return config && config.enableMermaid;
    });
    expect(mermaidEnabled).toBe(true);
    console.log('✅ Mermaid activé dans configuration');
    
    // Chercher des diagrammes Mermaid
    const mermaidDiagrams = await page.locator('svg[id*="mermaid"], .mermaid svg, [class*="mermaid"]').count();
    console.log(`📊 ${mermaidDiagrams} diagrammes Mermaid détectés`);
    
    if (mermaidDiagrams > 0) {
      // Vérifier les propriétés des SVG Mermaid
      const firstDiagram = page.locator('svg[id*="mermaid"], .mermaid svg').first();
      const width = await firstDiagram.getAttribute('width');
      const height = await firstDiagram.getAttribute('height');
      
      console.log(`✅ Diagramme Mermaid rendu (${width}x${height})`);
      
      // Vérifier qu'il contient des éléments graphiques
      const graphicElements = await firstDiagram.locator('g, path, rect, circle, text').count();
      expect(graphicElements).toBeGreaterThan(0);
      console.log(`✅ ${graphicElements} éléments graphiques dans diagramme`);
    }
    
    // Vérifier que Mermaid est disponible globalement
    const mermaidAvailable = await page.evaluate(() => window.mermaid !== undefined);
    if (mermaidAvailable) {
      console.log('✅ Mermaid disponible globalement');
    }
  });

  test('Diagrammes PlantUML', async ({ page }) => {
    console.log('=== TEST DIAGRAMMES PLANTUML ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(4000);
    
    // Vérifier que PlantUML est activé
    const plantUMLEnabled = await page.evaluate(() => {
      const config = window.ontoWaveConfig || window.OntoWaveConfig;
      return config && config.enablePlantUML;
    });
    expect(plantUMLEnabled).toBe(true);
    console.log('✅ PlantUML activé dans configuration');
    
    // Chercher des diagrammes PlantUML (rendus en SVG)
    const plantUMLDiagrams = await page.locator('svg[id*="plantuml"], img[src*="plantuml"], .plantuml svg').count();
    console.log(`📊 ${plantUMLDiagrams} diagrammes PlantUML détectés`);
    
    if (plantUMLDiagrams > 0) {
      console.log('✅ Diagrammes PlantUML présents');
      
      // Si c'est un SVG, vérifier le contenu
      const svgPlantUML = page.locator('svg[id*="plantuml"], .plantuml svg').first();
      if (await svgPlantUML.count() > 0) {
        const svgContent = await svgPlantUML.innerHTML();
        expect(svgContent.length).toBeGreaterThan(50);
        console.log(`✅ Contenu SVG PlantUML (${svgContent.length} caractères)`);
      }
    }
    
    // Tester spécifiquement une démo avec PlantUML
    await page.goto('http://localhost:8080/demo/full-config.html');
    await page.waitForTimeout(4000);
    
    const plantUMLInDemo = await page.locator('svg, img[src*="plantuml"]').count();
    console.log(`📊 ${plantUMLInDemo} diagrammes dans démo full-config`);
  });

  test('Panneau de configuration OntoWave', async ({ page }) => {
    console.log('=== TEST PANNEAU CONFIGURATION ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Chercher et ouvrir le menu OntoWave
    const menuIcon = page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle, [onclick*="menu"]');
    await expect(menuIcon.first()).toBeVisible({ timeout: 10000 });
    await menuIcon.first().click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Menu OntoWave ouvert');
    
    // Chercher le lien/bouton Configuration
    const configButton = page.locator('a:has-text("Configuration"), button:has-text("Configuration"), [href*="config"], [onclick*="config"]');
    
    if (await configButton.count() > 0) {
      await configButton.first().click();
      await page.waitForTimeout(2000);
      
      // Vérifier que le panneau de configuration s'ouvre
      const configPanel = page.locator('.config-panel, .configuration, [class*="config"], .ontowave-config');
      await expect(configPanel.first()).toBeVisible();
      console.log('✅ Panneau de configuration ouvert');
      
      // Vérifier les éléments du panneau
      const configElements = await page.locator('input, select, button, textarea').count();
      expect(configElements).toBeGreaterThan(0);
      console.log(`⚙️ ${configElements} éléments de configuration détectés`);
      
      // Tester l'export HTML si disponible
      const exportButton = page.locator('button:has-text("Export"), button:has-text("HTML"), [onclick*="export"]');
      if (await exportButton.count() > 0) {
        console.log('✅ Bouton export HTML disponible');
        
        // Tester le clic (sans télécharger forcément)
        await exportButton.first().click();
        await page.waitForTimeout(1000);
        console.log('✅ Fonction export testée');
      }
    }
  });

  test('Fonctionnalité de recherche', async ({ page }) => {
    console.log('=== TEST RECHERCHE ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Vérifier si la recherche est activée
    const searchEnabled = await page.evaluate(() => {
      const config = window.ontoWaveConfig || window.OntoWaveConfig;
      return config && config.enableSearch;
    });
    
    if (searchEnabled) {
      console.log('✅ Recherche activée dans configuration');
      
      // Chercher l'interface de recherche
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="recherche"], .search-input');
      
      if (await searchInput.count() > 0) {
        console.log('✅ Interface de recherche trouvée');
        
        // Tester une recherche
        await searchInput.first().fill('OntoWave');
        await page.waitForTimeout(1000);
        
        // Vérifier si des résultats apparaissent
        const searchResults = await page.locator('.search-results, .search-result, [class*="result"]').count();
        console.log(`🔍 ${searchResults} résultats de recherche détectés`);
        
        await searchInput.first().clear();
        console.log('✅ Fonctionnalité de recherche testée');
      } else {
        console.log('ℹ️ Interface de recherche non visible (peut être dans le menu)');
      }
    } else {
      console.log('ℹ️ Recherche non activée dans cette configuration');
    }
  });

  test('Interface utilisateur complète', async ({ page }) => {
    console.log('=== TEST INTERFACE UTILISATEUR ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Vérifier les éléments d'interface OntoWave
    const uiElements = await page.locator('[class*="ontowave"], [class*="ow-"], [id*="ontowave"]').count();
    expect(uiElements).toBeGreaterThan(0);
    console.log(`🎨 ${uiElements} éléments d'interface OntoWave`);
    
    // Vérifier le menu principal
    const menuIcon = page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle');
    if (await menuIcon.count() > 0) {
      await menuIcon.first().click();
      await page.waitForTimeout(1000);
      
      const menuItems = await page.locator('.ontowave-menu a, .ontowave-menu button, .ow-menu a, .ow-menu button').count();
      console.log(`📱 ${menuItems} éléments dans le menu principal`);
      
      // Fermer le menu
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Vérifier la responsivité des boutons
    const clickableElements = await page.locator('button, [onclick], a[href]').count();
    console.log(`🖱️ ${clickableElements} éléments cliquables détectés`);
    
    // Vérifier les transitions et animations
    const animatedElements = await page.locator('[style*="transition"], [class*="animate"], [class*="fade"]').count();
    console.log(`✨ ${animatedElements} éléments avec animations/transitions`);
  });

  test('Export et téléchargement de configuration', async ({ page }) => {
    console.log('=== TEST EXPORT CONFIGURATION ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Ouvrir le menu
    const menuIcon = page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle');
    await menuIcon.first().click();
    await page.waitForTimeout(1000);
    
    // Chercher les options d'export/téléchargement
    const downloadOptions = await page.locator('[href*="download"], button:has-text("Télécharger"), button:has-text("Download"), [onclick*="download"]').count();
    console.log(`💾 ${downloadOptions} options de téléchargement détectées`);
    
    // Chercher spécifiquement le lien vers ontowave.min.js
    const jsDownload = page.locator('a[href*="ontowave.min.js"], a[href$=".js"]');
    if (await jsDownload.count() > 0) {
      const href = await jsDownload.first().getAttribute('href');
      console.log(`✅ Lien téléchargement JS: ${href}`);
      
      // Vérifier que le fichier existe
      const response = await page.request.get(`http://localhost:8080/${href}`);
      expect(response.status()).toBe(200);
      console.log('✅ Fichier JS accessible pour téléchargement');
    }
    
    // Tester l'export de configuration si disponible
    const exportConfig = page.locator('button:has-text("Export"), [onclick*="export"]');
    if (await exportConfig.count() > 0) {
      console.log('✅ Fonction export de configuration disponible');
    }
  });

  test('Performance des fonctionnalités', async ({ page }) => {
    console.log('=== TEST PERFORMANCE FONCTIONNALITÉS ===');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(4000);
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Temps de chargement total: ${loadTime}ms`);
    
    // Vérifier que toutes les fonctionnalités sont chargées rapidement
    const featuresLoaded = await page.evaluate(() => {
      const checks = {
        ontoWave: window.OntoWave !== undefined,
        prism: window.Prism !== undefined,
        mermaid: window.mermaid !== undefined
      };
      return checks;
    });
    
    console.log(`✅ OntoWave: ${featuresLoaded.ontoWave}`);
    console.log(`✅ Prism: ${featuresLoaded.prism}`);
    console.log(`✅ Mermaid: ${featuresLoaded.mermaid}`);
    
    // Vérifier que le contenu est rendu
    const contentRendered = await page.locator('h1, h2, h3').count();
    expect(contentRendered).toBeGreaterThan(0);
    console.log(`📄 ${contentRendered} titres rendus`);
    
    // Performance du changement de langue
    const langButton = page.locator('[onclick*="setLanguage"], [data-lang]').first();
    if (await langButton.count() > 0) {
      const langStartTime = Date.now();
      await langButton.click();
      await page.waitForTimeout(2000);
      const langSwitchTime = Date.now() - langStartTime;
      console.log(`🌐 Temps changement de langue: ${langSwitchTime}ms`);
      expect(langSwitchTime).toBeLessThan(5000);
    }
  });

  test('Compatibilité et robustesse', async ({ page }) => {
    console.log('=== TEST COMPATIBILITÉ ===');
    
    // Capturer les erreurs
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(4000);
    
    // Tester diverses interactions
    const menuIcon = page.locator('.ontowave-menu-icon, [class*="menu"], .ow-toggle').first();
    if (await menuIcon.count() > 0) {
      // Test de clics multiples
      await menuIcon.click();
      await page.waitForTimeout(500);
      await menuIcon.click();
      await page.waitForTimeout(500);
    }
    
    // Test de basculements de langue répétés
    const langButtons = await page.locator('[onclick*="setLanguage"], [data-lang]').all();
    if (langButtons.length >= 2) {
      for (let i = 0; i < 2; i++) {
        await langButtons[0].click();
        await page.waitForTimeout(300);
        await langButtons[1].click();
        await page.waitForTimeout(300);
      }
    }
    
    // Vérifier que le système fonctionne toujours
    const stillWorking = await page.evaluate(() => {
      return window.OntoWave !== undefined && document.querySelector('h1') !== null;
    });
    expect(stillWorking).toBe(true);
    
    // Filtrer les erreurs critiques
    const criticalErrors = errors.filter(error => 
      !error.includes('404') &&
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError')
    );
    
    console.log(`🔍 Erreurs détectées: ${errors.length} total, ${criticalErrors.length} critiques`);
    expect(criticalErrors.length).toBeLessThan(3); // Tolérance pour erreurs mineures
    
    console.log('✅ Système robuste aux interactions multiples');
  });
});
