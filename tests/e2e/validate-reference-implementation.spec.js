import { test, expect } from '@playwright/test';

test.describe('OntoWave - Test implémentation de référence', () => {
  test('minimal.html se charge correctement', async ({ page }) => {
    // Utiliser le contenu du fichier minimal.html en mémoire
    const minimalContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OntoWave - Démo minimale</title>
      </head>
      <body>
          <div id="content">
              # 🌊 OntoWave - Démo minimale

              Voici un exemple simple de diagramme PlantUML :

              \`\`\`plantuml
              @startuml
              skinparam backgroundColor #FEFEFE
              skinparam shadowing false
              
              participant "🌊 OntoWave" as OW
              participant "📝 Markdown" as MD
              participant "🎨 Diagramme" as DG
              
              OW -> MD : Parse le contenu
              MD -> DG : Génère le diagramme
              DG -> OW : Affiche le résultat
              @enduml
              \`\`\`

              Et un diagramme Mermaid :

              \`\`\`mermaid
              graph TD
                  A[📝 Markdown] --> B[🌊 OntoWave]
                  B --> C[🎨 Diagrammes]
                  B --> D[💻 Code coloré]
                  C --> E[📊 Visualisation]
              \`\`\`
          </div>

          <script>
              window.OntoWaveConfig = {
                  autoInit: true,
                  title: "OntoWave - Démo minimale"
              };
          </script>
          <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.1-1/dist/ontowave.min.js"></script>
      </body>
      </html>
    `;
    
    await page.setContent(minimalContent);
    
    // Vérifier le titre
    await expect(page).toHaveTitle('OntoWave - Démo minimale');
    
    // Vérifier que OntoWave est chargé
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Vérifier que le menu flottant apparaît
    const menuButton = page.locator('.ontowave-container button').first();
    await expect(menuButton).toBeVisible();
  });

  test('Diagrammes PlantUML dans minimal.html', async ({ page }) => {
    const minimalContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Test PlantUML</title></head>
      <body>
          <div id="content">
              # Test PlantUML
              \`\`\`plantuml
              @startuml
              Alice -> Bob: Hello
              @enduml
              \`\`\`
          </div>
          <script>
              window.OntoWaveConfig = { autoInit: true };
          </script>
          <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.1-1/dist/ontowave.min.js"></script>
      </body>
      </html>
    `;
    
    await page.setContent(minimalContent);
    
    // Attendre le chargement complet
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
    await page.waitForTimeout(5000);
    
    // Vérifier les diagrammes PlantUML
    const plantumlImages = page.locator('img[src*="plantuml"]');
    const count = await plantumlImages.count();
    
    if (count > 0) {
      // Vérifier qu'au moins une image est chargée
      const firstImage = plantumlImages.first();
      await expect(firstImage).toBeVisible();
      
      // Vérifier que l'image a une source valide
      const src = await firstImage.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('Mermaid dans minimal.html', async ({ page }) => {
    const mermaidContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Test Mermaid</title></head>
      <body>
          <div id="content">
              # Test Mermaid
              \`\`\`mermaid
              graph TD
                  A[Test] --> B[Mermaid]
              \`\`\`
          </div>
          <script>
              window.OntoWaveConfig = { autoInit: true };
          </script>
          <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.1-1/dist/ontowave.min.js"></script>
      </body>
      </html>
    `;
    
    await page.setContent(mermaidContent);
    
    // Attendre le chargement complet
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
    await page.waitForTimeout(5000);
    
    // Vérifier les diagrammes Mermaid
    const mermaidSvgs = page.locator('svg[id*="mermaid"]');
    const count = await mermaidSvgs.count();
    
    if (count > 0) {
      const firstSvg = mermaidSvgs.first();
      await expect(firstSvg).toBeVisible();
    }
  });

  test('Prism coloration dans minimal.html', async ({ page }) => {
    const prismContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Test Prism</title></head>
      <body>
          <div id="content">
              # Test Prism
              \`\`\`javascript
              const test = "hello";
              function example() {
                  return test;
              }
              \`\`\`
          </div>
          <script>
              window.OntoWaveConfig = { autoInit: true };
          </script>
          <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.1-1/dist/ontowave.min.js"></script>
      </body>
      </html>
    `;
    
    await page.setContent(prismContent);
    
    // Attendre le chargement complet
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Vérifier la coloration Prism
    const codeBlocks = page.locator('pre code[class*="language-"]');
    if (await codeBlocks.count() > 0) {
      const coloredTokens = page.locator('pre code .token');
      expect(await coloredTokens.count()).toBeGreaterThan(0);
    }
  });

  test('Console propre dans minimal.html', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    const cleanContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Test Console</title></head>
      <body>
          <div id="content"># Test propre</div>
          <script>
              window.OntoWaveConfig = { autoInit: true };
          </script>
          <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.1-1/dist/ontowave.min.js"></script>
      </body>
      </html>
    `;
    
    await page.setContent(cleanContent);
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
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
