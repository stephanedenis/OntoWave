const { test, expect } = require('@playwright/test');

test.describe('OntoWave - CORS External Sources', () => {
  const mainPort = 8010;
  const externalPort = 8011;
  const baseUrl = `http://localhost:${mainPort}`;
  const externalUrl = `http://localhost:${externalPort}`;

  test.beforeEach(async ({ page }) => {
    // Écouter les erreurs console
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', text);
      } else if (text.includes('[OntoWave]')) {
        console.log('📢', text);
      }
    });

    // Écouter les erreurs de requête
    page.on('requestfailed', request => {
      console.log('⚠️  Request Failed:', request.url(), request.failure()?.errorText);
    });
  });

  test('should configure external data sources', async ({ page }) => {
    console.log('\n🧪 Test 1: Configuration des sources externes\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Vérifier que la configuration a été chargée
    const configLoaded = await page.evaluate(() => {
      return !!window.ontoWaveConfig?.externalDataSources;
    });
    
    expect(configLoaded).toBe(true);
    console.log('✅ Configuration chargée avec sources externes');

    // Vérifier que les sources externes sont configurées
    const externalSources = await page.evaluate(() => {
      return window.ontoWaveConfig?.externalDataSources || [];
    });

    expect(externalSources.length).toBeGreaterThan(0);
    expect(externalSources[0].name).toBe('external-api');
    expect(externalSources[0].baseUrl).toBe('http://localhost:8011');
    expect(externalSources[0].corsEnabled).toBe(true);
    
    console.log('✅ Source externe configurée:', externalSources[0]);
  });

  test('should load local content from port 8010', async ({ page }) => {
    console.log('\n🧪 Test 2: Chargement contenu local (8010)\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Charger la page locale
    await page.evaluate(() => {
      window.location.hash = '#index.md';
    });
    await page.waitForTimeout(2000);

    // Vérifier le contenu
    const content = await page.locator('#app').textContent();
    expect(content).toContain('Test CORS');
    expect(content).toContain('page de test CORS');
    
    console.log('✅ Contenu local chargé avec succès');
  });

  test('should load external content via CORS from port 8011', async ({ page }) => {
    console.log('\n🧪 Test 3: Chargement contenu externe via CORS (8011)\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Naviguer vers le contenu externe
    console.log('📡 Navigation vers @external-api/api-guide.md');
    await page.evaluate(() => {
      window.location.hash = '#@external-api/api-guide.md';
    });
    await page.waitForTimeout(3000);

    // Vérifier le contenu externe
    const content = await page.locator('#app').textContent();
    expect(content).toContain('Guide API Externe');
    expect(content).toContain('serveur externe');
    expect(content).toContain('port 8011');
    
    console.log('✅ Contenu externe chargé avec succès via CORS');
  });

  test('should load external content from subfolder', async ({ page }) => {
    console.log('\n🧪 Test 4: Chargement depuis sous-dossier externe\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Naviguer vers un sous-dossier externe
    console.log('📡 Navigation vers @external-api/advanced/rate-limiting.md');
    await page.evaluate(() => {
      window.location.hash = '#@external-api/advanced/rate-limiting.md';
    });
    await page.waitForTimeout(3000);

    // Vérifier le contenu
    const content = await page.locator('#app').textContent();
    expect(content).toContain('Rate Limiting');
    expect(content).toContain('requêtes par minute');
    expect(content).toContain('Sous-dossier advanced/');
    
    console.log('✅ Contenu externe (sous-dossier) chargé avec succès');
  });

  test('should handle multiple external files', async ({ page }) => {
    console.log('\n🧪 Test 5: Navigation entre fichiers externes\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Charger le premier fichier externe
    console.log('📡 Chargement api-guide.md');
    await page.evaluate(() => {
      window.location.hash = '#@external-api/api-guide.md';
    });
    await page.waitForTimeout(2000);
    
    let content = await page.locator('#app').textContent();
    expect(content).toContain('Guide API Externe');

    // Charger le deuxième fichier externe
    console.log('📡 Chargement webhooks.md');
    await page.evaluate(() => {
      window.location.hash = '#@external-api/webhooks.md';
    });
    await page.waitForTimeout(2000);
    
    content = await page.locator('#app').textContent();
    expect(content).toContain('Webhooks');
    expect(content).toContain('notifications en temps réel');
    
    console.log('✅ Navigation entre fichiers externes réussie');
  });

  test('should display 404 for non-existent external file', async ({ page }) => {
    console.log('\n🧪 Test 6: Gestion erreur 404 fichier externe\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Tenter de charger un fichier inexistant
    console.log('📡 Tentative de chargement fichier inexistant');
    await page.evaluate(() => {
      window.location.hash = '#@external-api/non-existent-file.md';
    });
    await page.waitForTimeout(3000);

    // Vérifier le message 404
    const content = await page.locator('#app').textContent();
    expect(content).toContain('404');
    expect(content).toContain('Not found');
    
    console.log('✅ Erreur 404 correctement gérée');
  });

  test('should verify CORS headers on external requests', async ({ page }) => {
    console.log('\n🧪 Test 7: Vérification en-têtes CORS\n');
    
    let corsHeadersFound = false;
    
    // Intercepter les requêtes
    page.on('response', async response => {
      if (response.url().includes('localhost:8011')) {
        const headers = response.headers();
        console.log('📨 Réponse de', response.url());
        console.log('   Access-Control-Allow-Origin:', headers['access-control-allow-origin']);
        console.log('   Access-Control-Allow-Methods:', headers['access-control-allow-methods']);
        
        if (headers['access-control-allow-origin']) {
          corsHeadersFound = true;
        }
      }
    });

    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Charger contenu externe
    await page.evaluate(() => {
      window.location.hash = '#@external-api/api-guide.md';
    });
    await page.waitForTimeout(3000);

    expect(corsHeadersFound).toBe(true);
    console.log('✅ En-têtes CORS présents dans les réponses');
  });

  test('should log external source configuration in console', async ({ page }) => {
    console.log('\n🧪 Test 8: Logs de configuration\n');
    
    const consoleLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('External data sources configured')) {
        consoleLogs.push(text);
        console.log('📢', text);
      }
    });

    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Vérifier qu'un log de configuration a été émis
    const hasConfigLog = consoleLogs.some(log => 
      log.includes('External data sources configured') && 
      log.includes('external-api')
    );
    
    expect(hasConfigLog).toBe(true);
    console.log('✅ Logs de configuration présents');
  });

  test('should mix local and external content navigation', async ({ page }) => {
    console.log('\n🧪 Test 9: Mixage contenu local et externe\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Local → Externe → Local → Externe
    const navigation = [
      { hash: '#index.md', expected: 'Test CORS', label: 'Local' },
      { hash: '#@external-api/api-guide.md', expected: 'Guide API Externe', label: 'Externe 1' },
      { hash: '#index.md', expected: 'Test CORS', label: 'Local' },
      { hash: '#@external-api/webhooks.md', expected: 'Webhooks', label: 'Externe 2' },
    ];

    for (const nav of navigation) {
      console.log(`📍 Navigation vers ${nav.label}: ${nav.hash}`);
      await page.evaluate((hash) => {
        window.location.hash = hash;
      }, nav.hash);
      await page.waitForTimeout(2000);
      
      const content = await page.locator('#app').textContent();
      expect(content).toContain(nav.expected);
      console.log(`   ✅ Contenu ${nav.label} chargé`);
    }
    
    console.log('✅ Navigation mixte locale/externe réussie');
  });

  test('should handle rapid navigation between external sources', async ({ page }) => {
    console.log('\n🧪 Test 10: Navigation rapide entre sources externes\n');
    
    await page.goto(`${baseUrl}/tests/test-cors.html`);
    await page.waitForTimeout(2000);

    // Navigation rapide
    const files = [
      '@external-api/api-guide.md',
      '@external-api/webhooks.md',
      '@external-api/advanced/rate-limiting.md',
    ];

    for (const file of files) {
      console.log(`⚡ Navigation rapide vers ${file}`);
      await page.evaluate((hash) => {
        window.location.hash = `#${hash}`;
      }, file);
      await page.waitForTimeout(500); // Navigation rapide
    }

    // Attendre le dernier chargement
    await page.waitForTimeout(2000);
    
    const content = await page.locator('#app').textContent();
    expect(content).toContain('Rate Limiting');
    
    console.log('✅ Navigation rapide gérée correctement');
  });
});
