const { test, expect } = require('@playwright/test');

test('Debug menus OntoWave détaillé', async ({ page }) => {
  console.log('🔍 Debug détaillé des menus OntoWave');
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(4000);
  
  // Vérifier l'état d'OntoWave
  const ontoWaveStatus = await page.evaluate(() => {
    return {
      ontoWaveExists: typeof window.OntoWave !== 'undefined',
      ontoWaveConfig: window.OntoWave ? window.OntoWave.config : null,
      hasUI: window.OntoWave ? !!window.OntoWave.ui : false,
      hasMenu: window.OntoWave ? !!window.OntoWave.menu : false
    };
  });
  
  console.log('🎛️ État OntoWave:', ontoWaveStatus);
  
  // Chercher tous les éléments d'interface possibles
  const uiElements = await page.evaluate(() => {
    const selectors = [
      '.ontowave-menu', '.menu', '.config', '.settings',
      '[class*="ontowave"]', '[class*="menu"]', '[class*="config"]',
      'button', '.btn', '[role="button"]',
      '.toolbar', '.panel', '.sidebar'
    ];
    
    let elements = [];
    selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        found.forEach((el, index) => {
          if (el.textContent && el.textContent.trim().length > 0) {
            elements.push({
              selector,
              index,
              tagName: el.tagName,
              className: el.className,
              textContent: el.textContent.substring(0, 50),
              visible: getComputedStyle(el).display !== 'none'
            });
          }
        });
      } catch (e) {
        // Ignorer les sélecteurs invalides
      }
    });
    
    return elements.slice(0, 20); // Limiter le nombre
  });
  
  console.log('🎨 Éléments UI trouvés:', uiElements.length);
  uiElements.forEach(el => {
    console.log(`  ${el.selector}: ${el.tagName}.${el.className} - "${el.textContent}" (visible: ${el.visible})`);
  });
  
  // Vérifier s'il y a des éléments cachés
  const hiddenElements = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    let hidden = [];
    
    for (let el of allElements) {
      const style = getComputedStyle(el);
      if ((style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') && 
          (el.className.includes('menu') || el.className.includes('config') || el.className.includes('ontowave'))) {
        hidden.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          textContent: el.textContent?.substring(0, 30)
        });
      }
    }
    
    return hidden.slice(0, 10);
  });
  
  console.log('👻 Éléments cachés:', hiddenElements);
});
