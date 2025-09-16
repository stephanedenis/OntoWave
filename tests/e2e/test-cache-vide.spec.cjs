const { test, expect } = require('@playwright/test');

test('Test avec cache vidé - boutons de langue', async ({ page }) => {
  console.log('🧹 Test avec cache navigateur vidé');
  
  // Vider le cache navigateur avant le test
  const context = page.context();
  await context.clearCookies();
  await context.clearPermissions();
  
  // Désactiver le cache pour cette session
  await page.route('**/*', route => {
    route.continue({
      headers: {
        ...route.request().headers(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  });
  
  console.log('🔄 Cache vidé, accès à la page...');
  
  // Aller sur la page avec un timestamp pour forcer le rechargement
  const timestamp = Date.now();
  await page.goto(`http://localhost:8080/?t=${timestamp}`, { waitUntil: 'networkidle' });
  
  // Forcer le rechargement de la page
  await page.reload({ waitUntil: 'networkidle' });
  
  // Attendre que OntoWave soit chargé
  await page.waitForSelector('.ontowave-floating-menu', { timeout: 10000 });
  console.log('✅ OntoWave chargé après vidage cache');
  
  // Vérifier les boutons fixes (ne devraient PAS être là)
  const fixedButtons = await page.locator('.ontowave-fixed-lang-btn').count();
  console.log(`🔸 Boutons fixes: ${fixedButtons} (attendu: 0)`);
  
  if (fixedButtons > 0) {
    console.log('❌ PROBLÈME: Des boutons fixes sont présents!');
    
    // Capturer leur contenu pour debug
    for (let i = 0; i < fixedButtons; i++) {
      const button = page.locator('.ontowave-fixed-lang-btn').nth(i);
      const text = await button.textContent();
      const style = await button.getAttribute('style');
      const isVisible = await button.isVisible();
      console.log(`   Bouton fixe ${i}: "${text}" visible=${isVisible} style="${style}"`);
    }
    
    // Faire une capture d'écran pour le debug
    await page.screenshot({ 
      path: '/tmp/boutons-probleme.png', 
      fullPage: true 
    });
    console.log('📸 Capture sauvée: /tmp/boutons-probleme.png');
  }
  
  // Ouvrir le menu pour vérifier les boutons du menu
  await page.click('#ontowave-menu-icon');
  await page.waitForSelector('.ontowave-menu-content', { visible: true });
  
  const menuButtons = await page.locator('.ontowave-lang-btn').count();
  console.log(`🔸 Boutons menu: ${menuButtons} (attendu: 2)`);
  
  // Résumé
  if (fixedButtons === 0 && menuButtons === 2) {
    console.log('✅ CORRECT: Configuration fonctionne bien');
  } else {
    console.log('❌ PROBLÈME CONFIRMÉ: Configuration incorrecte');
  }
});
