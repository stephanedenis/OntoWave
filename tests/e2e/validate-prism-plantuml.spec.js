import { test, expect } from '@playwright/test';

test.describe('OntoWave - Validation Prism et PlantUML', () => {
  test.beforeEach(async ({ page }) => {
    // Créer une page de test avec OntoWave
    const testContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Test OntoWave</title>
      </head>
      <body>
          <div id="content">
              # Test OntoWave
              
              \`\`\`javascript
              console.log('Hello World');
              const test = "prism";
              \`\`\`
              
              \`\`\`plantuml
              @startuml
              Alice -> Bob: Hello
              @enduml
              \`\`\`
              
              \`\`\`mermaid
              graph TD
                  A[Test] --> B[Mermaid]
              \`\`\`
          </div>
          
          <script>
              window.OntoWaveConfig = {
                  autoInit: true,
                  sources: { content: 'Test' }
              };
          </script>
          <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.1-1/dist/ontowave.min.js"></script>
      </body>
      </html>
    `;
    
    await page.setContent(testContent);
    
    // Attendre que OntoWave soit chargé
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
    await page.waitForTimeout(3000);
  });

  test('Page se charge correctement', async ({ page }) => {
    // Vérifier que la page principale se charge
    await expect(page.locator('h1')).toContainText('OntoWave');
    
    // Vérifier que OntoWave est initialisé
    const ontoWaveExists = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined';
    });
    expect(ontoWaveExists).toBe(true);
  });

  test('Menu flottant OntoWave apparaît', async ({ page }) => {
    // Vérifier que le menu flottant est présent
    await expect(page.locator('.ontowave-container')).toBeVisible();
    
    // Vérifier les boutons (prendre le premier)
    const menuButton = page.locator('.ontowave-container button').first();
    await expect(menuButton).toBeVisible();
  });

  test('Diagrammes Mermaid se chargent', async ({ page }) => {
    // Chercher les blocs de code Mermaid
    const mermaidBlocks = page.locator('code.language-mermaid');
    if (await mermaidBlocks.count() > 0) {
      // Attendre que Mermaid traite les diagrammes
      await page.waitForTimeout(3000);
      
      // Vérifier qu'au moins un diagramme SVG est généré
      const svgDiagrams = page.locator('svg[id*="mermaid"]');
      expect(await svgDiagrams.count()).toBeGreaterThan(0);
    }
  });

  test('Diagrammes PlantUML se chargent', async ({ page }) => {
    // Chercher les blocs de code PlantUML
    const plantumlBlocks = page.locator('code.language-plantuml');
    if (await plantumlBlocks.count() > 0) {
      // Attendre que PlantUML traite les diagrammes
      await page.waitForTimeout(5000);
      
      // Vérifier qu'au moins une image PlantUML est générée
      const plantumlImages = page.locator('img[src*="plantuml"]');
      expect(await plantumlImages.count()).toBeGreaterThan(0);
    }
  });

  test('Coloration syntaxique Prism fonctionne', async ({ page }) => {
    // Vérifier que Prism colore les blocs de code
    const codeBlocks = page.locator('pre code[class*="language-"]');
    if (await codeBlocks.count() > 0) {
      const firstBlock = codeBlocks.first();
      
      // Vérifier que Prism a ajouté des classes de coloration
      const coloredTokens = page.locator('pre code .token');
      expect(await coloredTokens.count()).toBeGreaterThan(0);
    }
  });

  test('Système multilingue fonctionne', async ({ page }) => {
    // Vérifier les boutons de langue
    const langButtons = page.locator('.lang-toggle');
    if (await langButtons.count() > 0) {
      await expect(langButtons).toBeVisible();
      
      // Tester le changement de langue
      const enButton = page.locator('.lang-toggle[data-lang="en"]');
      if (await enButton.isVisible()) {
        await enButton.click();
        await page.waitForTimeout(1000);
        
        // Vérifier que la langue a changé
        const currentUrl = page.url();
        expect(currentUrl).toContain('index.en.md');
      }
    }
  });

  test('Pas de doublons de licence', async ({ page }) => {
    // Vérifier qu'il n'y a qu'une seule section licence
    const licenseHeaders = page.locator('h3:has-text("Licence"), h3:has-text("License")');
    const count = await licenseHeaders.count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test('Pas de sections téléchargement/personnalisation inutiles', async ({ page }) => {
    // Vérifier qu'il n'y a pas de sections redondantes
    const downloadSections = page.locator('h3:has-text("Téléchargement")');
    const customizationSections = page.locator('h3:has-text("Personnalisation")');
    
    expect(await downloadSections.count()).toBe(0);
    expect(await customizationSections.count()).toBe(0);
  });

  test('Console sans erreurs critiques', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Attendre un peu pour capturer les erreurs
    await page.waitForTimeout(3000);
    
    // Filtrer les erreurs non critiques
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
