const { test, expect } = require('@playwright/test');

test('Debug contenu blocs Prism', async ({ page }) => {
  console.log('🔍 Debug du contenu des blocs Prism');
  
  await page.goto('http://localhost:8000');
  await page.waitForTimeout(4000);
  
  // Chercher tous les blocs de code
  const codeBlocks = await page.evaluate(() => {
    const blocks = document.querySelectorAll('pre, code');
    const result = [];
    
    blocks.forEach((block, index) => {
      result.push({
        index,
        tagName: block.tagName,
        className: block.className,
        textContent: block.textContent?.substring(0, 200) + (block.textContent?.length > 200 ? '...' : ''),
        innerHTML: block.innerHTML?.substring(0, 200) + (block.innerHTML?.length > 200 ? '...' : ''),
        hasLanguageClass: block.className.includes('language-'),
        parent: block.parentElement?.tagName
      });
    });
    
    return result;
  });
  
  console.log('📋 Blocs de code trouvés:', codeBlocks.length);
  codeBlocks.forEach(block => {
    console.log(`Bloc ${block.index}: ${block.tagName}.${block.className}`);
    console.log(`  Contenu texte: "${block.textContent}"`);
    console.log(`  HTML: "${block.innerHTML}"`);
    console.log(`  Classe langage: ${block.hasLanguageClass}`);
    console.log('---');
  });
  
  // Vérifier spécifiquement les blocs avec language-html
  const htmlBlocks = await page.evaluate(() => {
    const blocks = document.querySelectorAll('.language-html, code.language-html, pre.language-html');
    const result = [];
    
    blocks.forEach((block, index) => {
      result.push({
        index,
        tagName: block.tagName,
        textContent: block.textContent,
        innerHTML: block.innerHTML,
        outerHTML: block.outerHTML?.substring(0, 300)
      });
    });
    
    return result;
  });
  
  console.log('🌐 Blocs HTML spécifiques:', htmlBlocks.length);
  htmlBlocks.forEach(block => {
    console.log(`HTML Bloc ${block.index}:`);
    console.log(`  Texte: "${block.textContent}"`);
    console.log(`  HTML complet: "${block.outerHTML}"`);
    console.log('---');
  });
});
