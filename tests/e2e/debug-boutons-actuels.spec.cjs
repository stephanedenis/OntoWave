const { test, expect } = require('@playwright/test');

test('Debug état actuel des boutons de langue', async ({ page }) => {
  console.log('🔍 DIAGNOSTIC BOUTONS DE LANGUE');
  
  // Aller sur la page
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  
  // Attendre que OntoWave soit chargé
  await page.waitForSelector('.ontowave-floating-menu', { timeout: 10000 });
  console.log('✅ OntoWave chargé');
  
  // 1. Vérifier les boutons fixes (ne devraient PAS être visibles par défaut)
  const fixedButtons = await page.locator('.ontowave-fixed-lang-btn').count();
  console.log(`🔸 Boutons fixes trouvés: ${fixedButtons} (attendu: 0)`);
  
  if (fixedButtons > 0) {
    const fixedVisible = await page.locator('.ontowave-fixed-lang-btn').first().isVisible();
    console.log(`🔸 Boutons fixes visibles: ${fixedVisible}`);
    
    // Capturer les boutons fixes pour debug
    for (let i = 0; i < fixedButtons; i++) {
      const button = page.locator('.ontowave-fixed-lang-btn').nth(i);
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`   Bouton fixe ${i + 1}: "${text}" visible=${isVisible}`);
    }
  }
  
  // 2. Ouvrir le menu OntoWave
  await page.click('#ontowave-menu-icon');
  await page.waitForSelector('.ontowave-menu-content', { visible: true });
  console.log('✅ Menu OntoWave ouvert');
  
  // 3. Vérifier les boutons dans le menu
  const menuButtons = await page.locator('.ontowave-lang-btn').count();
  console.log(`🔸 Boutons dans le menu: ${menuButtons} (attendu: 2)`);
  
  if (menuButtons > 0) {
    for (let i = 0; i < menuButtons; i++) {
      const button = page.locator('.ontowave-lang-btn').nth(i);
      const text = await button.textContent();
      const classes = await button.getAttribute('class');
      const isVisible = await button.isVisible();
      console.log(`   Bouton menu ${i + 1}: "${text}" visible=${isVisible} classes="${classes}"`);
    }
  }
  
  // 4. Vérifier la configuration actuelle
  const config = await page.evaluate(() => {
    if (window.OntoWave && window.OntoWave.instance) {
      return {
        languageButtons: window.OntoWave.instance.config?.ui?.languageButtons,
        locales: window.OntoWave.instance.config?.locales,
        currentLanguage: window.OntoWave.instance.getCurrentLanguage?.()
      };
    }
    return { error: 'OntoWave non disponible' };
  });
  
  console.log('⚙️ Configuration actuelle:', JSON.stringify(config, null, 2));
  
  // 5. Résumé
  console.log('\n📊 RÉSUMÉ:');
  console.log(`   Boutons fixes: ${fixedButtons} (attendu: 0)`);
  console.log(`   Boutons menu: ${menuButtons} (attendu: 2)`);
  console.log(`   Config languageButtons: ${config.languageButtons || 'undefined'}`);
  
  if (fixedButtons === 0 && menuButtons === 2) {
    console.log('✅ Configuration correcte: boutons uniquement dans le menu');
  } else {
    console.log('❌ Problème détecté avec les boutons de langue');
  }
});
