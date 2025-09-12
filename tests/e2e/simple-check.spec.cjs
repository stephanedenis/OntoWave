const { test, expect } = require('@playwright/test');

test('Simple Prism check', async ({ page }) => {
  page.on('console', msg => console.log('🌐', msg.text()));
  
  await page.goto('http://localhost:8080/');
  
  // Attendre le chargement
  await page.waitForSelector('#ontowave-container', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Vérifier l'instance OntoWave
  const ontoWaveCheck = await page.evaluate(() => {
    return {
      ontoWaveExists: typeof window.OntoWave !== 'undefined',
      instanceExists: window.OntoWave && window.OntoWave.instance !== undefined,
      prismExists: typeof window.Prism !== 'undefined',
      langFrVisible: document.getElementById('lang-fr') ? 
        window.getComputedStyle(document.getElementById('lang-fr')).display : 'not found',
      langEnVisible: document.getElementById('lang-en') ? 
        window.getComputedStyle(document.getElementById('lang-en')).display : 'not found',
      codeBlocks: document.querySelectorAll('code[class*="language-"]').length,
      visibleCodeBlocks: Array.from(document.querySelectorAll('code[class*="language-"]'))
        .filter(el => window.getComputedStyle(el).display !== 'none').length
    };
  });
  
  console.log('📊 État de la page:', JSON.stringify(ontoWaveCheck, null, 2));
  
  expect(ontoWaveCheck.ontoWaveExists).toBe(true);
  expect(ontoWaveCheck.prismExists).toBe(true);
  
  console.log('✅ Test basique réussi');
});
