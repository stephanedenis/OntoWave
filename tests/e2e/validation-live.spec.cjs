const { test, expect } = require('@playwright/test');

test.describe('🎯 VALIDATION EN TEMPS RÉEL', () => {
  test('Tester OntoWave complet avec détails', async ({ page }) => {
    console.log('🔍 VALIDATION LIVE - Test complet avec tous les détails');
    
    // Configuration pour voir tous les logs
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`📝 LOG: ${msg.text()}`);
      } else if (msg.type() === 'error') {
        console.log(`❌ ERROR: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`💥 PAGE ERROR: ${error.message}`);
    });
    
    // Aller sur la page
    console.log('🌐 Chargement de http://localhost:8080/');
    await page.goto('http://localhost:8080/');
    
    // Étape 1: Vérifier le chargement initial
    console.log('⏳ Attente du chargement initial...');
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    console.log(`📄 Titre: ${title}`);
    
    // Étape 2: Attendre OntoWave
    console.log('🌊 Attente de OntoWave...');
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 10000 });
    console.log('✅ OntoWave chargé');
    
    // Étape 3: Attendre le contenu
    console.log('📝 Attente du contenu...');
    await page.waitForTimeout(5000);
    
    // Analyser le contenu
    const bodyText = await page.textContent('body');
    const contentLength = bodyText.length;
    console.log(`📊 Contenu total: ${contentLength} caractères`);
    
    if (contentLength < 100) {
      console.log(`⚠️ PROBLÈME: Contenu trop court (${contentLength} caractères)`);
      console.log(`📝 Contenu actuel: "${bodyText}"`);
    } else {
      console.log('✅ Contenu suffisant détecté');
    }
    
    // Vérifier les éléments HTML
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();
    const pCount = await page.locator('p').count();
    
    console.log(`📊 Structure HTML: H1=${h1Count}, H2=${h2Count}, H3=${h3Count}, P=${pCount}`);
    
    // Vérifier l'interface OntoWave
    const ontoWaveElements = await page.locator('[class*="ontowave"], [title*="OntoWave"]').count();
    console.log(`🌊 Éléments OntoWave: ${ontoWaveElements}`);
    
    // Vérifier Prism
    const prismElements = await page.locator('.language-html, .language-json, .token').count();
    console.log(`🎨 Éléments Prism: ${prismElements}`);
    
    // Vérifier les diagrammes
    const svgElements = await page.locator('svg').count();
    console.log(`📊 Diagrammes SVG: ${svgElements}`);
    
    // Test du menu OntoWave
    console.log('🧪 Test du menu OntoWave...');
    const menuButton = page.locator('[title*="OntoWave"], .ontowave-toggle').first();
    if (await menuButton.count() > 0) {
      console.log('🔘 Bouton menu trouvé, tentative de clic...');
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      const menuVisible = await page.locator('.ontowave-menu').first().isVisible();
      console.log(`📋 Menu visible après clic: ${menuVisible}`);
      
      // Chercher les boutons de langue
      const langButtons = await page.locator('text=🌐 FR, text=🌐 EN').count();
      console.log(`🌐 Boutons de langue dans le menu: ${langButtons}`);
      
      if (langButtons > 0) {
        console.log('🧪 Test changement de langue...');
        const enButton = page.locator('text=🌐 EN').first();
        if (await enButton.count() > 0) {
          await enButton.click();
          await page.waitForTimeout(2000);
          
          const newBodyText = await page.textContent('body');
          const hasEnglish = newBodyText.includes('OntoWave is a lightweight');
          console.log(`🇬🇧 Changement vers anglais réussi: ${hasEnglish}`);
        }
      }
    } else {
      console.log('❌ Aucun bouton de menu OntoWave trouvé');
    }
    
    // Bilan final
    console.log('\n🎯 BILAN FINAL:');
    console.log(`📄 Titre: ${title.includes('OntoWave') ? '✅' : '❌'}`);
    console.log(`📝 Contenu: ${contentLength > 1000 ? '✅' : '❌'} (${contentLength} chars)`);
    console.log(`📊 Structure: ${h1Count > 0 && h2Count > 0 ? '✅' : '❌'}`);
    console.log(`🌊 Interface: ${ontoWaveElements > 0 ? '✅' : '❌'} (${ontoWaveElements} éléments)`);
    console.log(`🎨 Prism: ${prismElements > 0 ? '✅' : '❌'} (${prismElements} éléments)`);
    console.log(`📊 Diagrammes: ${svgElements > 0 ? '✅' : '❌'} (${svgElements} SVG)`);
    
    const score = [
      title.includes('OntoWave'),
      contentLength > 1000,
      h1Count > 0 && h2Count > 0,
      ontoWaveElements > 0,
      prismElements > 0,
      svgElements > 0
    ].filter(Boolean).length;
    
    console.log(`🏆 SCORE: ${score}/6 (${Math.round(score/6*100)}%)`);
    
    if (score === 6) {
      console.log('🎉 PARFAIT! OntoWave fonctionne à 100%');
    } else {
      console.log(`⚠️ ${6-score} problème(s) détecté(s)`);
    }
    
    // Assertions pour le test
    expect(title).toContain('OntoWave');
    expect(contentLength).toBeGreaterThan(1000);
    expect(h1Count).toBeGreaterThan(0);
    expect(ontoWaveElements).toBeGreaterThan(0);
  });
});
