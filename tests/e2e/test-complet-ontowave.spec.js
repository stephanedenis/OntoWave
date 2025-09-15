import { test, expect } from '@playwright/test';

test('Test complet OntoWave - Validation de toutes les fonctionnalités', async ({ page }) => {
  console.log('🚀 DÉBUT DU TEST COMPLET ONTOWAVE');
  
  // Aller à la page
  await page.goto('http://localhost:8080');
  console.log('✅ Navigation vers http://localhost:8080');
  
  // Attendre que OntoWave se charge complètement
  await page.waitForTimeout(5000);
  console.log('⏳ Attente du chargement OntoWave (5s)');
  
  // === TEST 1: VÉRIFICATION DU CHARGEMENT ONTOWAVE ===
  console.log('\n🔍 TEST 1: CHARGEMENT ONTOWAVE');
  
  const ontoWaveExists = await page.evaluate(() => {
    return typeof window.OntoWave !== 'undefined';
  });
  console.log(`🌊 OntoWave chargé: ${ontoWaveExists ? '✅' : '❌'}`);
  
  // === TEST 2: VÉRIFICATION DE LA SOURCE LOCALE ===
  console.log('\n🔍 TEST 2: SOURCE ONTOWAVE');
  
  const scripts = await page.locator('script[src]').all();
  let usingLocalSource = false;
  let usingCDN = false;
  
  for (const script of scripts) {
    const src = await script.getAttribute('src');
    if (src === 'ontowave.min.js') {
      usingLocalSource = true;
    } else if (src && src.includes('cdn.jsdelivr.net')) {
      usingCDN = true;
    }
  }
  
  console.log(`📦 Source locale (ontowave.min.js): ${usingLocalSource ? '✅' : '❌'}`);
  console.log(`🌐 CDN utilisé: ${usingCDN ? '❌ (interdit)' : '✅'}`);
  
  // === TEST 3: VÉRIFICATION DES ICÔNES ===
  console.log('\n🔍 TEST 3: VALIDATION DES ICÔNES');
  
  const pageContent = await page.content();
  
  // Icônes autorisées
  const allowedIcons = ['🌊', '🎯', '🌐', '📱', '⚙️', '📦', '🚀', '✨', '📊', '🏗️', '📄'];
  
  // Icônes interdites
  const forbiddenIcons = ['🔥', '⭐️', '💡', '🎉', '🛠️', '🔧', '⚡️', '💻', '🎨', '🔗', '📝'];
  
  let forbiddenFound = [];
  forbiddenIcons.forEach(icon => {
    if (pageContent.includes(icon)) {
      forbiddenFound.push(icon);
    }
  });
  
  if (forbiddenFound.length === 0) {
    console.log('✅ Icônes: Aucune icône interdite trouvée');
  } else {
    console.log(`❌ Icônes interdites trouvées: ${forbiddenFound.join(', ')}`);
  }
  
  // Vérifier la présence de l'icône OntoWave
  const ontoWaveIconPresent = pageContent.includes('🌊');
  console.log(`🌊 Icône OntoWave présente: ${ontoWaveIconPresent ? '✅' : '❌'}`);
  
  // === TEST 4: VÉRIFICATION DE LA HIÉRARCHIE DES TITRES ===
  console.log('\n🔍 TEST 4: HIÉRARCHIE DES TITRES');
  
  const h1Count = await page.locator('h1').count();
  const h2Count = await page.locator('h2').count();
  const h3Count = await page.locator('h3').count();
  const h4Count = await page.locator('h4').count();
  const h5Count = await page.locator('h5').count();
  const h6Count = await page.locator('h6').count();
  
  console.log(`📝 Titres H1: ${h1Count}`);
  console.log(`📝 Titres H2: ${h2Count}`);
  console.log(`📝 Titres H3: ${h3Count}`);
  console.log(`📝 Titres H4: ${h4Count} ${h4Count === 0 ? '✅' : '❌ (interdit)'}`);
  console.log(`📝 Titres H5: ${h5Count} ${h5Count === 0 ? '✅' : '❌ (interdit)'}`);
  console.log(`📝 Titres H6: ${h6Count} ${h6Count === 0 ? '✅' : '❌ (interdit)'}`);
  
  // === TEST 5: VÉRIFICATION DE PRISM ===
  console.log('\n🔍 TEST 5: COLORATION SYNTAXIQUE PRISM');
  
  await page.waitForTimeout(2000);
  
  const prismElements = await page.locator('.language-html, .language-javascript, .language-plantuml, .language-json').count();
  const prismLoaded = await page.evaluate(() => {
    return typeof window.Prism !== 'undefined';
  });
  
  console.log(`🎨 Prism chargé: ${prismLoaded ? '✅' : '❌'}`);
  console.log(`🎨 Éléments avec coloration: ${prismElements}`);
  
  // Vérifier la coloration des blocs de code
  const coloredCodeBlocks = await page.locator('pre[class*="language-"] code[class*="language-"]').count();
  console.log(`🎨 Blocs de code colorés: ${coloredCodeBlocks} ${coloredCodeBlocks > 0 ? '✅' : '❌'}`);
  
  // === TEST 6: VÉRIFICATION DE PLANTUML ===
  console.log('\n🔍 TEST 6: DIAGRAMMES PLANTUML');
  
  const plantUMLBlocks = await page.locator('pre code.language-plantuml').count();
  console.log(`📊 Blocs PlantUML trouvés: ${plantUMLBlocks}`);
  
  // === TEST 7: VÉRIFICATION DE L'INTERFACE ONTOWAVE ===
  console.log('\n🔍 TEST 7: INTERFACE ONTOWAVE');
  
  // Vérifier la présence du conteneur OntoWave
  const ontoWaveContainer = await page.locator('#ontowave-container').isVisible();
  console.log(`📦 Container OntoWave: ${ontoWaveContainer ? '✅ visible' : '❌ non visible'}`);
  
  // Vérifier le bouton OntoWave
  const ontoWaveButton = await page.locator('.ontowave-button, .ontowave-icon').first();
  const buttonVisible = await ontoWaveButton.isVisible().catch(() => false);
  console.log(`🌊 Bouton OntoWave: ${buttonVisible ? '✅ visible' : '❌ non visible'}`);
  
  // === TEST 8: VÉRIFICATION DU SYSTÈME MULTILINGUE ===
  console.log('\n🔍 TEST 8: SYSTÈME MULTILINGUE');
  
  // Chercher les boutons de langue
  const langButtons = await page.locator('[data-ontowave-lang], .lang-button, .language-toggle').count();
  console.log(`🌐 Boutons de langue trouvés: ${langButtons}`);
  
  // Vérifier les liens FR/EN
  const frenchLink = await page.locator('text=FR').isVisible().catch(() => false);
  const englishLink = await page.locator('text=EN').isVisible().catch(() => false);
  
  console.log(`🇫🇷 Lien français: ${frenchLink ? '✅' : '❌'}`);
  console.log(`🇬🇧 Lien anglais: ${englishLink ? '✅' : '❌'}`);
  
  // === TEST 9: VÉRIFICATION DE LA CONFIGURATION ===
  console.log('\n🔍 TEST 9: CONFIGURATION ONTOWAVE');
  
  // Vérifier la configuration
  const configLoaded = await page.evaluate(() => {
    return fetch('/config.json').then(r => r.json()).then(config => {
      return {
        hasLocales: !!config.locales,
        hasDefaultLocale: !!config.defaultLocale,
        hasSources: !!config.sources,
        hasPrism: !!config.enablePrism,
        hasPlantUML: !!config.enablePlantUML
      };
    }).catch(() => ({ error: true }));
  });
  
  if (configLoaded.error) {
    console.log('❌ Configuration: Erreur de chargement config.json');
  } else {
    console.log(`⚙️ Config locales: ${configLoaded.hasLocales ? '✅' : '❌'}`);
    console.log(`⚙️ Config defaultLocale: ${configLoaded.hasDefaultLocale ? '✅' : '❌'}`);
    console.log(`⚙️ Config sources: ${configLoaded.hasSources ? '✅' : '❌'}`);
    console.log(`⚙️ Config Prism: ${configLoaded.hasPrism ? '✅' : '❌'}`);
    console.log(`⚙️ Config PlantUML: ${configLoaded.hasPlantUML ? '✅' : '❌'}`);
  }
  
  // === TEST 10: TEST D'INTERACTION ===
  console.log('\n🔍 TEST 10: INTERACTIONS UTILISATEUR');
  
  if (buttonVisible) {
    try {
      // Essayer de cliquer sur le bouton OntoWave
      await ontoWaveButton.click();
      await page.waitForTimeout(1000);
      
      // Vérifier si un menu s'ouvre
      const menuVisible = await page.locator('.ontowave-menu, .ontowave-panel').isVisible().catch(() => false);
      console.log(`📋 Menu OntoWave après clic: ${menuVisible ? '✅ ouvert' : '❌ non ouvert'}`);
      
      if (menuVisible) {
        // Chercher le bouton Configuration
        const configButton = await page.locator('text=Configuration').isVisible().catch(() => false);
        console.log(`⚙️ Bouton Configuration: ${configButton ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.log(`❌ Erreur lors du clic: ${error.message}`);
    }
  }
  
  // === RÉSUMÉ FINAL ===
  console.log('\n📋 RÉSUMÉ DU TEST COMPLET:');
  console.log('='.repeat(50));
  
  const results = {
    ontoWaveLoaded: ontoWaveExists,
    localSource: usingLocalSource && !usingCDN,
    iconsValid: forbiddenFound.length === 0 && ontoWaveIconPresent,
    titlesValid: h4Count === 0 && h5Count === 0 && h6Count === 0,
    prismWorking: prismLoaded && coloredCodeBlocks > 0,
    plantUMLPresent: plantUMLBlocks > 0,
    interfaceVisible: ontoWaveContainer && buttonVisible,
    multilingualSystem: langButtons > 0 || (frenchLink && englishLink),
    configValid: !configLoaded.error && configLoaded.hasLocales
  };
  
  let passedTests = 0;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSÉ' : '❌ ÉCHEC';
    console.log(`${test.padEnd(20)}: ${status}`);
    if (passed) passedTests++;
  });
  
  console.log('='.repeat(50));
  console.log(`🎯 SCORE FINAL: ${passedTests}/${totalTests} tests passés (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS ! OntoWave fonctionne parfaitement.');
  } else {
    console.log(`🚨 ${totalTests - passedTests} tests ont échoué. Des corrections sont nécessaires.`);
  }
  
  // Prendre une capture d'écran finale
  await page.screenshot({ path: 'test-complet-ontowave.png', fullPage: true });
  console.log('📸 Capture d\'écran sauvée: test-complet-ontowave.png');
});
