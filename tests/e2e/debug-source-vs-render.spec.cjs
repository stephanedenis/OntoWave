const { test, expect } = require('@playwright/test');

test('Debug page source vs rendu', async ({ page }) => {
  console.log('🔍 Debug source vs rendu');
  
  await page.goto('http://localhost:8000');
  await page.waitForTimeout(3000);
  
  // Récupérer le HTML source de la page
  const pageSource = await page.content();
  
  // Chercher les blocs code dans le source
  const sourceCodeBlocks = pageSource.match(/```html[\s\S]*?```/g) || [];
  console.log('📄 Blocs dans le source:', sourceCodeBlocks.length);
  
  sourceCodeBlocks.forEach((block, index) => {
    console.log(`Source bloc ${index}:`, block.substring(0, 100) + '...');
  });
  
  // Récupérer le markdown original
  const markdownResponse = await page.goto('http://localhost:8000/index.md');
  const markdownContent = await markdownResponse.text();
  
  const markdownCodeBlocks = markdownContent.match(/```html[\s\S]*?```/g) || [];
  console.log('📝 Blocs dans le markdown:', markdownCodeBlocks.length);
  
  markdownCodeBlocks.forEach((block, index) => {
    console.log(`Markdown bloc ${index}:`, block.substring(0, 100) + '...');
  });
  
  // Retourner à la page HTML rendue
  await page.goto('http://localhost:8000');
  await page.waitForTimeout(2000);
  
  // Vérifier le contenu d'un bloc spécifique
  const codeContent = await page.evaluate(() => {
    const firstCodeBlock = document.querySelector('code.language-html');
    return {
      textContent: firstCodeBlock ? firstCodeBlock.textContent : 'Non trouvé',
      innerHTML: firstCodeBlock ? firstCodeBlock.innerHTML : 'Non trouvé',
      outerHTML: firstCodeBlock ? firstCodeBlock.outerHTML.substring(0, 200) : 'Non trouvé'
    };
  });
  
  console.log('🎯 Premier bloc code rendu:', codeContent);
});
