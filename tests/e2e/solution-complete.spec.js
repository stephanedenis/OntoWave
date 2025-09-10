// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Complete Solution Test', () => {
  test('Test the complete standalone solution', async ({ page }) => {
    console.log('🎯 TEST DE LA SOLUTION COMPLÈTE STANDALONE');
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('OntoWave') || text.includes('Chargement') || text.includes('Mermaid') || text.includes('SVG')) {
        console.log(`📝 ${text}`);
      }
    });
    
    const startTime = Date.now();
    await page.goto('http://127.0.0.1:8080/index-solution.html#index.md');
    
    // Test complet en une seule fois
    await page.waitForTimeout(4000);
    
    const content = await page.locator('#dynamic-content').textContent();
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    console.log(`📄 Contenu: ${content?.length || 0} caractères`);
    
    // PROBLÈME 1: Chargement
    const problem1Solved = content && content.length > 100 && !content.includes('⏳ Chargement');
    console.log(`⚡ PROBLÈME 1 (chargement): ${problem1Solved ? '✅ RÉSOLU' : '❌ NON RÉSOLU'}`);
    
    // PROBLÈME 2: Mermaid - Navigation vers démo
    console.log('\n🎨 Test navigation vers démo Mermaid...');
    const mermaidLink = page.locator('a[onclick*="demo/mermaid.md"]').first();
    
    if (await mermaidLink.count() > 0) {
      await mermaidLink.click();
      await page.waitForTimeout(3000);
      
      const mermaidElements = await page.locator('.mermaid').count();
      const mermaidSvgs = await page.locator('.mermaid svg').count();
      
      console.log(`📊 Éléments .mermaid: ${mermaidElements}`);
      console.log(`📊 SVG rendus: ${mermaidSvgs}`);
      
      const problem2Solved = mermaidSvgs > 0;
      console.log(`🎨 PROBLÈME 2 (Mermaid): ${problem2Solved ? '✅ RÉSOLU' : '❌ NON RÉSOLU'}`);
    } else {
      console.log('⚠️ Lien Mermaid non trouvé');
    }
    
    // PROBLÈME 3: Hash navigation
    console.log('\n🔗 Test navigation hash...');
    const beforeUrl = page.url();
    const homeLink = page.locator('a[onclick*="index.md"]').first();
    
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await page.waitForTimeout(1000);
      const afterUrl = page.url();
      
      const problem3Solved = afterUrl.includes('#index.md');
      console.log(`🔗 Navigation: ${beforeUrl} → ${afterUrl}`);
      console.log(`🔗 PROBLÈME 3 (hash): ${problem3Solved ? '✅ RÉSOLU' : '❌ NON RÉSOLU'}`);
    }
    
    // Résumé final
    const finalMermaidSvgs = await page.locator('.mermaid svg').count();
    const finalUrl = page.url();
    const finalContent = await page.locator('#dynamic-content').textContent();
    
    console.log('\n🏆 === RÉSULTATS FINAUX ===');
    console.log(`⚡ Chargement rapide: ${problem1Solved ? 'OUI' : 'NON'}`);
    console.log(`🎨 Mermaid fonctionnel: ${finalMermaidSvgs > 0 ? 'OUI' : 'NON'} (${finalMermaidSvgs} SVG)`);
    console.log(`🔗 Hash préservé: ${finalUrl.includes('#') ? 'OUI' : 'NON'}`);
    console.log(`📄 Contenu final: ${finalContent?.length || 0} caractères`);
    console.log(`⏱️ Performance: ${loadTime}ms`);
    
    const totalSolved = (problem1Solved ? 1 : 0) + (finalMermaidSvgs > 0 ? 1 : 0) + (finalUrl.includes('#') ? 1 : 0);
    
    if (totalSolved === 3) {
      console.log('🎉 PARFAIT: Solution complète fonctionnelle !');
    } else {
      console.log(`⚠️ PARTIEL: ${totalSolved}/3 problèmes résolus`);
    }
    
    await page.screenshot({ path: 'test-results/solution-complete.png', fullPage: true });
    console.log('📸 Capture de la solution complète sauvegardée');
  });
});
