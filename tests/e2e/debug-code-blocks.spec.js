import { test, expect } from '@playwright/test';

test.describe('OntoWave - Debug des exemples de code', () => {
  
  test('Debug HTML généré', async ({ page }) => {
    console.log('🔍 Debug: Analyse du HTML généré');
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(3000);
    
    // Attendre que le contenu soit chargé
    await page.waitForSelector('.ontowave-content', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Récupérer le HTML brut du markdown chargé
    const markdownSource = await page.evaluate(async () => {
      try {
        const response = await fetch('/index.md');
        return await response.text();
      } catch (e) {
        return 'Error: ' + e.message;
      }
    });
    
    console.log('📄 Contenu Markdown source:', markdownSource.substring(0, 500) + '...');
    
    // Récupérer le HTML généré dans le content
    const generatedHTML = await page.locator('.ontowave-content').innerHTML();
    console.log('🏗️ HTML généré:', generatedHTML.substring(0, 500) + '...');
    
    // Vérifier spécifiquement les blocs de code
    const codeBlocksInHTML = generatedHTML.match(/```html[\s\S]*?```/g);
    console.log('📝 Blocs de code trouvés dans Markdown:', codeBlocksInHTML?.length || 0);
    
    const preElements = await page.$$('pre');
    console.log('📦 Éléments <pre> dans le DOM:', preElements.length);
    
    const codeElements = await page.$$('code');
    console.log('💻 Éléments <code> dans le DOM:', codeElements.length);
    
    // Vérifier la regex de traitement des blocs de code
    const hasCodePattern = markdownSource.includes('```html');
    console.log('🔍 Pattern \\`\\`\\`html trouvé dans source:', hasCodePattern);
    
    // Debug des langues
    const frContent = await page.locator('#lang-fr').isVisible();
    const enContent = await page.locator('#lang-en').isVisible();
    console.log('🇫🇷 Contenu français visible:', frContent);
    console.log('🇬🇧 Contenu anglais visible:', enContent);
    
    // Capture de debug
    await page.screenshot({ 
      path: 'tests/artifacts/debug-html-generation.png',
      fullPage: true 
    });
  });

  test('Test de la regex de code', async ({ page }) => {
    console.log('🔍 Debug: Test de la regex des blocs de code');
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    // Tester directement la regex dans le navigateur
    const regexTest = await page.evaluate(() => {
      const testMarkdown = '### Test\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Test</title>\n</head>\n<body>\n    <script src="ontowave.js"></script>\n</body>\n</html>\n```\n\nAutre contenu.';
      
      // Test de la regex actuelle
      const matches = testMarkdown.match(/```(\\w+)([\\s\\S]*?)```/g);
      
      return {
        testMarkdown: testMarkdown.substring(0, 100),
        regexMatches: matches,
        matchCount: matches ? matches.length : 0
      };
    });
    
    console.log('🧪 Test de regex:', regexTest);
    
    expect(regexTest.matchCount).toBeGreaterThan(0);
  });
});
