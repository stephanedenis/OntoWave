import { test, expect } from '@playwright/test';

test('Test simple de OntoWave', async ({ page }) => {
  // Démarrer avec une page simple
  await page.setContent(`
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
            \`\`\`
            
            \`\`\`plantuml
            @startuml
            Alice -> Bob: Hello
            @enduml
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
  `);
  
  // Attendre que OntoWave se charge
  await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
  
  // Vérifier qu'OntoWave est disponible
  const ontoWaveExists = await page.evaluate(() => typeof window.OntoWave);
  expect(ontoWaveExists).toBe('object');
  
  // Attendre un peu pour que tout se charge
  await page.waitForTimeout(3000);
  
  // Prendre une capture d'écran pour debug
  await page.screenshot({ path: 'debug-ontowave-test.png' });
});

test('Test minimal.html en local', async ({ page }) => {
  // Utiliser le contenu du fichier minimal.html
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
  
  // Attendre que OntoWave se charge
  await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
  
  // Attendre que le contenu soit traité
  await page.waitForTimeout(5000);
  
  // Vérifier le titre
  await expect(page).toHaveTitle('OntoWave - Démo minimale');
  
  // Vérifier qu'OntoWave a créé le menu flottant
  const menuButton = page.locator('.ontowave-container button').first();
  await expect(menuButton).toBeVisible({ timeout: 10000 });
  
  // Prendre une capture d'écran
  await page.screenshot({ path: 'debug-minimal-test.png' });
});
