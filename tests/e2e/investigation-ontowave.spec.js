import { test, expect } from '@playwright/test';

test('Investigation et correction des problèmes', async ({ page }) => {
  console.log('🔍 INVESTIGATION DES PROBLÈMES ONTOWAVE');
  
  await page.goto('http://localhost:8080', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Investiguer le titre H4
  console.log('\n1. 📝 INVESTIGATION TITRE H4:');
  const h4Elements = await page.locator('h4').all();
  console.log(`Nombre de H4 trouvés: ${h4Elements.length}`);
  
  for (let i = 0; i < h4Elements.length; i++) {
    const h4Text = await h4Elements[i].textContent();
    console.log(`  H4 ${i+1}: "${h4Text}"`);
  }
  
  // Investiguer les boutons de langue
  console.log('\n2. 🌐 INVESTIGATION SYSTÈME MULTILINGUE:');
  
  // Chercher différents sélecteurs possibles
  const selectors = [
    '[data-ontowave-lang]',
    '.lang-button', 
    '.language-toggle',
    '.language-selector',
    '[href*="fr"]',
    '[href*="en"]',
    'text=FR',
    'text=EN'
  ];
  
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`  ${selector}: ${count} éléments trouvés`);
    }
  }
  
  // Investiguer l'interface OntoWave
  console.log('\n3. 🌊 INVESTIGATION INTERFACE ONTOWAVE:');
  
  const interfaceSelectors = [
    '.ontowave-button',
    '.ontowave-icon', 
    '.ontowave-menu-button',
    '.ontowave-float-button',
    '.ontowave-toggle',
    '#ontowave-button',
    '[class*="ontowave"]'
  ];
  
  for (const selector of interfaceSelectors) {
    const count = await page.locator(selector).count();
    const visible = count > 0 ? await page.locator(selector).first().isVisible() : false;
    console.log(`  ${selector}: ${count} éléments, visible: ${visible}`);
  }
  
  // Investiguer PlantUML
  console.log('\n4. 📊 INVESTIGATION PLANTUML:');
  
  const plantUMLSelectors = [
    'pre code.language-plantuml',
    '.plantuml-diagram', 
    '[class*="plantuml"]',
    'text=@startuml'
  ];
  
  for (const selector of plantUMLSelectors) {
    const count = await page.locator(selector).count();
    console.log(`  ${selector}: ${count} éléments`);
  }
  
  // Vérifier le contenu des fichiers markdown
  console.log('\n5. 📄 CONTENU MARKDOWN:');
  const markdownContent = await page.evaluate(async () => {
    try {
      const frResponse = await fetch('/index.fr.md');
      const frContent = await frResponse.text();
      return {
        hasPlantUML: frContent.includes('@startuml'),
        hasH4: frContent.includes('####'),
        contentLength: frContent.length
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  
  console.log(`  PlantUML dans MD: ${markdownContent.hasPlantUML ? '✅' : '❌'}`);
  console.log(`  H4 dans MD: ${markdownContent.hasH4 ? '❌ Présent' : '✅ Absent'}`);
  console.log(`  Taille contenu: ${markdownContent.contentLength} caractères`);
  
  // Vérifier les scripts et styles chargés
  console.log('\n6. 📦 SCRIPTS ET STYLES:');
  
  const scripts = await page.locator('script[src]').all();
  console.log(`Scripts externes: ${scripts.length}`);
  for (const script of scripts) {
    const src = await script.getAttribute('src');
    console.log(`  - ${src}`);
  }
  
  const styles = await page.locator('link[rel="stylesheet"]').count();
  console.log(`Feuilles de style: ${styles}`);
  
  // Vérifier les erreurs console
  console.log('\n7. 🚨 ERREURS CONSOLE:');
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });
  
  await page.reload();
  await page.waitForTimeout(2000);
  
  if (logs.length > 0) {
    console.log(`Erreurs trouvées: ${logs.length}`);
    logs.forEach(log => console.log(`  - ${log}`));
  } else {
    console.log('Aucune erreur console');
  }
  
  console.log('\n📋 FIN DE L\'INVESTIGATION');
  await page.screenshot({ path: 'investigation-ontowave.png', fullPage: true });
});
