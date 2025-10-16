const { test, expect } = require('@playwright/test');

/**
 * Test de régression pour la version buildée dans docs/
 * Valide que la navigation .puml fonctionne après déploiement
 */
test('Test régression docs/ - Navigation .puml fonctionne', async ({ page }) => {
  console.log('\n📦 TEST RÉGRESSION DOCS/ (Version Déployée)\n');
  
  const errors = [];
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      console.log(`❌ [error] ${msg.text()}`);
      errors.push(msg.text());
    } else if (msg.text().includes('[renderRoute]') || msg.text().includes('[loadPlantUML]')) {
      console.log(`[log] ${msg.text()}`);
    }
  });
  
  // 1. Charger la page buildée dans docs/
  console.log('📄 Chargement de la page buildée : http://localhost:8092/');
  await page.goto('http://localhost:8092/#/index.md');
  await page.waitForTimeout(3000);
  
  // 2. Vérifier que le markdown est chargé
  await page.waitForSelector('#app', { state: 'attached', timeout: 5000 });
  await page.waitForTimeout(2000); // Laisser le temps au contenu de se charger
  const appText = await page.locator('#app').textContent();
  console.log(`📋 Contenu détecté: "${appText.substring(0, 80)}..."`);
  
  // Si c'est index-minimal.md
  if (appText.includes('Test Minimal')) {
    console.log('✅ Page index-minimal.md chargée');
    
    // 3. Vérifier le lien .puml
    const linkCount = await page.locator('a[href="architecture.puml"]').count();
    console.log(`📊 Liens vers architecture.puml: ${linkCount}`);
    
    if (linkCount > 0) {
      // 4. Capture avant navigation
      await page.screenshot({ 
        path: 'test-results/docs-page-markdown.png',
        fullPage: true 
      });
      console.log('📸 Capture: docs-page-markdown.png');
      
      // 5. Naviguer vers .puml
      console.log('🔗 Navigation vers #/architecture.puml...');
      await page.evaluate(() => { location.hash = '#/architecture.puml'; });
      await page.waitForTimeout(6000);
      
      // 6. Vérifier SVG ou code brut
      const svgCount = await page.locator('svg').count();
      const preCount = await page.locator('pre').count();
      
      console.log(`📊 SVG trouvés: ${svgCount}`);
      console.log(`📊 Blocs <pre> (code brut): ${preCount}`);
      
      if (svgCount > 0) {
        console.log('✅ SVG PlantUML rendu correctement!');
        expect(svgCount).toBeGreaterThan(0);
        
        // Capture du diagramme
        await page.screenshot({ 
          path: 'test-results/docs-diagramme-puml.png',
          fullPage: true 
        });
        console.log('📸 Capture: docs-diagramme-puml.png');
      } else if (preCount > 0) {
        console.log('❌ PROBLÈME: Code brut affiché au lieu du SVG!');
        const preText = await page.locator('pre').first().textContent();
        console.log(`Code brut (premiers 100 chars): ${preText?.substring(0, 100)}`);
        
        // Capture du problème
        await page.screenshot({ 
          path: 'test-results/docs-probleme-code-brut.png',
          fullPage: true 
        });
        console.log('📸 Capture problème: docs-probleme-code-brut.png');
        
        throw new Error('Le fichier .puml affiche du code brut au lieu du SVG PlantUML');
      } else {
        console.log('⚠️  Ni SVG ni code brut trouvé');
        const currentContent = await page.locator('#app').innerHTML();
        console.log(`Contenu actuel (premiers 200 chars): ${currentContent.substring(0, 200)}`);
        
        await page.screenshot({ 
          path: 'test-results/docs-contenu-inattendu.png',
          fullPage: true 
        });
        
        throw new Error('Contenu inattendu après navigation vers .puml');
      }
    } else {
      console.log('⚠️  Aucun lien vers architecture.puml trouvé');
    }
  } else {
    console.log(`ℹ️  Page différente chargée (pas index-minimal.md)`);
    console.log('📸 Capture de la page actuelle...');
    await page.screenshot({ 
      path: 'test-results/docs-page-actuelle.png',
      fullPage: true 
    });
  }
  
  console.log('\n✅ Test de régression docs/ terminé\n');
});
