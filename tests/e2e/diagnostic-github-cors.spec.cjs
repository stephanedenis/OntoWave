const { test, expect } = require('@playwright/test');

test.describe('Diagnostic CORS GitHub', () => {
  
  test('Vérifier URL GitHub Raw directe', async ({ page }) => {
    console.log('📍 Test 1: Accès direct à GitHub Raw');
    
    // Tester l'URL brute directement
    const githubUrl = 'https://raw.githubusercontent.com/stephanedenis/OntoWave/main/docs/index.md';
    console.log(`Tentative de chargement: ${githubUrl}`);
    
    const response = await page.goto(githubUrl);
    console.log(`Status: ${response.status()}`);
    console.log(`Headers:`, await response.allHeaders());
    
    if (response.status() === 200) {
      const content = await response.text();
      console.log(`✅ Contenu chargé (${content.length} caractères)`);
      console.log(`Premiers 200 caractères:\n${content.substring(0, 200)}`);
    } else {
      console.log(`❌ Erreur: ${response.statusText()}`);
    }
    
    expect(response.status()).toBe(200);
  });

  test('Tester différentes branches GitHub', async ({ page }) => {
    console.log('📍 Test 2: Tester différentes branches');
    
    const branches = ['main', 'feature/plugin-architecture-19'];
    
    for (const branch of branches) {
      const url = `https://raw.githubusercontent.com/stephanedenis/OntoWave/${branch}/docs/index.md`;
      console.log(`\nTest branche: ${branch}`);
      console.log(`URL: ${url}`);
      
      try {
        const response = await page.goto(url);
        console.log(`Status: ${response.status()} ${response.statusText()}`);
        
        if (response.status() === 200) {
          const content = await response.text();
          console.log(`✅ Succès (${content.length} caractères)`);
        } else {
          console.log(`❌ Échec: ${response.status()}`);
        }
      } catch (error) {
        console.log(`❌ Erreur: ${error.message}`);
      }
    }
  });

  test('Diagnostic OntoWave avec CORS GitHub', async ({ page }) => {
    console.log('📍 Test 3: OntoWave avec configuration GitHub');
    
    // Capturer les requêtes réseau
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('githubusercontent.com')) {
        console.log(`📤 Requête: ${request.method()} ${request.url()}`);
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('githubusercontent.com')) {
        console.log(`📥 Réponse: ${response.status()} ${response.url()}`);
        console.log(`Headers:`, await response.allHeaders());
      }
    });
    
    // Capturer les erreurs console
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('github') || text.includes('404') || text.includes('CORS')) {
        console.log(`🖥️  Console: ${text}`);
      }
    });
    
    // Charger la page de test
    await page.goto('http://localhost:8020/test-github-cors.html');
    
    // Attendre que OntoWave charge
    await page.waitForTimeout(3000);
    
    // Vérifier l'état de la page
    const bodyText = await page.textContent('body');
    console.log(`\n📄 Contenu de la page (premiers 500 caractères):\n${bodyText.substring(0, 500)}`);
    
    // Afficher toutes les requêtes GitHub capturées
    console.log(`\n📊 Résumé des requêtes GitHub: ${requests.length} requêtes`);
    requests.forEach((req, i) => {
      console.log(`\nRequête ${i + 1}:`);
      console.log(`  URL: ${req.url}`);
      console.log(`  Method: ${req.method}`);
      console.log(`  Headers:`, req.headers);
    });
  });

  test('Vérifier la configuration OntoWave', async ({ page }) => {
    console.log('📍 Test 4: Vérifier la configuration');
    
    await page.goto('http://localhost:8020/test-github-cors.html');
    
    // Injecter un script pour examiner la configuration
    const config = await page.evaluate(() => {
      return window.ontoWaveConfig;
    });
    
    console.log('Configuration OntoWave:');
    console.log(JSON.stringify(config, null, 2));
    
    // Vérifier si l'application OntoWave est chargée
    await page.waitForTimeout(2000);
    
    const hasOntoWave = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined';
    });
    console.log(`OntoWave chargé: ${hasOntoWave}`);
  });

  test('Construire manuellement l\'URL', async ({ page }) => {
    console.log('📍 Test 5: Construction manuelle de l\'URL');
    
    const config = {
      name: "github-ontowave",
      baseUrl: "https://raw.githubusercontent.com/stephanedenis/OntoWave/main/docs",
      path: "index.md"
    };
    
    // Différentes façons de construire l'URL
    const urls = [
      `${config.baseUrl}/${config.path}`,
      `${config.baseUrl}/index.md`,
      `https://raw.githubusercontent.com/stephanedenis/OntoWave/main/docs/index.md`,
      `https://raw.githubusercontent.com/stephanedenis/OntoWave/feature/plugin-architecture-19/docs/index.md`,
    ];
    
    console.log('Test de différentes constructions d\'URL:\n');
    
    for (const url of urls) {
      console.log(`\nTest: ${url}`);
      try {
        const response = await page.goto(url);
        const status = response.status();
        console.log(`  Status: ${status} ${response.statusText()}`);
        
        if (status === 200) {
          const content = await response.text();
          const firstLine = content.split('\n')[0];
          console.log(`  ✅ Succès - Première ligne: ${firstLine}`);
        }
      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
    }
  });

  test('Tester avec fetch depuis la page', async ({ page }) => {
    console.log('📍 Test 6: Fetch depuis le contexte de la page');
    
    await page.goto('http://localhost:8020/test-github-cors.html');
    
    const result = await page.evaluate(async () => {
      const baseUrl = "https://raw.githubusercontent.com/stephanedenis/OntoWave/main/docs";
      const path = "index.md";
      const fullUrl = `${baseUrl}/${path}`;
      
      try {
        const response = await fetch(fullUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'text/markdown, text/plain, */*'
          }
        });
        
        return {
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          contentLength: response.ok ? (await response.text()).length : 0
        };
      } catch (error) {
        return {
          url: fullUrl,
          error: error.message
        };
      }
    });
    
    console.log('Résultat du fetch:');
    console.log(JSON.stringify(result, null, 2));
  });
});
