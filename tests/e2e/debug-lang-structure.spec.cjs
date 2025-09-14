const { test, expect } = require('@playwright/test');

test.describe('Debug structure boutons langue', () => {
  test('Analyser la structure exacte des boutons de langue', async ({ page }) => {
    console.log('🔍 Analyse des boutons de langue...');
    
    await page.goto('http://localhost:8080/');
    await page.waitForSelector('.ontowave-container', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Cliquer sur l'icône pour ouvrir le menu
    await page.locator('.ontowave-menu-icon').click();
    await page.waitForTimeout(1000);
    
    // Analyser tous les boutons de langue
    const langButtons = await page.$$eval('.ontowave-lang-btn', buttons => {
      return buttons.map(btn => ({
        tagName: btn.tagName,
        className: btn.className,
        text: btn.textContent,
        innerHTML: btn.innerHTML,
        attributes: Array.from(btn.attributes).map(attr => ({
          name: attr.name,
          value: attr.value
        })),
        visible: btn.offsetParent !== null
      }));
    });
    
    console.log('🎯 Boutons de langue trouvés:', JSON.stringify(langButtons, null, 2));
    
    // Tester différentes façons de les sélectionner
    const frButton = page.locator('.ontowave-lang-btn').filter({ hasText: 'FR' });
    const enButton = page.locator('.ontowave-lang-btn').filter({ hasText: 'EN' });
    
    const frCount = await frButton.count();
    const enCount = await enButton.count();
    
    console.log(`📊 Boutons FR trouvés: ${frCount}`);
    console.log(`📊 Boutons EN trouvés: ${enCount}`);
    
    if (frCount > 0) {
      const frText = await frButton.first().textContent();
      const frClass = await frButton.first().getAttribute('class');
      console.log(`🇫🇷 Bouton FR - Texte: "${frText}", Classes: "${frClass}"`);
    }
    
    if (enCount > 0) {
      const enText = await enButton.first().textContent();
      const enClass = await enButton.first().getAttribute('class');
      console.log(`🇬🇧 Bouton EN - Texte: "${enText}", Classes: "${enClass}"`);
    }
  });
});
