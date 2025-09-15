import { test, expect } from '@playwright/test';

test('Debug visibilité du contenu OntoWave', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // Capturer l'état après chargement
  await page.screenshot({ 
    path: 'captures/debug-apres-correction.png', 
    fullPage: true 
  });
  
  // Vérifier qu'OntoWave est chargé
  const ontoWave = await page.evaluate(() => typeof window.OntoWave);
  console.log(`🌊 OntoWave chargé: ${ontoWave}`);
  
  // Vérifier la configuration
  const config = await page.evaluate(() => window.OntoWaveConfig);
  console.log('⚙️ Config:', config);
  
  // Vérifier les éléments OntoWave
  const container = page.locator('.ontowave-container');
  const containerVisible = await container.isVisible();
  console.log(`📦 Container visible: ${containerVisible}`);
  
  if (containerVisible) {
    // Ouvrir le menu OntoWave
    const button = container.locator('button').first();
    await button.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'captures/debug-menu-ouvert.png', 
      fullPage: true 
    });
    
    // Vérifier les boutons de langue dans le menu
    const langButtonsInMenu = page.locator('.ontowave-menu button, .ontowave-menu .lang-toggle');
    const langCount = await langButtonsInMenu.count();
    console.log(`🌐 Boutons langue dans menu: ${langCount}`);
    
    // Test du bouton configuration
    const configBtn = page.locator('text=Configuration, text=Config');
    const configCount = await configBtn.count();
    console.log(`⚙️ Bouton config trouvé: ${configCount}`);
    
    if (configCount > 0) {
      await configBtn.first().click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'captures/debug-config-panel.png', 
        fullPage: true 
      });
    }
  }
  
  // Analyser le contenu markdown rendu
  const contentDiv = page.locator('#content, .content, .markdown-content, main');
  const contentCount = await contentDiv.count();
  console.log(`📄 Divs de contenu trouvées: ${contentCount}`);
  
  if (contentCount > 0) {
    const html = await contentDiv.first().innerHTML();
    console.log('📄 Contenu HTML (début):', html.substring(0, 200) + '...');
  }
  
  // Vérifier CSS qui pourrait cacher le contenu
  const hiddenElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const hidden = [];
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        hidden.push({
          tag: el.tagName,
          classes: el.className,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity
        });
      }
    });
    return hidden.slice(0, 10); // Premiers 10 éléments cachés
  });
  
  console.log('👻 Éléments cachés:', hiddenElements);
  
  // Chercher le markdown original
  const markdownDivs = await page.evaluate(() => {
    const divs = document.querySelectorAll('div');
    const markdown = [];
    divs.forEach(div => {
      if (div.innerHTML.includes('# OntoWave') || div.innerHTML.includes('### ✨')) {
        markdown.push({
          innerHTML: div.innerHTML.substring(0, 100) + '...',
          style: {
            display: window.getComputedStyle(div).display,
            visibility: window.getComputedStyle(div).visibility
          }
        });
      }
    });
    return markdown;
  });
  
  console.log('📝 Divs avec markdown:', markdownDivs);
});

test('Comparaison avec démo minimal fonctionnel', async ({ page }) => {
  // Tester le minimal.html qui devrait fonctionner
  await page.goto('http://localhost:8080/demo/minimal.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  await page.screenshot({ 
    path: 'captures/minimal-reference.png', 
    fullPage: true 
  });
  
  // Analyser ce qui fonctionne dans minimal
  const ontoWaveRef = await page.evaluate(() => typeof window.OntoWave);
  console.log(`📋 Minimal - OntoWave: ${ontoWaveRef}`);
  
  const containerRef = page.locator('.ontowave-container');
  const visibleRef = await containerRef.isVisible();
  console.log(`📋 Minimal - Container visible: ${visibleRef}`);
  
  // Vérifier les sections visibles
  const sectionsRef = await page.locator('h1, h2, h3').allTextContents();
  console.log('📋 Minimal - Sections:', sectionsRef);
  
  // Vérifier les diagrammes
  const diagramsRef = await page.locator('img[src*="plantuml"], svg[id*="mermaid"]').count();
  console.log(`📋 Minimal - Diagrammes: ${diagramsRef}`);
});
