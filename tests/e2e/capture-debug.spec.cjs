// @ts-check
const { test } = require('@playwright/test');

test('Capturer debug de test-cors-debug.html', async ({ page }) => {
  const logs = [];
  
  page.on('console', msg => {
    logs.push(msg.text());
    console.log(`[PAGE] ${msg.text()}`);
  });
  
  console.log('\n🔍 Test de la page debug avec fetch intercepté\n');
  
  await page.goto('http://localhost:8020/test-cors-debug.html', { waitUntil: 'domcontentloaded' });
  
  console.log('\n⏱️  Attente 8 secondes pour voir toutes les requêtes...\n');
  await page.waitForTimeout(8000);
  
  // Capturer le contenu du debug div
  const debugContent = await page.evaluate(() => {
    return document.getElementById('debug')?.textContent || 'DEBUG DIV NOT FOUND';
  });
  
  console.log('\n📄 CONTENU DEBUG DIV:');
  console.log('===================');
  console.log(debugContent);
  
  // Capturer le hash final
  const hash = await page.evaluate(() => window.location.hash);
  console.log('\n🔗 Hash final:', hash);
  
  await page.screenshot({ path: 'test-results/debug-intercept.png', fullPage: true });
  console.log('\n📸 Screenshot: test-results/debug-intercept.png\n');
});
