const { test, expect } = require('@playwright/test');

test.describe('Test OntoWave Direct', () => {
  test('Ouvrir la page directement via file://', async ({ page }) => {
    console.log('🚀 Test OntoWave via file://');
    
    // Aller directement sur le fichier index.html
    const filePath = 'file:///home/stephane/GitHub/OntoWave/docs/index.html';
    await page.goto(filePath);
    console.log('✅ 1. Page chargée via file://');
    
    // Attendre un peu pour OntoWave
    await page.waitForTimeout(5000);
    
    // Vérifier le titre
    const title = await page.title();
    console.log('📄 Titre:', title);
    
    // Vérifier le contenu du body
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML;
    });
    console.log('📦 Contenu body length:', bodyContent.length);
    console.log('📦 Début du contenu:', bodyContent.substring(0, 200));
    
    // Vérifier s'il y a des erreurs
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ Erreur:', msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log('🔍 Nombre d\'erreurs:', errors.length);
    
    console.log('🎉 TEST DIRECT TERMINÉ !');
  });
});
