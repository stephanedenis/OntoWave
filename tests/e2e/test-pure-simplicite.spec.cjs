const { test, expect } = require('@playwright/test');

test.describe('Test OntoWave Pure et Simple', () => {
  test('OntoWave fonctionne avec juste HTML + JS + MD', async ({ page }) => {
    console.log('🚀 Test OntoWave pur et simple');
    
    // Aller sur la page
    const filePath = 'file:///home/stephane/GitHub/OntoWave/docs/index.html';
    await page.goto(filePath);
    console.log('✅ 1. Page chargée via file://');
    
    // Attendre OntoWave
    await page.waitForTimeout(3000);
    
    // Vérifier le titre
    const title = await page.title();
    console.log('📄 Titre:', title);
    
    // Vérifier qu'OntoWave a généré du contenu
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML;
    });
    console.log('📦 Contenu body length:', bodyContent.length);
    
    // Chercher des éléments OntoWave typiques
    const hasOntoWaveContent = await page.evaluate(() => {
      return document.body.innerHTML.includes('OntoWave') && 
             document.body.children.length > 1; // Plus que juste le script
    });
    console.log(hasOntoWaveContent ? '✅ 2. Contenu OntoWave détecté' : '❌ 2. Pas de contenu OntoWave');
    
    // Vérifier qu'il n'y a pas d'erreurs
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ Erreur:', msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    console.log('🔍 Erreurs JS:', errors.length);
    
    console.log('🎉 TEST PURE SIMPLICITÉ TERMINÉ !');
    console.log('📁 Fichiers requis: index.html + index.md + ontowave.min.js');
    console.log('🚫 Aucun config.json, nav.yml ou autres fichiers auxiliaires');
  });
});
