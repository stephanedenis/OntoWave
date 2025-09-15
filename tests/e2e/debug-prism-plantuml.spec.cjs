const { test, expect } = require('@playwright/test');

test('Debug Prism HTML et PlantUML', async ({ page }) => {
  // Aller sur la page
  await page.goto('http://localhost:8080/');
  
  console.log('🌐 Page chargée');
  
  // Attendre le chargement d'OntoWave
  await page.waitForFunction(() => window.OntoWave, { timeout: 10000 });
  
  // Attendre que le contenu soit rendu (OntoWave génère le contenu dynamiquement)
  await page.waitForFunction(() => document.body.children.length > 1, { timeout: 10000 });
  
  // Attendre un peu plus pour que tout soit rendu
  await page.waitForTimeout(2000);
  
  console.log('🌊 OntoWave chargé');
  
  // Vérifier les blocs de code HTML avec Prism
  const htmlCodeBlocks = await page.$$('pre[class*="language-html"], code[class*="language-html"]');
  console.log(`📝 Blocs HTML trouvés : ${htmlCodeBlocks.length}`);
  
  for (let i = 0; i < htmlCodeBlocks.length; i++) {
    const block = htmlCodeBlocks[i];
    const classList = await block.evaluate(el => el.className);
    const hasHighlighting = await block.evaluate(el => 
      el.querySelector('.token') !== null || el.classList.contains('language-html')
    );
    console.log(`  📄 Bloc ${i+1} : classes="${classList}", highlighting=${hasHighlighting}`);
  }
  
  // Vérifier les diagrammes PlantUML
  const plantUMLElements = await page.$$('svg[id*="plantuml"], div[class*="plantuml"]');
  console.log(`🌱 Éléments PlantUML trouvés : ${plantUMLElements.length}`);
  
  // Rechercher les blocs PlantUML en markdown
  const plantUMLBlocks = await page.$$eval('pre', blocks => 
    blocks.filter(block => block.textContent.includes('@startuml') || block.textContent.includes('@startmindmap'))
  );
  console.log(`📊 Blocs PlantUML markdown : ${plantUMLBlocks.length}`);
  
  // Vérifier les erreurs JavaScript
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Attendre un peu pour capturer les erreurs
  await page.waitForTimeout(3000);
  
  if (errors.length > 0) {
    console.log('❌ Erreurs JavaScript détectées :');
    errors.forEach(error => console.log(`  💥 ${error}`));
  } else {
    console.log('✅ Aucune erreur JavaScript');
  }
  
  // Vérifier la configuration OntoWave
  const config = await page.evaluate(() => {
    if (window.OntoWave && window.OntoWave.config) {
      return {
        enablePrism: window.OntoWave.config.enablePrism,
        enablePlantUML: window.OntoWave.config.enablePlantUML,
        enableMermaid: window.OntoWave.config.enableMermaid
      };
    }
    return null;
  });
  
  console.log('⚙️ Configuration OntoWave :', config);
  
  // Test final : vérifier si les fonctionnalités sont actives
  const prismActive = await page.evaluate(() => window.Prism !== undefined);
  const plantUMLActive = await page.evaluate(() => window.plantumlEncoder !== undefined);
  
  console.log(`🎨 Prism actif : ${prismActive}`);
  console.log(`🌱 PlantUML actif : ${plantUMLActive}`);
});
