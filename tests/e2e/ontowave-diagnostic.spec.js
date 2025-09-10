// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Diagnostic Automatique', () => {
  test.beforeEach(async ({ page }) => {
    // Capturer les erreurs JavaScript
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      console.log(`❌ Page Error: ${err.message}`);
    });
  });

  test('Diagnostic complet du fonctionnement OntoWave', async ({ page }) => {
    console.log('🔍 Début du diagnostic OntoWave...');
    
    // Test 1: Vérifier que le serveur répond
    console.log('📡 Test 1: Vérification du serveur...');
    const response = await page.goto('http://127.0.0.1:8080/');
    expect(response?.status()).toBe(200);
    console.log('✅ Serveur accessible');

    // Test 2: Vérifier que la page se charge
    console.log('🌐 Test 2: Chargement de la page...');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    console.log(`📋 Titre de la page: "${title}"`);

    // Test 3: Vérifier si l'application est bloquée sur "Chargement..."
    console.log('⏱️ Test 3: Vérification du statut de chargement...');
    const loadingText = await page.locator('text=Chargement').count();
    if (loadingText > 0) {
      console.log('⚠️ Application bloquée sur "Chargement..."');
      
      // Diagnostic approfondi
      console.log('🔬 Diagnostic approfondi...');
      
      // Vérifier la config
      const configResponse = await page.request.get('http://127.0.0.1:8080/config.json');
      const config = await configResponse.json();
      console.log('📝 Configuration:', JSON.stringify(config, null, 2));
      
      // Vérifier index.md
      const indexResponse = await page.request.get('http://127.0.0.1:8080/index.md');
      const indexContent = await indexResponse.text();
      console.log(`📄 index.md accessible: ${indexContent.length} caractères`);
      
      // Vérifier les scripts chargés
      const scripts = await page.locator('script[src]').count();
      console.log(`📜 Scripts trouvés: ${scripts}`);
      
      // Tester des routes spécifiques
      console.log('🧪 Test des routes spécifiques...');
      const routes = ['#index.md', '#en/index.md', '#fr/index.md'];
      
      for (const route of routes) {
        console.log(`🔗 Test de la route: ${route}`);
        await page.goto(`http://127.0.0.1:8080/${route}`);
        await page.waitForTimeout(2000); // Attendre 2 secondes
        
        const stillLoading = await page.locator('text=Chargement').count();
        if (stillLoading === 0) {
          console.log(`✅ Route fonctionnelle: ${route}`);
          const content = await page.locator('#app').textContent();
          console.log(`📄 Contenu trouvé: ${content?.substring(0, 100)}...`);
          return; // Sortir si une route fonctionne
        } else {
          console.log(`❌ Route non fonctionnelle: ${route}`);
        }
      }
      
      console.log('🔧 Toutes les routes échouent. Test de solutions...');
      
      // Solution 1: Forcer la redirection en JavaScript
      console.log('💡 Solution 1: Redirection forcée...');
      await page.goto('http://127.0.0.1:8080/');
      await page.evaluate(() => {
        if (location.hash === '' || location.hash === '#' || location.hash === '#/') {
          location.hash = '#index.md';
        }
      });
      await page.waitForTimeout(3000);
      
      const afterRedirect = await page.locator('text=Chargement').count();
      if (afterRedirect === 0) {
        console.log('✅ Solution 1 réussie: Redirection forcée fonctionne');
        return;
      }
      
      // Solution 2: Test de la version statique
      console.log('💡 Solution 2: Test version statique...');
      try {
        await page.goto('http://127.0.0.1:8080/index-static.html');
        await page.waitForTimeout(1000);
        const staticContent = await page.locator('body').textContent();
        if (staticContent?.includes('OntoWave')) {
          console.log('✅ Solution 2 réussie: Version statique fonctionne');
          console.log('💡 Recommandation: Utiliser la version statique temporairement');
          return;
        }
      } catch (e) {
        console.log('❌ Version statique non disponible');
      }
      
      // Solution 3: Créer une nouvelle page d'accueil fonctionnelle
      console.log('💡 Solution 3: Création page d\'accueil de secours...');
      // Cette solution sera implémentée si nécessaire
      
    } else {
      console.log('✅ Application fonctionne correctement');
      
      // Test de navigation
      console.log('🧭 Test de navigation...');
      const links = await page.locator('a[href*="#"]').count();
      console.log(`🔗 Liens de navigation trouvés: ${links}`);
      
      if (links > 0) {
        const firstLink = page.locator('a[href*="#"]').first();
        const href = await firstLink.getAttribute('href');
        console.log(`🎯 Test du premier lien: ${href}`);
        
        await firstLink.click();
        await page.waitForTimeout(1000);
        
        const newContent = await page.locator('#app').textContent();
        console.log(`📄 Nouveau contenu: ${newContent?.substring(0, 100)}...`);
      }
    }
  });

  test('Test des démos PowerPoint', async ({ page }) => {
    console.log('🎨 Test des capacités de diagrammes PowerPoint...');
    
    // Aller directement à la démo advanced-shapes
    await page.goto('http://127.0.0.1:8080/#demo/advanced-shapes.md');
    await page.waitForTimeout(3000);
    
    const loading = await page.locator('text=Chargement').count();
    if (loading > 0) {
      console.log('❌ Démo non accessible via hash, test alternative...');
      
      // Test direct du fichier
      const response = await page.request.get('http://127.0.0.1:8080/demo/advanced-shapes.md');
      if (response.ok()) {
        const content = await response.text();
        console.log(`📄 Démo accessible directement: ${content.length} caractères`);
        console.log('🎨 Diagrammes PowerPoint disponibles dans le fichier');
      }
    } else {
      console.log('✅ Démo accessible via l\'application');
      
      // Vérifier la présence de diagrammes
      const diagrams = await page.locator('svg, .mermaid, pre[class*="language-"]').count();
      console.log(`📊 Diagrammes trouvés: ${diagrams}`);
    }
  });

  test('Test de performance et suggestions', async ({ page }) => {
    console.log('⚡ Test de performance...');
    
    const startTime = Date.now();
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    
    if (loadTime > 5000) {
      console.log('⚠️ Chargement lent détecté');
      console.log('💡 Suggestions:');
      console.log('  - Vérifier la taille des assets');
      console.log('  - Optimiser les images');
      console.log('  - Mettre en cache les ressources');
    } else {
      console.log('✅ Performance acceptable');
    }
    
    // Vérifier la taille des assets
    const assets = await page.locator('script[src], link[href]').all();
    console.log(`📦 Assets chargés: ${assets.length}`);
    
    for (const asset of assets.slice(0, 5)) { // Limiter à 5 pour éviter le spam
      const src = await asset.getAttribute('src') || await asset.getAttribute('href');
      if (src && src.startsWith('/assets/')) {
        try {
          const response = await page.request.get(`http://127.0.0.1:8080${src}`);
          const size = (await response.body()).length;
          console.log(`📄 ${src}: ${Math.round(size/1024)}KB`);
        } catch (e) {
          console.log(`❌ ${src}: Erreur de chargement`);
        }
      }
    }
  });
});
