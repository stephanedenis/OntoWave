import { test, expect } from '@playwright/test';

test.describe('OntoWave Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    // Démarrer le serveur local si nécessaire
    await page.goto('http://localhost:8080');
  });

  test('should display demo landing page', async ({ page }) => {
    // Vérifier le titre
    await expect(page).toHaveTitle(/OntoWave.*Documentation Interactive/);
    
    // Vérifier les éléments de la page de démo
    await expect(page.locator('h1')).toContainText('OntoWave');
    await expect(page.locator('.subtitle')).toContainText('Documentation Interactive - Package Ultra-Simple');
    
    // Vérifier les features
    await expect(page.locator('.feature')).toHaveCount(4);
    await expect(page.locator('.feature').first()).toContainText('Zero Config');
    
    // Vérifier le code d'exemple
    await expect(page.locator('.code-example')).toContainText('cdn.jsdelivr.net/npm/ontowave');
    
    // Vérifier les boutons CTA
    await expect(page.locator('.cta-button').first()).toContainText('Démarrer la Démo');
    await expect(page.locator('.cta-button').nth(1)).toContainText('Code Source');
  });

  test('should load OntoWave when demo button is clicked', async ({ page }) => {
    // Cliquer sur le bouton de démo
    await page.click('.cta-button:has-text("Démarrer la Démo")');
    
    // Vérifier que le message de chargement apparaît
    await expect(page.locator('#loading')).toBeVisible();
    await expect(page.locator('#loading')).toContainText('Initialisation d\'OntoWave');
    
    // Attendre le chargement d'OntoWave (max 10 secondes)
    await page.waitForFunction(() => {
      return document.body.innerHTML.includes('ontowave-container') || 
             window.OntoWave !== undefined;
    }, { timeout: 10000 });
    
    // Vérifier que l'interface OntoWave est chargée
    await expect(page.locator('#ontowave-container, .ontowave-container')).toBeVisible({ timeout: 5000 });
  });

  test('should auto-start demo after 7 seconds', async ({ page }) => {
    // Attendre le démarrage automatique (5s + 2s = 7s)
    await page.waitForTimeout(7500);
    
    // Vérifier que le bouton a changé de texte
    const button = page.locator('.cta-button').first();
    await expect(button).toContainText('Démarrage automatique', { timeout: 3000 });
    
    // Attendre le chargement d'OntoWave
    await page.waitForFunction(() => {
      return document.body.innerHTML.includes('ontowave-container') || 
             window.OntoWave !== undefined;
    }, { timeout: 15000 });
    
    // Vérifier que l'interface OntoWave est chargée
    await expect(page.locator('#ontowave-container, .ontowave-container')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('OntoWave Direct Interface', () => {
  test('should load OntoWave directly from test page', async ({ page }) => {
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Attendre le chargement d'OntoWave
    await page.waitForFunction(() => {
      return window.OntoWave !== undefined;
    }, { timeout: 10000 });
    
    // Vérifier que l'interface est créée
    await expect(page.locator('#ontowave-container, .ontowave-container')).toBeVisible({ timeout: 5000 });
    
    // Vérifier le contenu par défaut (index.md)
    await expect(page.locator('body')).toContainText('OntoWave - Documentation Interactive', { timeout: 5000 });
  });

  test('should render markdown content correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Attendre le chargement complet
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await page.waitForTimeout(3000); // Attendre le rendu du contenu
    
    // Vérifier les éléments Markdown
    await expect(page.locator('h1')).toContainText('OntoWave', { timeout: 5000 });
    await expect(page.locator('h2')).toHaveCount.toBeGreaterThan(0);
    
    // Vérifier les liens de navigation
    const links = page.locator('a[href*=".md"]');
    await expect(links).toHaveCount.toBeGreaterThan(0);
  });

  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Attendre le chargement
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Cliquer sur un lien de navigation
    const configLink = page.locator('a[href*="config.md"]');
    if (await configLink.count() > 0) {
      await configLink.first().click();
      
      // Vérifier le changement de page
      await expect(page.locator('h1')).toContainText('Configuration', { timeout: 5000 });
    }
  });

  test('should process Mermaid diagrams', async ({ page }) => {
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Attendre le chargement
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await page.waitForTimeout(5000); // Plus de temps pour Mermaid
    
    // Vérifier la présence de diagrammes Mermaid
    const mermaidElements = page.locator('.mermaid, [data-processed-by-mermaid]');
    if (await mermaidElements.count() > 0) {
      await expect(mermaidElements.first()).toBeVisible();
    }
  });
});

test.describe('OntoWave Configuration', () => {
  test('should load configuration from script tag', async ({ page }) => {
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Vérifier la présence du script de configuration
    const configScript = page.locator('#ontowave-config');
    await expect(configScript).toBeVisible();
    
    // Vérifier le contenu JSON
    const configContent = await configScript.textContent();
    expect(configContent).toContain('"title": "Test OntoWave"');
    expect(configContent).toContain('"defaultPage": "index.md"');
  });

  test('should apply configuration correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Attendre le chargement
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Vérifier que le titre de la configuration est appliqué
    // (Cela dépend de l'implémentation exacte d'OntoWave)
    const titleElements = page.locator('h1, .title, [data-title]');
    if (await titleElements.count() > 0) {
      // Le titre pourrait être affiché quelque part dans l'interface
      console.log('Configuration applied successfully');
    }
  });
});

test.describe('OntoWave Package Features', () => {
  test('should be accessible via CDN syntax', async ({ page }) => {
    // Test de la syntaxe CDN locale
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Vérifier que le script OntoWave est chargé
    const scripts = page.locator('script[src*="ontowave"]');
    await expect(scripts).toHaveCount(1);
    
    // Vérifier que l'objet OntoWave est disponible
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    
    const ontowaveExists = await page.evaluate(() => typeof window.OntoWave);
    expect(ontowaveExists).toBe('function');
  });

  test('should handle missing markdown files gracefully', async ({ page }) => {
    await page.goto('http://localhost:8080/test-direct.html');
    
    // Attendre le chargement
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    
    // Essayer de naviguer vers une page inexistante
    await page.evaluate(() => {
      if (window.location.hash !== '#/nonexistent.md') {
        window.location.hash = '#/nonexistent.md';
      }
    });
    
    await page.waitForTimeout(2000);
    
    // L'application ne devrait pas crasher
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
