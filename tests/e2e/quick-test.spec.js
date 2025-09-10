// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Quick Test', () => {
  test('Quick validation with immediate fallback', async ({ page }) => {
    console.log('⚡ Test rapide OntoWave avec système immédiat...');
    
    page.on('console', msg => {
      if (msg.text().includes('secours') || msg.text().includes('rapide') || msg.text().includes('Mermaid')) {
        console.log(`📝 ${msg.text()}`);
      }
    });
    
    const startTime = Date.now();
    await page.goto('http://127.0.0.1:8080/#index.md');
    
    // Attendre maximum 3 secondes
    await page.waitForTimeout(3000);
    
    const content = await page.locator('#app').textContent();
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    console.log(`📄 Contenu: ${content?.length || 0} caractères`);
    
    const hasContent = content && content.length > 100;
    const isWorking = hasContent && !content.includes('Chargement…');
    
    console.log(`✅ Application fonctionnelle: ${isWorking ? 'OUI' : 'NON'}`);
    
    if (isWorking) {
      console.log('🎉 PROBLÈME 1 RÉSOLU: Chargement rapide');
      
      // Test Mermaid rapide
      const mermaidTest = await page.evaluate(() => {
        const app = document.getElementById('app');
        if (app) {
          const testDiv = document.createElement('div');
          testDiv.innerHTML = '<div class="mermaid">graph TD; A-->B; B-->C;</div>';
          app.appendChild(testDiv);
          
          if (window.mermaid) {
            window.mermaid.run();
            return 'Mermaid test ajouté';
          }
        }
        return 'Test échoué';
      });
      
      await page.waitForTimeout(1000);
      const mermaidSvgs = await page.locator('.mermaid svg').count();
      console.log(`🎨 Diagrammes Mermaid: ${mermaidSvgs}`);
      console.log(`✅ PROBLÈME 2: ${mermaidSvgs > 0 ? 'RÉSOLU' : 'PARTIEL'}`);
      
      // Test navigation rapide
      const navLink = page.locator('a[href*="#"]').first();
      if (await navLink.count() > 0) {
        const beforeUrl = page.url();
        await navLink.click();
        await page.waitForTimeout(500);
        const afterUrl = page.url();
        const hashOk = afterUrl.includes('#') && afterUrl !== beforeUrl;
        console.log(`🔗 Navigation: ${beforeUrl} → ${afterUrl}`);
        console.log(`✅ PROBLÈME 3: ${hashOk ? 'RÉSOLU' : 'À VÉRIFIER'}`);
      }
    } else {
      console.log('❌ Application toujours bloquée');
    }
    
    await page.screenshot({ path: 'test-results/quick-test.png', fullPage: true });
  });
});
