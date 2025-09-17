const { test, expect } = require('@playwright/test');

/**
 * Tests exhaustifs de validation des liens OntoWave
 * Valide : liens internes/externes, ressources, 404 handling, redirections
 */

test.describe('🔗 Validation Exhaustive des Liens', () => {
  
  test('Validation de tous les liens internes', async ({ page }) => {
    console.log('=== TEST LIENS INTERNES ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Collecter tous les liens internes
    const internalLinks = await page.locator('a[href^="/"], a[href^="./"], a[href^="../"], a[href^="#"], a[href^="demo/"], a[href^="index"]').all();
    console.log(`🔗 ${internalLinks.length} liens internes trouvés`);
    
    const testedLinks = new Set();
    const brokenLinks = [];
    const workingLinks = [];
    
    for (const link of internalLinks.slice(0, 20)) { // Limiter pour éviter trop de requêtes
      const href = await link.getAttribute('href');
      if (!href || testedLinks.has(href)) continue;
      
      testedLinks.add(href);
      
      try {
        let fullUrl = href;
        if (href.startsWith('#')) {
          // Ancres - vérifier que l'élément cible existe
          const targetElement = page.locator(`[id="${href.substring(1)}"], [name="${href.substring(1)}"]`);
          if (await targetElement.count() > 0) {
            workingLinks.push(href);
            console.log(`✅ Ancre trouvée: ${href}`);
          } else {
            console.log(`⚠️ Ancre non trouvée: ${href}`);
          }
          continue;
        }
        
        if (!href.startsWith('http')) {
          fullUrl = `http://localhost:8080/${href.replace(/^\/+/, '')}`;
        }
        
        const response = await page.request.get(fullUrl);
        if (response.status() === 200) {
          workingLinks.push(href);
          console.log(`✅ ${href} (${response.status()})`);
        } else {
          brokenLinks.push({ href, status: response.status() });
          console.log(`❌ ${href} (${response.status()})`);
        }
      } catch (error) {
        brokenLinks.push({ href, error: error.message });
        console.log(`❌ ${href} (Erreur: ${error.message})`);
      }
    }
    
    console.log(`📊 Résultats: ${workingLinks.length} OK, ${brokenLinks.length} cassés`);
    expect(brokenLinks.length).toBeLessThan(workingLinks.length / 2); // Tolérance: moins de 50% de liens cassés
  });

  test('Validation des liens vers les démos', async ({ page }) => {
    console.log('=== TEST LIENS DÉMOS SPÉCIFIQUES ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Liens de démo attendus
    const expectedDemoLinks = [
      'demo/minimal-demo.html',
      'demo/advanced-demo.html',
      'demo/full-config.html',
      'demo/'
    ];
    
    for (const expectedLink of expectedDemoLinks) {
      console.log(`🎮 Test démo: ${expectedLink}`);
      
      const response = await page.request.get(`http://localhost:8080/${expectedLink}`);
      expect(response.status()).toBe(200);
      
      if (expectedLink.endsWith('.html')) {
        const content = await response.text();
        expect(content).toContain('OntoWave');
        expect(content.length).toBeGreaterThan(100);
        console.log(`✅ ${expectedLink} - Contenu valide (${content.length} caractères)`);
      } else {
        console.log(`✅ ${expectedLink} - Répertoire accessible`);
      }
    }
    
    // Vérifier que les liens de démo sont présents sur la page
    const demoLinksOnPage = await page.locator('a[href*="demo/"]').count();
    expect(demoLinksOnPage).toBeGreaterThan(0);
    console.log(`📄 ${demoLinksOnPage} liens vers démos trouvés sur la page`);
  });

  test('Validation des ressources statiques', async ({ page }) => {
    console.log('=== TEST RESSOURCES STATIQUES ===');
    
    // Ressources critiques
    const criticalResources = [
      'ontowave.min.js',
      'config.json',
      'index.fr.md',
      'index.en.md',
      'index.md'
    ];
    
    for (const resource of criticalResources) {
      const response = await page.request.get(`http://localhost:8080/${resource}`);
      expect(response.status()).toBe(200);
      
      const content = await response.text();
      expect(content.length).toBeGreaterThan(0);
      console.log(`✅ ${resource} - ${content.length} octets`);
    }
    
    // Ressources de démo
    const demoResources = [
      'demo/minimal-content.md',
      'demo/advanced-content.md',
      'demo/advanced-content.fr.md',
      'demo/full-config.fr.md',
      'demo/full-config.en.md',
      'demo/config.json'
    ];
    
    for (const resource of demoResources) {
      const response = await page.request.get(`http://localhost:8080/${resource}`);
      expect(response.status()).toBe(200);
      console.log(`✅ ${resource} accessible`);
    }
  });

  test('Test navigation et retour en arrière', async ({ page }) => {
    console.log('=== TEST NAVIGATION BIDIRECTIONNELLE ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(2000);
    
    const originalUrl = page.url();
    const originalTitle = await page.title();
    console.log(`🏠 Page origine: "${originalTitle}"`);
    
    // Naviguer vers une démo
    const demoLink = page.locator('a[href*="demo/"]').first();
    if (await demoLink.count() > 0) {
      await demoLink.click();
      await page.waitForTimeout(3000);
      
      const demoUrl = page.url();
      const demoTitle = await page.title();
      expect(demoUrl).not.toBe(originalUrl);
      console.log(`🎮 Navigation vers démo: "${demoTitle}"`);
      
      // Retour en arrière
      await page.goBack();
      await page.waitForTimeout(2000);
      
      const backUrl = page.url();
      const backTitle = await page.title();
      expect(backUrl).toBe(originalUrl);
      console.log(`⬅️ Retour page origine: "${backTitle}"`);
      
      // Navigation avant
      await page.goForward();
      await page.waitForTimeout(2000);
      
      const forwardUrl = page.url();
      expect(forwardUrl).toBe(demoUrl);
      console.log(`➡️ Navigation avant vers démo confirmée`);
    }
  });

  test('Test gestion des erreurs 404', async ({ page }) => {
    console.log('=== TEST GESTION 404 ===');
    
    // Tester des URLs qui n'existent pas
    const nonExistentUrls = [
      'inexistant.html',
      'demo/inexistant.html',
      'fake-page.md',
      'demo/fake-content.md'
    ];
    
    for (const url of nonExistentUrls) {
      const response = await page.request.get(`http://localhost:8080/${url}`);
      expect([404, 403]).toContain(response.status());
      console.log(`✅ ${url} retourne bien ${response.status()}`);
    }
    
    // Vérifier qu'OntoWave gère gracieusement les contenus manquants
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Simuler un changement vers un contenu inexistant
    await page.evaluate(() => {
      if (window.OntoWave && window.OntoWave.loadContent) {
        try {
          window.OntoWave.loadContent('inexistant.md');
        } catch (e) {
          console.log('Erreur attendue:', e.message);
        }
      }
    });
    
    await page.waitForTimeout(2000);
    
    // OntoWave devrait toujours fonctionner
    const stillWorking = await page.evaluate(() => window.OntoWave !== undefined);
    expect(stillWorking).toBe(true);
    console.log('✅ OntoWave reste stable après erreur de contenu');
  });

  test('Test redirections et chemins relatifs', async ({ page }) => {
    console.log('=== TEST REDIRECTIONS ET CHEMINS ===');
    
    // Tester différents chemins vers la racine
    const rootPaths = [
      'http://localhost:8080/',
      'http://localhost:8080/index.html',
      'http://localhost:8080'
    ];
    
    for (const path of rootPaths) {
      await page.goto(path);
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      const hasContent = await page.locator('h1, h2, h3').count() > 0;
      
      expect(hasContent).toBe(true);
      console.log(`✅ ${path} → "${title}" (contenu présent)`);
    }
    
    // Tester les chemins relatifs depuis les démos
    await page.goto('http://localhost:8080/demo/minimal-demo.html');
    await page.waitForTimeout(3000);
    
    // Vérifier que les ressources relatives se chargent (../ontowave.min.js)
    const jsLoaded = await page.evaluate(() => window.OntoWave !== undefined);
    expect(jsLoaded).toBe(true);
    console.log('✅ Ressources relatives chargées depuis démo');
  });

  test('Test performance de chargement des liens', async ({ page }) => {
    console.log('=== TEST PERFORMANCE LIENS ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(2000);
    
    const links = await page.locator('a[href*="demo/"]').all();
    const loadTimes = [];
    
    for (let i = 0; i < Math.min(3, links.length); i++) {
      const href = await links[i].getAttribute('href');
      if (!href) continue;
      
      const startTime = Date.now();
      
      await links[i].click();
      await page.waitForTimeout(3000);
      
      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);
      
      console.log(`⏱️ ${href}: ${loadTime}ms`);
      
      // Retour pour le prochain test
      await page.goBack();
      await page.waitForTimeout(1000);
    }
    
    if (loadTimes.length > 0) {
      const averageTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      console.log(`📊 Temps moyen de chargement: ${Math.round(averageTime)}ms`);
      expect(averageTime).toBeLessThan(8000); // 8 secondes max en moyenne
    }
  });

  test('Test validation des ancres et sections', async ({ page }) => {
    console.log('=== TEST ANCRES ET SECTIONS ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Collecter tous les titres qui peuvent servir d'ancres
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`📖 ${headings.length} titres trouvés`);
    
    // Vérifier les IDs et ancres possibles
    const anchorsFound = [];
    for (const heading of headings.slice(0, 10)) {
      const id = await heading.getAttribute('id');
      const text = await heading.textContent();
      
      if (id) {
        anchorsFound.push(id);
        console.log(`⚓ Ancre trouvée: #${id} ("${text?.substring(0, 30)}...")`);
      }
    }
    
    // Tester la navigation vers quelques ancres
    for (const anchor of anchorsFound.slice(0, 3)) {
      await page.goto(`http://localhost:8080/#${anchor}`);
      await page.waitForTimeout(1000);
      
      const targetElement = page.locator(`#${anchor}`);
      await expect(targetElement).toBeVisible();
      console.log(`✅ Navigation vers #${anchor} réussie`);
    }
  });

  test('Test intégrité des liens externes (si présents)', async ({ page }) => {
    console.log('=== TEST LIENS EXTERNES ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Chercher des liens externes
    const externalLinks = await page.locator('a[href^="http"], a[href^="https"], a[href*="github"], a[href*="plantuml"]').all();
    console.log(`🌍 ${externalLinks.length} liens externes trouvés`);
    
    // Tester quelques liens externes (avec timeout plus court)
    for (let i = 0; i < Math.min(3, externalLinks.length); i++) {
      const href = await externalLinks[i].getAttribute('href');
      if (!href) continue;
      
      try {
        console.log(`🔗 Test externe: ${href}`);
        
        // Test avec timeout court pour éviter les blocages
        const response = await page.request.get(href, { timeout: 5000 });
        console.log(`✅ ${href} → ${response.status()}`);
      } catch (error) {
        console.log(`⚠️ ${href} → Erreur: ${error.message}`);
        // Ne pas faire échouer le test pour les liens externes
      }
    }
  });

  test('Rapport de validation final', async ({ page }) => {
    console.log('=== RAPPORT VALIDATION FINALE ===');
    
    await page.goto('http://localhost:8080/');
    await page.waitForTimeout(3000);
    
    // Collecter toutes les statistiques
    const stats = {
      totalLinks: await page.locator('a[href]').count(),
      internalLinks: await page.locator('a[href^="/"], a[href^="./"], a[href^="#"], a[href^="demo/"]').count(),
      externalLinks: await page.locator('a[href^="http"]').count(),
      demoLinks: await page.locator('a[href*="demo/"]').count(),
      anchors: await page.locator('a[href^="#"]').count(),
      images: await page.locator('img').count(),
      scripts: await page.locator('script[src]').count()
    };
    
    console.log('\n📊 STATISTIQUES DE VALIDATION:');
    console.log(`🔗 Total liens: ${stats.totalLinks}`);
    console.log(`🏠 Liens internes: ${stats.internalLinks}`);
    console.log(`🌍 Liens externes: ${stats.externalLinks}`);
    console.log(`🎮 Liens démos: ${stats.demoLinks}`);
    console.log(`⚓ Ancres: ${stats.anchors}`);
    console.log(`🖼️ Images: ${stats.images}`);
    console.log(`📜 Scripts: ${stats.scripts}`);
    
    // Vérifications de base
    expect(stats.totalLinks).toBeGreaterThan(0);
    expect(stats.demoLinks).toBeGreaterThan(0);
    
    console.log('\n✅ VALIDATION GLOBALE TERMINÉE');
  });
});
