const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capturer TOUS les messages console
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Capturer les erreurs
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  await page.goto('http://localhost:8080/demos/test-simple.html');
  await page.waitForTimeout(6000);
  
  // État final
  const finalState = await page.evaluate(() => {
    return {
      debugText: document.getElementById('debug').textContent,
      svgCount: document.querySelectorAll('svg').length,
      ontoWaveHTML: document.getElementById('ontowave').innerHTML.substring(0, 200)
    };
  });
  
  console.log('\n=== FINAL STATE ===');
  console.log('Debug output:', finalState.debugText);
  console.log('SVG count:', finalState.svgCount);
  console.log('OntoWave HTML preview:', finalState.ontoWaveHTML);
  
  await browser.close();
})();
