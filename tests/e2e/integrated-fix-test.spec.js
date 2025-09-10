// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Integrated Fix Test', () => {
  test('Test the integrated auto-fix system', async ({ page }) => {
    console.log('🔧 Test du système de fix intégré...');
    
    // Capturer les logs pour voir le fix en action
    page.on('console', msg => {
      if (msg.text().includes('OntoWave') || msg.text().includes('Fix') || msg.text().includes('🔧') || msg.text().includes('🚨')) {
        console.log(`📱 Console: ${msg.text()}`);
      }
    });
    
    await page.goto('http://127.0.0.1:8080/');
    
    // Attendre le temps nécessaire pour que le fix s'active (4 secondes + délai)
    console.log('⏳ Attente de l\'activation du système de secours (5 secondes)...');
    await page.waitForTimeout(5000);
    
    // Vérifier si le fix est actif
    const content = await page.locator('#app').textContent();
    console.log(`📄 Contenu après fix (${content?.length} chars): ${content?.substring(0, 200)}...`);
    
    const isFixed = content?.includes('Système de Secours Actif');
    if (isFixed) {
      console.log('✅ SUCCESS: Système de fix automatique activé!');
      
      // Tester la navigation
      console.log('🔗 Test de navigation dans le système de secours...');
      
      const links = await page.locator('a[href^="#"]').all();
      console.log(`🔗 Liens de navigation trouvés: ${links.length}`);
      
      if (links.length > 0) {
        // Test du premier lien
        const firstLink = links[0];
        const href = await firstLink.getAttribute('href');
        console.log(`🎯 Test du lien: ${href}`);
        
        await firstLink.click();
        await page.waitForTimeout(2000);
        
        const newContent = await page.locator('#app').textContent();
        const navigationWorked = newContent?.includes('Système de Secours Actif') && !newContent?.includes('Chargement');
        
        console.log(`🧭 Navigation ${navigationWorked ? 'réussie' : 'échouée'}`);
        console.log(`📄 Nouveau contenu: ${newContent?.substring(0, 150)}...`);
      }
      
    } else if (content?.includes('Chargement')) {
      console.log('⚠️ Fix pas encore activé, contenu toujours en chargement');
    } else {
      console.log('🤔 État inattendu du contenu');
    }
  });

  test('Test multiple routes with fix system', async ({ page }) => {
    console.log('🗺️ Test de multiples routes avec le système de fix...');
    
    const routes = [
      '',                          // Page racine
      '#index.md',                 // Index explicite
      '#en/index.md',              // Page anglaise
      '#fr/index.md',              // Page française
      '#demo/advanced-shapes.md'   // Démo PowerPoint
    ];
    
    for (const route of routes) {
      console.log(`\n🔍 Test de la route: "${route}"`);
      
      await page.goto(`http://127.0.0.1:8080/${route}`);
      await page.waitForTimeout(5000); // Laisser le temps au fix de s'activer
      
      const content = await page.locator('#app').textContent();
      const isWorking = content && !content.includes('Chargement') && content.length > 100;
      
      console.log(`📊 Route ${route || 'racine'}: ${isWorking ? '✅ OK' : '❌ FAIL'} (${content?.length || 0} chars)`);
      
      if (isWorking && content?.includes('Système de Secours')) {
        console.log('✅ Système de secours actif pour cette route');
      } else if (isWorking) {
        console.log('✅ Application originale fonctionne pour cette route');
      }
    }
  });

  test('Performance test of fix system', async ({ page }) => {
    console.log('⚡ Test de performance du système de fix...');
    
    const startTime = Date.now();
    await page.goto('http://127.0.0.1:8080/');
    
    // Attendre que l'application soit prête (soit originale, soit fix)
    await page.waitForFunction(() => {
      const app = document.getElementById('app');
      const content = app?.textContent || '';
      return content.length > 100 && !content.includes('Chargement');
    }, { timeout: 10000 });
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Temps total de chargement: ${totalTime}ms`);
    
    const content = await page.locator('#app').textContent();
    const usingFallback = content?.includes('Système de Secours');
    
    console.log(`🔧 Système utilisé: ${usingFallback ? 'Secours' : 'Original'}`);
    console.log(`📏 Taille du contenu: ${content?.length} caractères`);
    
    if (totalTime < 6000) {
      console.log('✅ Performance acceptable');
    } else {
      console.log('⚠️ Performance lente (> 6 secondes)');
    }
  });
});
