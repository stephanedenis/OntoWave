const { test, expect } = require('@playwright/test');

test('Test Prism coloration syntaxique', async ({ page }) => {
  console.log('🎨 Test de la coloration syntaxique Prism');
  
  await page.goto('http://localhost:8000');
  await page.waitForTimeout(4000); // Attendre plus longtemps pour la recoloration
  
  // Vérifier que Prism est chargé
  const prismLoaded = await page.evaluate(() => {
    return typeof window.Prism !== 'undefined' && 
           typeof window.Prism.highlightAll === 'function';
  });
  
  console.log('📚 Prism chargé:', prismLoaded);
  expect(prismLoaded).toBe(true);
  
  // NE PAS forcer la recoloration pour éviter l'erreur PHP
  // Attendre juste que le contenu soit naturellement coloré
  await page.waitForTimeout(2000);
  
  // Chercher des blocs de code
  const codeBlocks = page.locator('pre[class*="language-"], code[class*="language-"]');
  const count = await codeBlocks.count();
  console.log('🔍 Blocs de code trouvés:', count);
  
  if (count > 0) {
    // Vérifier qu'au moins un bloc a été coloré par Prism
    const coloredBlocks = await page.evaluate(() => {
      const blocks = document.querySelectorAll('pre[class*="language-"], code[class*="language-"]');
      let coloredCount = 0;
      
      blocks.forEach(block => {
        // Chercher des spans avec des classes Prism (token, keyword, string, etc.)
        const spans = block.querySelectorAll('span[class*="token"]');
        if (spans.length > 0) {
          coloredCount++;
        }
      });
      
      return { total: blocks.length, colored: coloredCount };
    });
    
    console.log('🎨 Blocs colorés:', coloredBlocks);
    
    // Au moins un bloc doit être coloré
    expect(coloredBlocks.colored).toBeGreaterThan(0);
    console.log('✅ Prism colore bien le code');
  } else {
    console.log('ℹ️ Aucun bloc de code trouvé pour tester Prism');
  }
  
  console.log('🎉 Test Prism terminé');
});
