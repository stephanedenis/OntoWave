// @ts-check
const { test } = require('@playwright/test');

test('Inspection complète du DOM et état', async ({ page }) => {
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  
  await page.goto('http://localhost:8020/test-github-cors.html');
  await page.waitForTimeout(8000); // Attendre 8s pour le chargement GitHub
  
  const state = await page.evaluate(() => {
    return {
      app: {
        exists: !!document.getElementById('app'),
        innerHTML: document.getElementById('app')?.innerHTML?.substring(0, 1000) || 'N/A',
        textContent: document.getElementById('app')?.textContent?.substring(0, 500) || 'N/A'
      },
      hash: window.location.hash,
      config: window.ontoWaveConfig
    };
  });
  
  console.log('\n🔍 INSPECTION COMPLÈTE:');
  console.log('\n📋 Logs Console:', logs.length, 'entrées');
  logs.forEach(l => console.log('  ', l));
  console.log('\n🔗 Hash:', state.hash);
  console.log('\n⚙️  Config:', JSON.stringify(state.config, null, 2));
  console.log('\n📄 App innerHTML:', state.app.innerHTML.substring(0, 300));
  console.log('\n📝 App textContent:', state.app.textContent);
  
  await page.screenshot({ path: 'test-results/inspection.png', fullPage: true });
});
