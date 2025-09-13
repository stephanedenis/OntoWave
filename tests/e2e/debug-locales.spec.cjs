const { test, expect } = require('@playwright/test');

test('Debug supported locales issue', async ({ page }) => {
  // Capturer les logs du navigateur
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Capturer les erreurs
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.toString());
  });

  await page.goto('http://localhost:8081/');
  
  // Attendre que OntoWave se charge
  await page.waitForSelector('#ontowave-floating-menu', { timeout: 10000 });
  
  // Attendre un peu pour voir tous les logs
  await page.waitForTimeout(2000);
  
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.forEach(log => console.log(log));
  
  console.log('\n=== ERRORS ===');
  errors.forEach(error => console.log(error));
  
  // Vérifier les locales supportées dans OntoWave
  const supportedLocales = await page.evaluate(() => {
    if (window.OntoWave && window.OntoWave.instance) {
      return {
        supportedLocales: window.OntoWave.instance.config?.locales || [],
        currentLang: window.OntoWave.instance.getCurrentLanguage?.() || 'unknown',
        config: window.OntoWave.instance.config
      };
    }
    return { error: 'OntoWave not available' };
  });
  
  console.log('\n=== ONTOWAVE CONFIG ===');
  console.log(JSON.stringify(supportedLocales, null, 2));
  
  // Tester le changement de langue
  console.log('\n=== TEST CHANGEMENT DE LANGUE ===');
  
  // Cliquer sur le bouton anglais
  await page.click('button[onclick*="switchLanguage(\'en\')"]');
  await page.waitForTimeout(1000);
  
  // Vérifier les textes après changement
  const afterEnglish = await page.evaluate(() => {
    const configBtn = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
    const homeBtn = document.querySelector('.ontowave-menu-option[onclick*="loadPage"]');
    
    return {
      configText: configBtn?.textContent || 'not found',
      homeText: homeBtn?.textContent || 'not found',
      currentLang: window.OntoWave?.instance?.getCurrentLanguage?.() || 'unknown'
    };
  });
  
  console.log('Après clic EN:', JSON.stringify(afterEnglish, null, 2));
  
  // Cliquer sur français
  await page.click('button[onclick*="switchLanguage(\'fr\')"]');
  await page.waitForTimeout(1000);
  
  const afterFrench = await page.evaluate(() => {
    const configBtn = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
    const homeBtn = document.querySelector('.ontowave-menu-option[onclick*="loadPage"]');
    
    return {
      configText: configBtn?.textContent || 'not found',
      homeText: homeBtn?.textContent || 'not found',
      currentLang: window.OntoWave?.instance?.getCurrentLanguage?.() || 'unknown'
    };
  });
  
  console.log('Après clic FR:', JSON.stringify(afterFrench, null, 2));
});
