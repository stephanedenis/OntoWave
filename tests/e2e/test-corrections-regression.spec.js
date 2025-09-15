import { test, expect } from '@playwright/test';

test('Validation des corrections de régression', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // Attendre que OntoWave se charge
  await page.waitForTimeout(3000);
  
  // Test 1: Vérifier que seule l'icône 🌊 est utilisée 
  console.log('🔍 Test 1: Vérification des icônes autorisées');
  
  const pageContent = await page.content();
  
  // Vérifier qu'il n'y a que des icônes 🌊 et pas d'autres emojis non autorisés
  const allowedIcons = ['🌊', '🎯', '🌐', '📱', '⚙️', '📦', '🚀', '✨', '📊', '🏗️', '📄'];
  const forbiddenPatterns = [
    /[🔥⭐️💡🎉🛠️🔧⚡️]/g,  // Icônes interdites
  ];
  
  let forbiddenFound = false;
  forbiddenPatterns.forEach(pattern => {
    const matches = pageContent.match(pattern);
    if (matches) {
      console.log('❌ Icônes interdites trouvées:', matches);
      forbiddenFound = true;
    }
  });
  
  if (!forbiddenFound) {
    console.log('✅ Icônes: Seules les icônes autorisées sont présentes');
  }
  
  // Test 2: Vérifier la hiérarchie des titres H4+
  console.log('🔍 Test 2: Vérification hiérarchie des titres');
  
  // Vérifier qu'il n'y a pas de h4 ou plus dans le contenu
  const h4Elements = await page.locator('h4, h5, h6').count();
  console.log(`📝 Titres H4+: ${h4Elements} trouvés`);
  
  if (h4Elements === 0) {
    console.log('✅ Titres: Pas de titres H4+ (hiérarchie correcte)');
  } else {
    console.log('❌ Titres: Des titres H4+ trouvés (régression)');
  }
  
  // Test 3: Vérifier que Prism fonctionne
  console.log('🔍 Test 3: Vérification Prism');
  
  await page.waitForTimeout(2000);
  
  const prismElements = await page.locator('.language-html, .language-javascript, .language-plantuml').count();
  console.log(`🎨 Éléments Prism: ${prismElements} trouvés`);
  
  // Test 4: Vérifier que PlantUML est chargé
  console.log('🔍 Test 4: Vérification PlantUML');
  
  const plantUMLBlocks = await page.locator('pre code.language-plantuml').count();
  console.log(`📊 Blocs PlantUML: ${plantUMLBlocks} trouvés`);
  
  // Test 5: Vérifier OntoWave fonctionne
  console.log('🔍 Test 5: Vérification OntoWave');
  
  const ontoWaveIcon = await page.locator('.ontowave-button').isVisible();
  console.log(`🌊 Icône OntoWave: ${ontoWaveIcon ? 'visible' : 'non visible'}`);
  
  // Test 6: Vérifier la source locale (pas CDN)
  console.log('🔍 Test 6: Vérification source locale');
  
  const scripts = await page.locator('script[src]').all();
  let usingLocalSource = false;
  
  for (const script of scripts) {
    const src = await script.getAttribute('src');
    if (src === 'ontowave.min.js') {
      usingLocalSource = true;
      console.log('✅ Source: Utilise le fichier local ontowave.min.js');
      break;
    } else if (src && src.includes('cdn.jsdelivr.net')) {
      console.log('❌ Source: Utilise encore le CDN au lieu du fichier local');
    }
  }
  
  if (!usingLocalSource) {
    console.log('❌ Source: Fichier local ontowave.min.js non trouvé');
  }
  
  // Résumé
  console.log('\\n📋 RÉSUMÉ DES TESTS:');
  console.log(`🎯 Icônes: ${!forbiddenFound ? '✅' : '❌'}`);
  console.log(`📝 Titres H4+: ${h4Elements === 0 ? '✅' : '❌'}`);
  console.log(`🎨 Prism: ${prismElements > 0 ? '✅' : '❌'}`);
  console.log(`📊 PlantUML: ${plantUMLBlocks > 0 ? '✅' : '❌'}`);
  console.log(`🌊 OntoWave: ${ontoWaveIcon ? '✅' : '❌'}`);
  console.log(`📦 Source locale: ${usingLocalSource ? '✅' : '❌'}`);
  
  await page.screenshot({ path: 'test-corrections-regression.png', fullPage: true });
});
