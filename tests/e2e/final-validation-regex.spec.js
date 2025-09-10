import { test, expect } from '@playwright/test';

test('Validation finale - blocs de code', async ({ page }) => {
  console.log('🧪 Validation finale: Blocs de code après correction regex');
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(4000);
  
  // Attendre le contenu
  await page.waitForSelector('.ontowave-content', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Compter tous les éléments de code
  const preElements = await page.$$('pre');
  const codeElements = await page.$$('code');
  const ontowaveCodeElements = await page.$$('.ontowave-code');
  
  console.log(`📦 Éléments <pre>: ${preElements.length}`);
  console.log(`💻 Éléments <code>: ${codeElements.length}`);  
  console.log(`🌊 Éléments .ontowave-code: ${ontowaveCodeElements.length}`);
  
  // Chercher spécifiquement le contenu HTML
  const htmlCodeFound = await page.$$eval('code', elements => 
    elements.some(el => el.textContent && el.textContent.includes('<!DOCTYPE html>'))
  );
  
  console.log(`✅ Code HTML trouvé: ${htmlCodeFound}`);
  
  // Capture finale
  await page.screenshot({ 
    path: 'tests/artifacts/final-validation-after-regex-fix.png',
    fullPage: true 
  });
  
  // Test des langues
  await page.evaluate(() => window.toggleLang && window.toggleLang('fr'));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'tests/artifacts/final-validation-french.png',
    fullPage: true 
  });
  
  await page.evaluate(() => window.toggleLang && window.toggleLang('en'));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'tests/artifacts/final-validation-english.png',
    fullPage: true 
  });
  
  expect(htmlCodeFound).toBe(true);
});
