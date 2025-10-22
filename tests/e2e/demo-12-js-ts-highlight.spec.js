import { test, expect } from '@playwright/test';

test.describe('Démo 12: JavaScript & TypeScript Highlighting', () => {
  test('vérifie que JavaScript et TypeScript sont colorés avec Prism', async ({ page }) => {
    // Capturer les erreurs console
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('❌ Page Error:', error.message);
    });

    // Naviguer vers la démo
    console.log('📄 Chargement de la page...');
    await page.goto('http://localhost:8080/demos/12-js-ts-highlight.html', {
      waitUntil: 'networkidle'
    });

    // Attendre que OntoWave charge le contenu Markdown
    await page.waitForFunction(() => {
      const container = document.querySelector('#ontowave-container');
      return container && container.textContent.length > 100;
    }, { timeout: 10000 });

    // Attendre que Prism ait traité le contenu (présence de tokens)
    await page.waitForFunction(() => {
      return document.querySelectorAll('.token').length > 0;
    }, { timeout: 5000 });

    console.log('✅ Page chargée et contenu rendu\n');

    // Vérifier que les blocs de code JavaScript sont présents
    const jsCodeBlocks = await page.locator('code.language-javascript').count();
    console.log(`🔍 Blocs JavaScript trouvés: ${jsCodeBlocks}`);
    expect(jsCodeBlocks).toBeGreaterThan(0);

    // Vérifier que les blocs de code TypeScript sont présents
    const tsCodeBlocks = await page.locator('code.language-typescript').count();
    console.log(`🔍 Blocs TypeScript trouvés: ${tsCodeBlocks}`);
    expect(tsCodeBlocks).toBeGreaterThan(0);

    // Vérifier que Prism a appliqué le highlighting (présence de tokens)
    const jsTokens = await page.locator('code.language-javascript .token').count();
    console.log(`🎨 Tokens JavaScript colorés: ${jsTokens}`);
    expect(jsTokens).toBeGreaterThan(10); // Au moins 10 tokens

    const tsTokens = await page.locator('code.language-typescript .token').count();
    console.log(`🎨 Tokens TypeScript colorés: ${tsTokens}`);
    expect(tsTokens).toBeGreaterThan(10); // Au moins 10 tokens

    // Vérifier des tokens spécifiques JavaScript
    const jsKeywords = await page.locator('code.language-javascript .token.keyword').count();
    console.log(`🔑 Mots-clés JavaScript: ${jsKeywords}`);
    expect(jsKeywords).toBeGreaterThan(5);

    const jsFunctions = await page.locator('code.language-javascript .token.function').count();
    console.log(`🔧 Fonctions JavaScript: ${jsFunctions}`);
    expect(jsFunctions).toBeGreaterThan(0);

    // Vérifier des tokens spécifiques TypeScript
    const tsKeywords = await page.locator('code.language-typescript .token.keyword').count();
    console.log(`🔑 Mots-clés TypeScript: ${tsKeywords}`);
    expect(tsKeywords).toBeGreaterThan(5);

    const tsClassNames = await page.locator('code.language-typescript .token.class-name').count();
    console.log(`📦 Class names TypeScript: ${tsClassNames}`);
    expect(tsClassNames).toBeGreaterThan(0);

    // Vérifier qu'il n'y a pas d'erreurs bloquantes
    const criticalErrors = errors.filter(err => 
      !err.includes('class-name') && // Ignorer les erreurs Prism connues
      !err.includes('function') &&
      !err.includes('svg element not in render tree') // Ignorer les erreurs Mermaid
    );
    
    if (criticalErrors.length > 0) {
      console.error('❌ Erreurs critiques détectées:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);

    console.log('\n✅ Test réussi: JavaScript et TypeScript sont correctement colorés!');
  });
});
