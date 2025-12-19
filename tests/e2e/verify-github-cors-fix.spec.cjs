// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Vérification correction GitHub CORS', () => {
  
  test('Page test-github-cors.html: config.json absent, contenu GitHub chargé', async ({ page }) => {
    console.log('\n📍 Test de vérification complète du CORS GitHub');
    
    // Tableaux pour capturer les logs et requêtes
    const consoleLogs = [];
    const networkRequests = [];
    const networkResponses = [];
    
    // Capturer les logs console
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push({ type: msg.type(), text });
      console.log(`[CONSOLE ${msg.type()}] ${text}`);
    });
    
    // Capturer les requêtes réseau
    page.on('request', request => {
      const url = request.url();
      networkRequests.push({ url, method: request.method() });
      console.log(`[NETWORK →] ${request.method()} ${url}`);
    });
    
    // Capturer les réponses réseau
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      networkResponses.push({ url, status });
      console.log(`[NETWORK ←] ${status} ${url}`);
    });
    
    // Naviguer vers la page de test
    console.log('\n🌐 Chargement de http://localhost:8020/test-github-cors.html');
    await page.goto('http://localhost:8020/test-github-cors.html', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    
    // Attendre que OntoWave soit chargé (réduit à 2s)
    await page.waitForTimeout(2000);
    
    // Capture d'écran
    const screenshotPath = path.join(__dirname, '../../test-results/github-cors-verification.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Capture d'écran sauvegardée: ${screenshotPath}`);
    
    // ANALYSE 1: Vérifier que config.json N'EST PAS demandé
    console.log('\n✅ ANALYSE 1: Vérification absence de requête config.json');
    const configJsonRequest = networkRequests.find(req => req.url.includes('config.json'));
    if (configJsonRequest) {
      console.log('❌ ERREUR: config.json a été demandé!');
      console.log('   Requête:', configJsonRequest);
    } else {
      console.log('✓ config.json NON demandé (attendu)');
    }
    expect(configJsonRequest).toBeUndefined();
    
    // ANALYSE 2: Vérifier que window.ontoWaveConfig est utilisé
    console.log('\n✅ ANALYSE 2: Vérification utilisation window.ontoWaveConfig');
    const configLog = consoleLogs.find(log => 
      log.text.includes('Using window.ontoWaveConfig')
    );
    if (configLog) {
      console.log('✓ window.ontoWaveConfig utilisé:', configLog.text);
    } else {
      console.log('❌ Message de config non trouvé dans la console');
      console.log('Logs disponibles:', consoleLogs.map(l => l.text).join('\n   '));
    }
    expect(configLog).toBeDefined();
    
    // ANALYSE 3: Vérifier que le README.md est chargé depuis GitHub
    console.log('\n✅ ANALYSE 3: Vérification chargement depuis GitHub Raw');
    const githubRequest = networkResponses.find(res => 
      res.url.includes('raw.githubusercontent.com') && 
      res.url.includes('README.md')
    );
    if (githubRequest) {
      console.log('✓ Requête GitHub Raw détectée:', githubRequest.url);
      console.log('  Status:', githubRequest.status);
      expect(githubRequest.status).toBe(200);
    } else {
      console.log('❌ Aucune requête vers GitHub Raw trouvée');
      console.log('Requêtes réseau:');
      networkResponses.forEach(r => console.log(`   ${r.status} ${r.url}`));
    }
    
    // ANALYSE 4: Vérifier que la page n'est pas blanche
    console.log('\n✅ ANALYSE 4: Vérification contenu de la page');
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.trim().length > 100;
    console.log('Longueur du contenu:', bodyText ? bodyText.trim().length : 0);
    console.log('Premiers 200 caractères:', bodyText ? bodyText.trim().substring(0, 200) : 'VIDE');
    
    if (hasContent) {
      console.log('✓ La page contient du contenu (pas blanche)');
    } else {
      console.log('❌ La page semble vide ou blanche');
    }
    expect(hasContent).toBe(true);
    
    // ANALYSE 5: Vérifier l'absence d'erreurs console critiques
    console.log('\n✅ ANALYSE 5: Vérification erreurs console');
    const errors = consoleLogs.filter(log => log.type === 'error');
    console.log('Nombre d\'erreurs:', errors.length);
    if (errors.length > 0) {
      console.log('❌ Erreurs détectées:');
      errors.forEach(err => console.log(`   - ${err.text}`));
    } else {
      console.log('✓ Aucune erreur console');
    }
    
    // RÉSUMÉ FINAL
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DES VÉRIFICATIONS');
    console.log('='.repeat(80));
    console.log('✓ config.json NON demandé:', configJsonRequest === undefined ? 'OUI' : 'NON');
    console.log('✓ window.ontoWaveConfig utilisé:', configLog ? 'OUI' : 'NON');
    console.log('✓ Chargement GitHub Raw:', githubRequest ? `OUI (${githubRequest.status})` : 'NON');
    console.log('✓ Page avec contenu:', hasContent ? 'OUI' : 'NON');
    console.log('✓ Sans erreurs:', errors.length === 0 ? 'OUI' : `NON (${errors.length})`);
    console.log('='.repeat(80) + '\n');
    
    // Toutes les assertions doivent passer
    expect(configJsonRequest).toBeUndefined(); // config.json pas demandé
    expect(configLog).toBeDefined(); // window.ontoWaveConfig utilisé
    expect(hasContent).toBe(true); // page pas blanche
    expect(errors.length).toBeLessThanOrEqual(0); // pas d'erreurs critiques
  });
  
});
