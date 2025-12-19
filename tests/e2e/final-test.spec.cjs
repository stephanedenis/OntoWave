// @ts-check
const { test, expect } = require('@playwright/test');

test('TEST FINAL - GitHub CORS fonctionne?', async ({ page }) => {
  const requests = [];
  
  page.on('request', req => {
    requests.push(req.url());
    if (req.url().includes('github')) {
      console.log('🎯 REQUÊTE GITHUB:', req.url());
    }
  });
  
  page.on('response', res => {
    if (res.url().includes('github')) {
      console.log('✅ RÉPONSE GITHUB:', res.status(), res.url());
    }
  });
  
  page.on('console', msg => {
    if (msg.text().includes('OntoWave') || msg.text().includes('github') || msg.text().includes('External')) {
      console.log('[PAGE]', msg.text());
    }
  });
  
  await page.goto('http://localhost:8020/test-github-cors.html');
  await page.waitForTimeout(10000); // 10 secondes
  
  const githubRequests = requests.filter(url => url.includes('raw.githubusercontent.com'));
  
  console.log('\n📊 RÉSULTAT:');
  console.log('Requêtes GitHub:', githubRequests.length);
  
  if (githubRequests.length > 0) {
    console.log('✅ SUCCESS - Requêtes GitHub effectuées:');
    githubRequests.forEach(url => console.log('  -', url));
  } else {
    console.log('❌ ÉCHEC - Aucune requête vers GitHub');
    console.log('Total requêtes:', requests.length);
  }
  
  await page.screenshot({ path: 'test-results/final-test.png', fullPage: true });
  
  expect(githubRequests.length).toBeGreaterThan(0);
});
