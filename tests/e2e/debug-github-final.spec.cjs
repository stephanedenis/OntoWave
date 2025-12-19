// @ts-check
const { test } = require('@playwright/test');

test('Debug GitHub CORS - logs détaillés', async ({ page }) => {
  const allLogs = [];
  const allRequests = [];
  const allResponses = [];
  
  // Capturer TOUT
  page.on('console', msg => {
    const log = `[CONSOLE ${msg.type()}] ${msg.text()}`;
    allLogs.push(log);
    console.log(log);
  });
  
  page.on('request', req => {
    const log = `[REQUEST] ${req.method()} ${req.url()}`;
    allRequests.push(log);
    console.log(log);
  });
  
  page.on('response', res => {
    const log = `[RESPONSE] ${res.status()} ${res.url()}`;
    allResponses.push(log);
    console.log(log);
  });
  
  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });
  
  console.log('\n🔍 DÉMARRAGE DU TEST');
  console.log('==================\n');
  
  await page.goto('http://localhost:8020/test-github-cors.html', { waitUntil: 'domcontentloaded' });
  
  console.log('\n⏱️  Attente 6 secondes...\n');
  await page.waitForTimeout(6000);
  
  // Inspecter l'état final
  const finalState = await page.evaluate(() => {
    return {
      hash: window.location.hash,
      appExists: !!document.getElementById('app'),
      appHTML: document.getElementById('app')?.innerHTML || '',
      hasConfig: !!window.ontoWaveConfig,
      configSourcesFr: window.ontoWaveConfig?.sources?.fr
    };
  });
  
  console.log('\n📊 ÉTAT FINAL');
  console.log('=============');
  console.log('Hash:', finalState.hash);
  console.log('App exists:', finalState.appExists);
  console.log('Has config:', finalState.hasConfig);
  console.log('Config sources.fr:', finalState.configSourcesFr);
  console.log('App HTML length:', finalState.appHTML.length);
  console.log('App HTML preview:', finalState.appHTML.substring(0, 200));
  
  console.log('\n📋 RÉSUMÉ DES REQUÊTES');
  console.log('======================');
  console.log('Total logs:', allLogs.length);
  console.log('Total requests:', allRequests.length);
  console.log('Total responses:', allResponses.length);
  
  const githubRequests = allRequests.filter(r => r.includes('github'));
  console.log('\n🔗 Requêtes GitHub:', githubRequests.length);
  if (githubRequests.length > 0) {
    githubRequests.forEach(r => console.log('  ', r));
  } else {
    console.log('   ❌ AUCUNE requête GitHub détectée!');
  }
  
  console.log('\n✅ TEST TERMINÉ\n');
  
  await page.screenshot({ path: 'test-results/debug-final.png', fullPage: true });
});
