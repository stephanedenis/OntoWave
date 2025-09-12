const { test, expect } = require('@playwright/test');

test('Test système multilingue OntoWave', async ({ page }) => {
  console.log('🧪 Démarrage du test multilingue...');
  
  // Aller sur la page OntoWave
  await page.goto('http://localhost:8080/');
  
  // Attendre que la page se charge complètement
  await page.waitForTimeout(4000);
  
  // Vérifier que les éléments de base sont présents
  const langFr = await page.locator('#lang-fr').count();
  const langEn = await page.locator('#lang-en').count();
  const toggleButtons = await page.locator('.lang-toggle button').count();
  
  console.log('📊 Éléments trouvés:', { langFr, langEn, toggleButtons });
  
  // Vérifier que OntoWave est chargé
  const ontoWaveExists = await page.evaluate(() => !!window.OntoWave);
  const instanceExists = await page.evaluate(() => !!(window.OntoWave && window.OntoWave.instance));
  
  console.log('🌊 OntoWave:', { ontoWaveExists, instanceExists });
  
  // Tester la fonction toggleLang
  const toggleLangExists = await page.evaluate(() => typeof window.toggleLang === 'function');
  console.log('🔄 toggleLang disponible:', toggleLangExists);
  
  if (toggleLangExists) {
    // Tester le changement vers anglais
    console.log('🇬🇧 Test changement vers anglais...');
    await page.evaluate(() => window.toggleLang('en'));
    await page.waitForTimeout(1000);
    
    // Vérifier que le contenu anglais est affiché
    const enVisible = await page.locator('#lang-en.visible').count();
    console.log('Contenu anglais visible:', enVisible > 0);
    
    // Tester le changement vers français
    console.log('🇫🇷 Test changement vers français...');
    await page.evaluate(() => window.toggleLang('fr'));
    await page.waitForTimeout(1000);
    
    // Vérifier que le contenu français est affiché
    const frVisible = await page.locator('#lang-fr.visible').count();
    console.log('Contenu français visible:', frVisible > 0);
  }
  
  // Tester le clic sur les boutons
  try {
    console.log('🖱️ Test clic bouton anglais...');
    await page.click('#btn-en');
    await page.waitForTimeout(1000);
    
    console.log('🖱️ Test clic bouton français...');
    await page.click('#btn-fr');
    await page.waitForTimeout(1000);
    
    console.log('✅ Clics sur boutons réussis');
  } catch (error) {
    console.log('❌ Erreur lors du clic:', error.message);
  }
  
  // Tester le panneau de configuration OntoWave
  try {
    console.log('🌊 Test ouverture menu OntoWave...');
    
    // Cliquer sur l'icône OntoWave
    await page.click('.ontowave-menu-icon');
    await page.waitForTimeout(1000);
    
    // Cliquer sur Configuration
    await page.click('text=Configuration');
    await page.waitForTimeout(1000);
    
    // Vérifier que le panneau est ouvert
    const configPanel = await page.locator('#ontowave-config-panel').count();
    console.log('Panneau de configuration ouvert:', configPanel > 0);
    
    if (configPanel > 0) {
      // Tester le changement de langue avec panneau ouvert
      console.log('🔄 Test changement langue avec panneau ouvert...');
      await page.evaluate(() => window.toggleLang('en'));
      await page.waitForTimeout(2000);
      
      // Vérifier si le panneau a changé de langue
      const hasEnglishText = await page.locator('text=Complete Configuration').count();
      console.log('Texte anglais dans panneau:', hasEnglishText > 0);
    }
    
  } catch (error) {
    console.log('⚠️ Erreur test panneau OntoWave:', error.message);
  }
  
  console.log('🎯 Test terminé');
});
