const { test, expect } = require('@playwright/test');

test('Test améliorations interface', async ({ page }) => {
  console.log('🎨 Test des améliorations interface');
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(3000);
  
  // Vérifier que les titres #### ont disparu
  const badHeaders = await page.evaluate(() => {
    const content = document.body.textContent || '';
    return content.includes('####');
  });
  
  console.log('❌ Présence de "####":', badHeaders);
  expect(badHeaders).toBe(false);
  
  // Vérifier la position des boutons de langue
  const langTogglePosition = await page.evaluate(() => {
    const toggle = document.querySelector('.lang-toggle');
    if (!toggle) return null;
    
    const style = getComputedStyle(toggle);
    return {
      position: style.position,
      left: style.left,
      top: style.top,
      flexDirection: style.flexDirection
    };
  });
  
  console.log('🌐 Position boutons langue:', langTogglePosition);
  
  // Vérifier que les boutons sont à gauche et verticaux
  expect(langTogglePosition.position).toBe('fixed');
  expect(langTogglePosition.left).toBe('20px');
  expect(langTogglePosition.flexDirection).toBe('column');
  
  // Vérifier le contenu des boutons (plus courts)
  const buttonTexts = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.lang-toggle button');
    return Array.from(buttons).map(btn => btn.textContent);
  });
  
  console.log('🔘 Texte des boutons:', buttonTexts);
  expect(buttonTexts).toEqual(['🇫🇷 FR', '🇬🇧 EN']);
  
  console.log('✅ Améliorations interface validées');
});
