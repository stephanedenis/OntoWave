const { test, expect } = require('@playwright/test');

test.use({ 
  baseURL: 'http://localhost:8020',
});

test('Router Direct Test - External sources', async ({ page }) => {
  // Intercepter les logs de la page
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
    console.log(`[PAGE] ${msg.text()}`);
  });

  await page.goto('http://localhost:3000/test-router-direct.html');
  await page.waitForTimeout(2000);
  
  const logContent = await page.locator('#log').textContent();
  console.log('\n📋 LOG CONTENU:\n' + logContent);
  
  // Vérifier que @github/README.md ne devient pas /@github/README.md
  expect(logContent).toContain('Hash: @github/README.md → Path: @github/README.md');
});
