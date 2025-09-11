import { test, expect } from '@playwright/test';

test('Diagnostic Prism - Étapes de debug', async ({ page }) => {
  console.log('🔍 DIAGNOSTIC PRISM - Début...');
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Étape 1: Vérifier si Prism est chargé globalement
  const prismGlobal = await page.evaluate(() => {
    return {
      prismExists: typeof window.Prism !== 'undefined',
      prismCore: !!(window.Prism && window.Prism.highlight),
      prismLanguages: window.Prism ? Object.keys(window.Prism.languages || {}) : []
    };
  });
  
  console.log('📊 Prism Global:', JSON.stringify(prismGlobal, null, 2));
  
  // Étape 2: Vérifier tous les blocs de code
  const allCodeBlocks = await page.locator('code').all();
  console.log(`📝 Nombre total de blocs <code>: ${allCodeBlocks.length}`);
  
  for (let i = 0; i < allCodeBlocks.length; i++) {
    const block = allCodeBlocks[i];
    const className = await block.getAttribute('class');
    const content = await block.textContent();
    console.log(`Code ${i}: class="${className}", content="${content?.substring(0, 30)}..."`);
  }
  
  // Étape 3: Vérifier les blocs <pre>
  const preBlocks = await page.locator('pre').all();
  console.log(`📦 Nombre total de blocs <pre>: ${preBlocks.length}`);
  
  for (let i = 0; i < preBlocks.length; i++) {
    const pre = preBlocks[i];
    const className = await pre.getAttribute('class');
    const codeInside = await pre.locator('code').first();
    const codeClass = await codeInside.getAttribute('class').catch(() => 'pas de code');
    console.log(`Pre ${i}: class="${className}", code class="${codeClass}"`);
  }
  
  // Étape 4: Chercher spécifiquement language-html
  const htmlBlocks = await page.locator('code.language-html').all();
  console.log(`🏷️ Blocs avec language-html: ${htmlBlocks.length}`);
  
  // Étape 5: Chercher des tokens Prism
  const tokenElements = await page.locator('.token').all();
  console.log(`🎨 Éléments avec classe .token: ${tokenElements.length}`);
  
  // Étape 6: Vérifier les scripts chargés
  const scripts = await page.evaluate(() => {
    return Array.from(document.scripts).map(s => s.src).filter(src => src.includes('prism'));
  });
  console.log('📜 Scripts Prism chargés:', scripts);
  
  // Étape 7: Vérifier les CSS chargés
  const stylesheets = await page.evaluate(() => {
    return Array.from(document.styleSheets).map(s => s.href).filter(href => href && href.includes('prism'));
  });
  console.log('🎨 CSS Prism chargés:', stylesheets);
  
  console.log('🔍 DIAGNOSTIC PRISM - Fin');
});
