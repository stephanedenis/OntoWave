const { test, expect } = require('@playwright/test');

test('Test détaillé boutons multilingues', async ({ page }) => {
  console.log('🧪 Test détaillé des boutons multilingues...');
  
  // Activer les logs console
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('OntoWave')) {
      console.log(`📊 ${msg.text()}`);
    }
  });
  
  // Aller à la page d'accueil
  await page.goto('http://localhost:8080/');
  
  // Attendre que OntoWave se charge complètement
  await page.waitForTimeout(5000);
  
  // Prendre un screenshot pour debug
  await page.screenshot({ path: '/tmp/ontowave-debug.png' });
  
  // Vérifier le contenu de la page
  const fullContent = await page.textContent('body');
  console.log(`📝 Contenu détecté (${fullContent.length} chars)`);
  
  // Chercher tous les éléments avec attributs data-lang
  const langElements = await page.locator('[data-lang]').count();
  console.log(`🌐 ${langElements} éléments avec data-lang trouvés`);
  
  // Chercher les boutons spécifiques
  const frButtons = await page.locator('[data-lang="fr"], button:has-text("FR"), [title*="Français"]').count();
  const enButtons = await page.locator('[data-lang="en"], button:has-text("EN"), [title*="English"]').count();
  
  console.log(`🇫🇷 ${frButtons} boutons français trouvés`);
  console.log(`🇬🇧 ${enButtons} boutons anglais trouvés`);
  
  // Vérifier s'il y a un menu OntoWave visible
  const menuElements = await page.locator('.ontowave-menu, .ontowave-panel, [class*="menu"]').count();
  console.log(`📋 ${menuElements} éléments de menu trouvés`);
  
  // Chercher l'icône OntoWave avec plus de sélecteurs
  const iconSelectors = [
    '[title="OntoWave"]',
    '.ontowave-icon',
    '.ontowave-toggle',
    '[data-ontowave]',
    'button:has-text("🌊")',
    '.floating-button',
    '[class*="floating"]',
    '[class*="icon"]'
  ];
  
  for (const selector of iconSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`🔍 ${count} éléments trouvés avec: ${selector}`);
      
      // Essayer de cliquer sur le premier élément trouvé
      try {
        await page.locator(selector).first().click();
        await page.waitForTimeout(1000);
        console.log(`✅ Clic réussi sur ${selector}`);
        
        // Vérifier si des boutons de langue apparaissent après le clic
        const newLangElements = await page.locator('[data-lang]').count();
        console.log(`🌐 ${newLangElements} éléments avec data-lang après clic`);
        
        break;
      } catch (e) {
        console.log(`❌ Échec du clic sur ${selector}: ${e.message}`);
      }
    }
  }
  
  console.log('🎯 Test détaillé terminé');
});
