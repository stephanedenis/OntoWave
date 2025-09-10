import { test, expect } from '@playwright/test';

test.describe('OntoWave - Validation des exemples de code', () => {
  
  test('Page d\'accueil - exemples de code visibles', async ({ page }) => {
    console.log('🧪 Test: Validation des exemples de code sur la page d\'accueil');
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('.ontowave-content', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Capture initiale
    await page.screenshot({ 
      path: 'tests/artifacts/homepage-initial.png',
      fullPage: true 
    });
    
    // Vérifier la présence des blocs de code HTML
    const codeBlocks = await page.$$('pre code, .ontowave-code code');
    console.log(`📝 Nombre de blocs de code trouvés: ${codeBlocks.length}`);
    
    // Vérifier le contenu des blocs de code
    const codeContents = await page.$$eval('pre code, .ontowave-code code', elements => 
      elements.map(el => ({
        text: el.textContent.trim(),
        classes: el.className,
        isEmpty: el.textContent.trim().length === 0
      }))
    );
    
    console.log('📋 Contenu des blocs de code:', codeContents);
    
    // Capture après analyse
    await page.screenshot({ 
      path: 'tests/artifacts/homepage-code-analysis.png',
      fullPage: true 
    });
    
    // Assertions
    expect(codeBlocks.length).toBeGreaterThan(0);
    
    // Vérifier qu'aucun bloc de code n'est vide
    const emptyBlocks = codeContents.filter(block => block.isEmpty);
    console.log(`❌ Blocs de code vides: ${emptyBlocks.length}`);
    
    if (emptyBlocks.length > 0) {
      console.error('❌ Blocs de code vides détectés:', emptyBlocks);
    }
    
    expect(emptyBlocks.length).toBe(0);
    
    // Vérifier la présence de contenu HTML typique
    const hasHtmlContent = codeContents.some(block => 
      block.text.includes('<!DOCTYPE html>') || 
      block.text.includes('<script src=') ||
      block.text.includes('ontowave')
    );
    
    console.log(`✅ Contenu HTML détecté: ${hasHtmlContent}`);
    expect(hasHtmlContent).toBe(true);
  });

  test('Test en français - validation du code HTML', async ({ page }) => {
    console.log('🧪 Test: Validation du code en français');
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    // Forcer l'affichage en français
    await page.evaluate(() => {
      if (window.toggleLang) {
        window.toggleLang('fr');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Capture en français
    await page.screenshot({ 
      path: 'tests/artifacts/homepage-french.png',
      fullPage: true 
    });
    
    // Vérifier le contenu français
    const frenchContent = await page.locator('#lang-fr').isVisible();
    expect(frenchContent).toBe(true);
    
    // Vérifier les blocs de code en français
    const codeInFrench = await page.locator('#lang-fr pre code').count();
    console.log(`📝 Blocs de code en français: ${codeInFrench}`);
    
    if (codeInFrench > 0) {
      const frenchCodeContent = await page.locator('#lang-fr pre code').first().textContent();
      console.log('📋 Contenu du code français:', frenchCodeContent?.substring(0, 100) + '...');
      expect(frenchCodeContent).toContain('<!DOCTYPE html>');
    }
  });

  test('Test en anglais - validation du code HTML', async ({ page }) => {
    console.log('🧪 Test: Validation du code en anglais');
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    // Forcer l'affichage en anglais
    await page.evaluate(() => {
      if (window.toggleLang) {
        window.toggleLang('en');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Capture en anglais
    await page.screenshot({ 
      path: 'tests/artifacts/homepage-english.png',
      fullPage: true 
    });
    
    // Vérifier le contenu anglais
    const englishContent = await page.locator('#lang-en').isVisible();
    expect(englishContent).toBe(true);
    
    // Vérifier les blocs de code en anglais
    const codeInEnglish = await page.locator('#lang-en pre code').count();
    console.log(`📝 Blocs de code en anglais: ${codeInEnglish}`);
    
    if (codeInEnglish > 0) {
      const englishCodeContent = await page.locator('#lang-en pre code').first().textContent();
      console.log('📋 Contenu du code anglais:', englishCodeContent?.substring(0, 100) + '...');
      expect(englishCodeContent).toContain('<!DOCTYPE html>');
    }
  });

  test('Validation Prism - coloration syntaxique', async ({ page }) => {
    console.log('🧪 Test: Validation de la coloration syntaxique Prism');
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(3000);
    
    // Attendre le chargement de Prism
    await page.waitForFunction(() => window.Prism !== undefined, { timeout: 10000 })
      .catch(() => console.log('⚠️ Prism non chargé dans les 10 secondes'));
    
    // Vérifier la présence des classes Prism
    const prismElements = await page.$$('[class*="language-"], .token');
    console.log(`🎨 Éléments Prism trouvés: ${prismElements.length}`);
    
    // Capture avec coloration
    await page.screenshot({ 
      path: 'tests/artifacts/homepage-prism-highlighting.png',
      fullPage: true 
    });
    
    // Vérifier les styles de coloration
    const hasColoredTokens = await page.$$eval('.token', elements => 
      elements.some(el => {
        const styles = window.getComputedStyle(el);
        return styles.color !== 'rgb(0, 0, 0)' && styles.color !== 'initial';
      })
    ).catch(() => false);
    
    console.log(`🎨 Tokens colorés détectés: ${hasColoredTokens}`);
  });

  test('Test des pages de démo - exemples de code', async ({ page }) => {
    const demoPages = ['01-minimal.html', '02-basic-config.html', '03-dark-theme.html'];
    
    for (const demoPage of demoPages) {
      console.log(`🧪 Test: Validation de ${demoPage}`);
      
      await page.goto(`http://localhost:8080/${demoPage}`);
      await page.waitForTimeout(2000);
      
      await page.waitForSelector('.ontowave-content', { timeout: 10000 });
      
      // Capture de la page de démo
      await page.screenshot({ 
        path: `tests/artifacts/demo-${demoPage.replace('.html', '')}.png`,
        fullPage: true 
      });
      
      // Vérifier que le contenu est chargé
      const contentText = await page.locator('.ontowave-content').textContent();
      expect(contentText.length).toBeGreaterThan(10);
      
      console.log(`✅ ${demoPage} validée - contenu: ${contentText.substring(0, 50)}...`);
    }
  });
});
