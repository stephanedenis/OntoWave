const { test, expect } = require('@playwright/test');

test('Debug console et chargement config', async ({ page }) => {
  const consoleLogs = [];
  const errors = [];
  
  // Capturer tous les logs console
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  // Aller sur la page
  await page.goto('http://localhost:8080/');
  
  // Attendre le chargement
  await page.waitForFunction(() => window.OntoWave, { timeout: 10000 });
  await page.waitForTimeout(5000); // Attendre plus longtemps pour capturer tous les logs
  
  console.log('📋 TOUS LES LOGS CONSOLE :');
  consoleLogs.forEach((log, i) => {
    console.log(`  ${i+1}. ${log}`);
  });
  
  if (errors.length > 0) {
    console.log('❌ ERREURS :');
    errors.forEach((error, i) => {
      console.log(`  💥 ${i+1}. ${error}`);
    });
  }
  
  // Vérifier spécifiquement les logs de configuration
  const configLogs = consoleLogs.filter(log => 
    log.includes('config') || log.includes('Configuration') || log.includes('📁')
  );
  
  console.log('⚙️ LOGS DE CONFIGURATION :');
  configLogs.forEach((log, i) => {
    console.log(`  🔧 ${i+1}. ${log}`);
  });
  
  // Vérifier le statut de la requête config.json
  const configRequests = [];
  page.on('response', response => {
    if (response.url().includes('config.json')) {
      configRequests.push({
        url: response.url(),
        status: response.status(),
        ok: response.ok()
      });
    }
  });
  
  // Attendre et vérifier la configuration finale
  const finalConfig = await page.evaluate(() => {
    return {
      ontoWaveExists: !!window.OntoWave,
      hasConfig: window.OntoWave && !!window.OntoWave.config,
      config: window.OntoWave ? window.OntoWave.config : null
    };
  });
  
  console.log('🎯 CONFIGURATION FINALE :', finalConfig);
  
  if (configRequests.length > 0) {
    console.log('📡 REQUÊTES CONFIG.JSON :', configRequests);
  } else {
    console.log('❌ Aucune requête config.json détectée');
  }
});
