const { test, expect } = require('@playwright/test');

test.describe('Test spécifique Prism HTML', () => {
  test('Diagnostiquer pourquoi Prism ne crée pas de tokens', async ({ page }) => {
    console.log('🎨 DIAGNOSTIC PRISM - Analyse approfondie');
    
    // Capturer toutes les activités Prism
    const prismMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Prism') || text.includes('🎨') || text.includes('🔤') || text.includes('language-')) {
        prismMessages.push(text);
      }
    });

    await page.goto('http://localhost:8080/');
    await page.waitForSelector('.ontowave-container', { timeout: 10000 });
    await page.waitForTimeout(5000); // Plus de temps pour Prism

    console.log('\n📋 MESSAGES PRISM :');
    prismMessages.forEach(msg => console.log(`🔸 ${msg}`));

    // Analyser le DOM avant et après Prism
    console.log('\n🔍 ANALYSE DOM DÉTAILLÉE :');
    
    const htmlBlocks = await page.locator('pre.language-html, code.language-html').count();
    console.log(`📍 Blocs HTML trouvés : ${htmlBlocks}`);
    
    for (let i = 0; i < htmlBlocks; i++) {
      const block = page.locator('code.language-html').nth(i);
      
      const content = await block.textContent();
      const innerHTML = await block.innerHTML();
      const className = await block.getAttribute('class');
      const parentClass = await block.locator('..').getAttribute('class');
      
      console.log(`\n📝 BLOC HTML ${i + 1} :`);
      console.log(`   Classes: ${className}`);
      console.log(`   Parent classes: ${parentClass}`);
      console.log(`   Contenu (${content?.length} chars): ${content?.substring(0, 100)}...`);
      console.log(`   HTML interne: ${innerHTML.substring(0, 150)}...`);
      
      // Vérifier la présence de tokens
      const tokens = await block.locator('.token').count();
      console.log(`   Tokens Prism: ${tokens}`);
      
      if (tokens === 0) {
        console.log('   ❌ PROBLÈME: Aucun token créé par Prism');
        
        // Test manuel de Prism sur ce bloc
        const manualHighlight = await page.evaluate((element) => {
          if (window.Prism && window.Prism.languages && window.Prism.languages.html) {
            const content = element.textContent;
            try {
              const result = window.Prism.highlight(content, window.Prism.languages.html, 'html');
              return {
                success: true,
                original: content.length,
                highlighted: result.length,
                hasTokens: result.includes('token'),
                preview: result.substring(0, 200)
              };
            } catch (error) {
              return { success: false, error: error.message };
            }
          }
          return { success: false, error: 'Prism not available' };
        }, await block.elementHandle());
        
        console.log(`   🧪 Test manuel Prism:`, manualHighlight);
      }
    }

    // Tester directement l'état de Prism
    const prismState = await page.evaluate(() => {
      return {
        prismExists: typeof window.Prism !== 'undefined',
        languages: window.Prism ? Object.keys(window.Prism.languages || {}) : [],
        htmlLanguage: window.Prism ? !!window.Prism.languages?.html : false,
        markupLanguage: window.Prism ? !!window.Prism.languages?.markup : false,
        prismCore: window.Prism ? typeof window.Prism.highlight === 'function' : false
      };
    });
    
    console.log('\n🔧 ÉTAT PRISM :');
    console.log(`   Prism existe: ${prismState.prismExists}`);
    console.log(`   Fonction highlight: ${prismState.prismCore}`);
    console.log(`   Langage HTML: ${prismState.htmlLanguage}`);
    console.log(`   Langage markup: ${prismState.markupLanguage}`);
    console.log(`   Langages disponibles: ${prismState.languages.join(', ')}`);

    // Test d'une création manuelle de contenu HTML coloré
    console.log('\n🧪 TEST CRÉATION MANUELLE :');
    const manualTest = await page.evaluate(() => {
      if (!window.Prism || !window.Prism.languages) {
        return { error: 'Prism non disponible' };
      }

      const testHtml = `<div>
    <h1>Titre</h1>
    <p>Contenu</p>
</div>`;

      const testContainer = document.createElement('div');
      testContainer.innerHTML = `<pre><code class="language-html">${testHtml}</code></pre>`;
      document.body.appendChild(testContainer);
      
      // Appliquer Prism
      window.Prism.highlightAllUnder(testContainer);
      
      const tokens = testContainer.querySelectorAll('.token').length;
      const result = {
        tokens: tokens,
        innerHTML: testContainer.innerHTML,
        success: tokens > 0
      };
      
      testContainer.remove();
      return result;
    });
    
    console.log(`   Résultat test manuel: ${JSON.stringify(manualTest, null, 2)}`);

    // Capturer une image pour diagnostic visuel
    await page.screenshot({ 
      path: '/tmp/prism-diagnostic.png',
      fullPage: true 
    });
    console.log('📸 Capture sauvée : /tmp/prism-diagnostic.png');
  });
});
