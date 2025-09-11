import { test, expect } from '@playwright/test';

test('Vérification du rendu Prism pour coloration syntaxique', async ({ page }) => {
  console.log('🧪 Test: Vérification de la coloration syntaxique Prism...');
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  
  // Attendre que Prism se charge complètement
  await page.waitForFunction(() => window.Prism !== undefined, { timeout: 15000 });
  console.log('✅ Prism détecté comme chargé');
  
  // Attendre un délai supplémentaire pour la coloration
  await page.waitForTimeout(3000);
  
  // Chercher le bloc de code HTML spécifiquement
  const htmlCodeBlocks = await page.locator('code.language-html').all();
  console.log(`📊 Nombre de blocs HTML détectés: ${htmlCodeBlocks.length}`);
  
  if (htmlCodeBlocks.length === 0) {
    console.log('❌ Aucun bloc de code HTML trouvé avec la classe language-html');
    // Vérifions s'il y a des blocs de code sans classe
    const allCodeBlocks = await page.locator('code').all();
    console.log(`📊 Nombre total de blocs code: ${allCodeBlocks.length}`);
    
    for (let i = 0; i < allCodeBlocks.length; i++) {
      const className = await allCodeBlocks[i].getAttribute('class');
      const textContent = await allCodeBlocks[i].textContent();
      console.log(`Code block ${i}: class="${className}", content preview: "${textContent?.substring(0, 50)}..."`);
    }
    
    throw new Error('Aucun bloc HTML avec classe language-html trouvé');
  }
  
  // Prendre le premier bloc HTML
  const htmlBlock = htmlCodeBlocks[0];
  const htmlContent = await htmlBlock.textContent();
  console.log(`📝 Contenu HTML: ${htmlContent?.substring(0, 100)}...`);
  
  // Vérifier la présence de tokens Prism
  const tokenElements = await htmlBlock.locator('.token').all();
  console.log(`🎨 Nombre de tokens Prism trouvés: ${tokenElements.length}`);
  
  if (tokenElements.length === 0) {
    console.log('❌ Aucun token Prism trouvé - la coloration syntaxique ne fonctionne pas');
    
    // Debug: vérifier les classes CSS présentes
    const className = await htmlBlock.getAttribute('class');
    console.log(`Debug: classe du bloc de code: "${className}"`);
    
    // Vérifier si Prism a bien été appelé
    const prismStatus = await page.evaluate(() => {
      return {
        prismExists: !!window.Prism,
        prismComponents: window.Prism ? Object.keys(window.Prism.languages || {}) : [],
        prismPlugins: window.Prism ? Object.keys(window.Prism.plugins || {}) : []
      };
    });
    console.log('🔍 Status Prism:', JSON.stringify(prismStatus, null, 2));
    
    throw new Error('Coloration syntaxique Prism non appliquée');
  }
  
  // Vérifier des types de tokens spécifiques pour HTML
  const tagTokens = await htmlBlock.locator('.token.tag').all();
  const punctuationTokens = await htmlBlock.locator('.token.punctuation').all();
  const attrNameTokens = await htmlBlock.locator('.token.attr-name').all();
  
  console.log(`🏷️  Tokens tag: ${tagTokens.length}`);
  console.log(`🔤 Tokens punctuation: ${punctuationTokens.length}`);
  console.log(`📛 Tokens attr-name: ${attrNameTokens.length}`);
  
  // Au minimum, on devrait avoir des tags et de la ponctuation pour HTML
  expect(tagTokens.length).toBeGreaterThan(0);
  expect(punctuationTokens.length).toBeGreaterThan(0);
  
  console.log('✅ Coloration syntaxique Prism fonctionne correctement pour HTML');
});
