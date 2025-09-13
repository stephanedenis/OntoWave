const { test, expect } = require('@playwright/test');

test('Test changement de langue menu OntoWave', async ({ page }) => {
  await page.goto('http://localhost:8081/');
  
  // Attendre que OntoWave se charge
  await page.waitForSelector('#ontowave-floating-menu', { timeout: 10000 });
  
  // Ouvrir le menu OntoWave
  await page.click('#ontowave-menu-icon');
  await page.waitForTimeout(500);
  
  // Capturer les textes initiaux
  const initialTexts = await page.evaluate(() => {
    const configBtn = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
    const homeBtn = document.querySelector('.ontowave-menu-option[onclick*="loadPage"]');
    
    return {
      config: configBtn?.textContent || 'not found',
      home: homeBtn?.textContent || 'not found'
    };
  });
  
  console.log('Textes initiaux:', initialTexts);
  
  // Changer vers anglais
  await page.click('button[onclick*="toggleLang(\'en\')"]');
  await page.waitForTimeout(1000);
  
  // Capturer les textes après changement
  const englishTexts = await page.evaluate(() => {
    const configBtn = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
    const homeBtn = document.querySelector('.ontowave-menu-option[onclick*="loadPage"]');
    
    return {
      config: configBtn?.textContent || 'not found',
      home: homeBtn?.textContent || 'not found'
    };
  });
  
  console.log('Textes en anglais:', englishTexts);
  
  // Changer vers français
  await page.click('button[onclick*="toggleLang(\'fr\')"]');
  await page.waitForTimeout(1000);
  
  // Capturer les textes après retour au français
  const frenchTexts = await page.evaluate(() => {
    const configBtn = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
    const homeBtn = document.querySelector('.ontowave-menu-option[onclick*="loadPage"]');
    
    return {
      config: configBtn?.textContent || 'not found',
      home: homeBtn?.textContent || 'not found'
    };
  });
  
  console.log('Textes en français:', frenchTexts);
  
  // Vérifications
  expect(englishTexts.config).toContain('Configuration');
  expect(englishTexts.home).toContain('Home');
  expect(frenchTexts.config).toContain('Configuration');
  expect(frenchTexts.home).toContain('Accueil');
});
