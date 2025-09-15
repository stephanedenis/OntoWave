import { test, expect } from '@playwright/test';

test('Test rapide OntoWave - Diagnostic des problèmes', async ({ page }) => {
  console.log('🚀 DIAGNOSTIC RAPIDE ONTOWAVE');
  
  // Configuration du timeout
  test.setTimeout(30000);
  
  try {
    // Aller à la page
    await page.goto('http://localhost:8080', { timeout: 10000 });
    console.log('✅ Page chargée');
    
    // Attendre brièvement que OntoWave se charge
    await page.waitForTimeout(3000);
    
    // Test 1: OntoWave chargé
    const ontoWaveLoaded = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined';
    });
    console.log(`🌊 OntoWave: ${ontoWaveLoaded ? '✅ Chargé' : '❌ Non chargé'}`);
    
    // Test 2: Source utilisée
    const htmlContent = await page.content();
    const usesLocal = htmlContent.includes('src="ontowave.min.js"');
    const usesCDN = htmlContent.includes('cdn.jsdelivr.net');
    console.log(`📦 Source locale: ${usesLocal ? '✅' : '❌'}`);
    console.log(`🌐 CDN utilisé: ${usesCDN ? '❌ Interdit' : '✅'}`);
    
    // Test 3: Icônes interdites
    const forbiddenIcons = ['🔥', '⭐️', '💡', '🎉', '🛠️', '🔧', '⚡️'];
    let foundForbidden = [];
    forbiddenIcons.forEach(icon => {
      if (htmlContent.includes(icon)) {
        foundForbidden.push(icon);
      }
    });
    console.log(`🚫 Icônes interdites: ${foundForbidden.length === 0 ? '✅ Aucune' : '❌ ' + foundForbidden.join(', ')}`);
    
    // Test 4: Titres H4+
    const h4Count = await page.locator('h4').count();
    const h5Count = await page.locator('h5').count();
    const h6Count = await page.locator('h6').count();
    const badTitles = h4Count + h5Count + h6Count;
    console.log(`📝 Titres H4+: ${badTitles === 0 ? '✅ Aucun' : '❌ ' + badTitles + ' trouvés'}`);
    
    // Test 5: Configuration
    const configCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('/config.json');
        const config = await response.json();
        return {
          loaded: true,
          hasPrism: !!config.enablePrism,
          hasPlantUML: !!config.enablePlantUML,
          hasLocales: Array.isArray(config.locales)
        };
      } catch (e) {
        return { loaded: false, error: e.message };
      }
    });
    
    if (configCheck.loaded) {
      console.log(`⚙️ Config chargée: ✅`);
      console.log(`🎨 Prism activé: ${configCheck.hasPrism ? '✅' : '❌'}`);
      console.log(`📊 PlantUML activé: ${configCheck.hasPlantUML ? '✅' : '❌'}`);
      console.log(`🌐 Locales définies: ${configCheck.hasLocales ? '✅' : '❌'}`);
    } else {
      console.log(`❌ Config non chargée: ${configCheck.error}`);
    }
    
    // Test 6: Interface OntoWave
    const container = await page.locator('#ontowave-container').isVisible();
    const button = await page.locator('.ontowave-button, .ontowave-icon').first().isVisible().catch(() => false);
    console.log(`📦 Container OntoWave: ${container ? '✅' : '❌'}`);
    console.log(`🌊 Bouton OntoWave: ${button ? '✅' : '❌'}`);
    
    // Test 7: Éléments de code Prism
    const codeBlocks = await page.locator('pre[class*="language-"] code').count();
    console.log(`🎨 Blocs de code: ${codeBlocks > 0 ? '✅ ' + codeBlocks : '❌ Aucun'}`);
    
    // Résumé
    console.log('\\n📋 RÉSUMÉ:');
    const issues = [];
    if (!ontoWaveLoaded) issues.push('OntoWave non chargé');
    if (!usesLocal || usesCDN) issues.push('Source incorrecte');
    if (foundForbidden.length > 0) issues.push('Icônes interdites');
    if (badTitles > 0) issues.push('Titres H4+ présents');
    if (!configCheck.loaded) issues.push('Config non chargée');
    if (!container || !button) issues.push('Interface manquante');
    if (codeBlocks === 0) issues.push('Prism non fonctionnel');
    
    if (issues.length === 0) {
      console.log('🎉 TOUT FONCTIONNE PARFAITEMENT!');
    } else {
      console.log(`🚨 ${issues.length} PROBLÈMES DÉTECTÉS:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
  } catch (error) {
    console.log(`💥 ERREUR: ${error.message}`);
  }
  
  // Capture d'écran
  await page.screenshot({ path: 'diagnostic-ontowave.png', fullPage: true });
  console.log('📸 Capture sauvée: diagnostic-ontowave.png');
});
