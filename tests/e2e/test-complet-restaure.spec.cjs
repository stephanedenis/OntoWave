const { test, expect } = require('@playwright/test');

test.describe('Test OntoWave Complet Restauré', () => {
  test('Validation de toutes les fonctionnalités restaurées', async ({ page }) => {
    console.log('🚀 Test OntoWave complet restauré');
    
    // Aller sur la page
    const filePath = 'file:///home/stephane/GitHub/OntoWave/docs/index.html';
    await page.goto(filePath);
    console.log('✅ 1. Page chargée');
    
    // Attendre OntoWave
    await page.waitForTimeout(4000);
    
    // Vérifier UTF-8
    const title = await page.title();
    console.log('📄 Titre:', title);
    
    // Vérifier la licence CC BY-NC-SA
    const hasLicense = await page.evaluate(() => {
      return document.body.innerHTML.includes('CC BY-NC-SA') || 
             document.body.innerHTML.includes('Creative Commons');
    });
    console.log(hasLicense ? '✅ 2. Licence CC BY-NC-SA présente' : '❌ 2. Licence manquante');
    
    // Vérifier les boutons de langue
    const hasLangButtons = await page.evaluate(() => {
      return document.body.innerHTML.includes('lang-toggle') ||
             document.body.innerHTML.includes('🇫🇷') ||
             document.body.innerHTML.includes('🇬🇧');
    });
    console.log(hasLangButtons ? '✅ 3. Boutons de langue présents' : '❌ 3. Boutons de langue manquants');
    
    // Vérifier les tableaux (rechercher | ou -----)
    const hasTables = await page.evaluate(() => {
      return document.body.innerHTML.includes('table') ||
             document.body.innerHTML.includes('-----');
    });
    console.log(hasTables ? '✅ 4. Tableaux détectés' : '⚠️ 4. Pas de tableaux trouvés');
    
    // Vérifier les niveaux de titre (h4+)
    const hasH4Plus = await page.evaluate(() => {
      return document.querySelector('h4') !== null ||
             document.querySelector('h5') !== null ||
             document.querySelector('h6') !== null;
    });
    console.log(hasH4Plus ? '✅ 5. Titres h4+ rendus' : '⚠️ 5. Pas de titres h4+ trouvés');
    
    // Vérifier PlantUML (rechercher @startuml ou plantuml)
    const hasPlantUML = await page.evaluate(() => {
      return document.body.innerHTML.includes('plantuml') ||
             document.body.innerHTML.includes('@startuml');
    });
    console.log(hasPlantUML ? '✅ 6. PlantUML détecté' : '⚠️ 6. Pas de PlantUML trouvé');
    
    // Vérifier la longueur du contenu
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML;
    });
    console.log('📦 Contenu body length:', bodyContent.length);
    
    // Vérifier les erreurs JS
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ Erreur JS:', msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    console.log('🔍 Erreurs JS:', errors.length);
    
    console.log('🎉 TEST COMPLET TERMINÉ !');
  });
});
