const { test, expect } = require('@playwright/test');

test('Debug Prism et langue', async ({ page }) => {
  console.log('🔍 Debug Prism et menus de langue');
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(3000);
  
  // Vérifier l'état de Prism
  const prismStatus = await page.evaluate(() => {
    const codeBlocks = document.querySelectorAll('pre code, code');
    let totalBlocks = codeBlocks.length;
    let coloredBlocks = 0;
    let hasTokens = 0;
    
    codeBlocks.forEach(block => {
      const spans = block.querySelectorAll('span[class*="token"]');
      if (spans.length > 0) {
        coloredBlocks++;
        hasTokens += spans.length;
      }
    });
    
    return {
      totalBlocks,
      coloredBlocks,
      hasTokens,
      prismLoaded: typeof window.Prism !== 'undefined',
      prismHighlightAll: typeof window.Prism?.highlightAll === 'function'
    };
  });
  
  console.log('🎨 État Prism:', prismStatus);
  
  // Vérifier les menus OntoWave
  const menuStatus = await page.evaluate(() => {
    const configBtn = document.querySelector('.ontowave-config-btn, .config-btn, [title*="Config"], [aria-label*="Config"]');
    const menuPanel = document.querySelector('.ontowave-menu, .menu-panel, .config-panel');
    
    return {
      hasConfigButton: !!configBtn,
      configButtonText: configBtn ? configBtn.textContent : 'Non trouvé',
      hasMenuPanel: !!menuPanel,
      menuContent: menuPanel ? menuPanel.textContent.substring(0, 200) : 'Non trouvé'
    };
  });
  
  console.log('⚙️ État menus:', menuStatus);
  
  // Tester le changement de langue et voir l'impact
  console.log('🔄 Test changement de langue...');
  await page.click('#btn-en');
  await page.waitForTimeout(1000);
  
  const afterLangChange = await page.evaluate(() => {
    const codeBlocks = document.querySelectorAll('pre code, code');
    let coloredAfter = 0;
    
    codeBlocks.forEach(block => {
      const spans = block.querySelectorAll('span[class*="token"]');
      if (spans.length > 0) coloredAfter++;
    });
    
    return { coloredAfter };
  });
  
  console.log('🎨 Après changement langue:', afterLangChange);
});
