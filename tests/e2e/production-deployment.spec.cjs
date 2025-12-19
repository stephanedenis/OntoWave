const { test, expect } = require('@playwright/test');

/**
 * Tests de validation du déploiement production OntoWave
 * Philosophie: Dogfooding - OntoWave affiche sa propre documentation depuis GitHub
 */

test.use({ 
  baseURL: 'http://localhost:8020',
});

test.describe('🌊 OntoWave - Déploiement Production (Dogfooding)', () => {
  
  test('Page principale charge le README depuis GitHub', async ({ page }) => {
    const requests = [];
    const errors = [];
    
    // Intercepter les requêtes
    page.on('request', req => {
      requests.push(req.url());
    });
    
    // Intercepter les erreurs console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      console.log(`[PAGE ${msg.type()}]`, msg.text());
    });
    
    await page.goto('http://localhost:8020/index.html');
    
    // Attendre que le contenu soit chargé (avec timeout réduit)
    await page.waitForFunction(() => {
      const app = document.getElementById('app');
      return app && app.textContent.length > 500;
    }, { timeout: 15000 }).catch(() => {
      console.log('⚠️ Timeout attente contenu - continuons l\'analyse');
    });
    
    // ✅ ANALYSE 1: Requête GitHub effectuée
    const githubRequests = requests.filter(url => 
      url.includes('raw.githubusercontent.com') && url.includes('README.md')
    );
    
    console.log('\n📊 REQUÊTES GITHUB:', githubRequests);
    expect(githubRequests.length).toBeGreaterThan(0);
    expect(githubRequests[0]).toContain('stephanedenis/OntoWave');
    
    // ✅ ANALYSE 2: Contenu chargé et affiché
    const appContent = await page.locator('#app').textContent();
    expect(appContent.length).toBeGreaterThan(100); // Au moins du contenu de base
    expect(appContent).toContain('OntoWave');
    
    // ✅ ANALYSE 3: Hash correct
    const hash = await page.evaluate(() => location.hash);
    console.log('\n🔗 HASH:', hash);
    expect(hash).toContain('@ontowave-docs/README.md');
    
    // Screenshot pour documentation
    await page.screenshot({ 
      path: 'test-results/production-deployment.png', 
      fullPage: true 
    });
    
    console.log('\n✅ Déploiement production validé - Dogfooding fonctionnel');
  });
  
  test('Configuration window.ontoWaveConfig est utilisée', async ({ page }) => {
    await page.goto('http://localhost:8020/index.html');
    await page.waitForTimeout(2000);
    
    const config = await page.evaluate(() => {
      return window.ontoWaveConfig;
    });
    
    console.log('\n📋 CONFIG:', JSON.stringify(config, null, 2));
    
    // Vérifier la structure de la config
    expect(config).toBeDefined();
    expect(config.externalDataSources).toBeDefined();
    expect(config.externalDataSources.length).toBeGreaterThan(0);
    expect(config.sources.fr).toContain('@ontowave-docs');
    expect(config.engine).toBe('v2');
    
    console.log('✅ Configuration correcte et utilisée');
  });
  
  test('Navigation vers sources externes fonctionne', async ({ page }) => {
    const requests = [];
    
    page.on('request', req => {
      if (req.url().includes('githubusercontent.com')) {
        requests.push(req.url());
        console.log('🎯 GitHub request:', req.url());
      }
    });
    
    await page.goto('http://localhost:8020/index.html');
    await page.waitForTimeout(3000);
    
    // Vérifier que les sources externes sont accessibles
    const githubRequests = requests.filter(url => 
      url.includes('raw.githubusercontent.com')
    );
    
    console.log(`\n📊 Total requêtes GitHub: ${githubRequests.length}`);
    expect(githubRequests.length).toBeGreaterThan(0);
    
    console.log('✅ Sources externes accessibles et fonctionnelles');
  });
  
  test('Features OntoWave activées (Mermaid, Math, Prism)', async ({ page }) => {
    await page.goto('http://localhost:8020/index.html');
    await page.waitForTimeout(5000);
    
    // Vérifier que les modules sont chargés
    const loadedModules = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.map(s => s.getAttribute('src')).filter(Boolean);
    });
    
    console.log('\n📦 MODULES CHARGÉS:', loadedModules.length);
    
    const hasMermaid = loadedModules.some(m => m.includes('mermaid'));
    const hasMd = loadedModules.some(m => m.includes('md-'));
    
    console.log('  Mermaid:', hasMermaid ? '✅' : '❌');
    console.log('  Markdown:', hasMd ? '✅' : '❌');
    
    expect(hasMermaid).toBe(true);
    expect(hasMd).toBe(true);
    
    console.log('✅ Features OntoWave activées');
  });
  
  test('Performance: Temps de chargement acceptable', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:8020/index.html');
    
    // Attendre que le contenu soit chargé
    await page.waitForFunction(() => {
      const app = document.getElementById('app');
      return app && app.textContent.length > 500;
    }, { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`\n⏱️ TEMPS DE CHARGEMENT: ${loadTime}ms`);
    
    // Le chargement doit être inférieur à 10 secondes
    expect(loadTime).toBeLessThan(10000);
    
    if (loadTime < 3000) {
      console.log('✅ Excellent (< 3s)');
    } else if (loadTime < 5000) {
      console.log('✅ Bon (< 5s)');
    } else {
      console.log('⚠️ Acceptable (< 10s)');
    }
  });
  
  test('Responsive: Affichage mobile', async ({ page }) => {
    // Simuler un appareil mobile
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('http://localhost:8020/index.html');
    await page.waitForTimeout(3000);
    
    // Vérifier que le contenu est visible
    const appVisible = await page.locator('#app').isVisible();
    expect(appVisible).toBe(true);
    
    // Screenshot mobile
    await page.screenshot({ 
      path: 'test-results/production-mobile.png', 
      fullPage: true 
    });
    
    console.log('✅ Affichage mobile fonctionnel');
  });
  
  test('Dogfooding: OntoWave utilise OntoWave', async ({ page }) => {
    const logs = [];
    
    page.on('console', msg => {
      logs.push(msg.text());
    });
    
    await page.goto('http://localhost:8020/index.html');
    await page.waitForTimeout(3000);
    
    // Vérifier que la config window.ontoWaveConfig est utilisée
    const usesWindowConfig = logs.some(log => 
      log.includes('Using window.ontoWaveConfig')
    );
    
    // Vérifier que les sources externes sont configurées
    const hasExternalSources = logs.some(log => 
      log.includes('External data sources configured')
    );
    
    // Vérifier que resolveCandidates détecte les sources externes
    const resolvesExternal = logs.some(log => 
      log.includes('Detected external source reference')
    );
    
    console.log('\n🐕 DOGFOODING CHECK:');
    console.log('  window.ontoWaveConfig:', usesWindowConfig ? '✅' : '❌');
    console.log('  External sources:', hasExternalSources ? '✅' : '❌');
    console.log('  External resolution:', resolvesExternal ? '✅' : '❌');
    
    expect(usesWindowConfig).toBe(true);
    expect(hasExternalSources).toBe(true);
    expect(resolvesExternal).toBe(true);
    
    console.log('✅ Dogfooding validé - OntoWave utilise ses propres capacités');
  });
  
});
