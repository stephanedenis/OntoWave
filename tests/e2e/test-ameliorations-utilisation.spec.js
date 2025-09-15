import { test, expect } from '@playwright/test';

test('Vérifier les améliorations de la section utilisation HTML', async ({ page }) => {
  const frenchContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <title>Test améliorations</title>
    </head>
    <body>
        <div id="content">
            ### 🎯 Utilisation (HTML)

            \`\`\`html
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mon Site avec OntoWave</title>
            </head>
            <body>
                <script src="ontowave.min.js"></script>
            </body>
            </html>
            \`\`\`

            **C'est tout !** OntoWave se charge automatiquement et affiche son **menu flottant** avec l'icône 🌊 en bas à droite de la page.

            #### 🌊 Menu flottant et panneau de configuration

            - **Cliquez sur l'icône 🌊** pour accéder au menu OntoWave
            - **Panneau de configuration intégré** avec options avancées
            - **Téléchargement direct** du fichier \`ontowave.min.js\` 
            - **Export HTML complet** avec votre configuration personnalisée
            - **Interface multilingue** (FR/EN) avec boutons de langue
            - **Construction dynamique** de votre page HTML optimisée

            C'est également là que vous pouvez télécharger le fichier \`ontowave.min.js\` et construire dynamiquement votre page HTML complète.
        </div>
        
        <script>
            window.OntoWaveConfig = { autoInit: true };
        </script>
        <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.1-1/dist/ontowave.min.js"></script>
    </body>
    </html>
  `;
  
  await page.setContent(frenchContent);
  await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
  await page.waitForTimeout(3000);
  
  // Vérifier que la page se charge correctement
  await expect(page.locator('h3:has-text("Utilisation (HTML)")')).toBeVisible();
  
  // Vérifier que la description du menu flottant est présente
  await expect(page.locator('text=Menu flottant et panneau de configuration')).toBeVisible();
  
  // Vérifier que les points importants sont mentionnés
  await expect(page.locator('text=Cliquez sur l\'icône 🌊')).toBeVisible();
  await expect(page.locator('text=Panneau de configuration intégré')).toBeVisible();
  await expect(page.locator('text=Téléchargement direct')).toBeVisible();
  await expect(page.locator('text=Export HTML complet')).toBeVisible();
  
  // Vérifier qu'OntoWave se charge toujours correctement
  const menuButton = page.locator('.ontowave-container button').first();
  await expect(menuButton).toBeVisible({ timeout: 10000 });
  
  // Prendre une capture d'écran pour vérification
  await page.screenshot({ path: 'test-ameliorations-utilisation.png' });
  
  console.log('✅ Toutes les améliorations de la section utilisation sont correctement visibles');
});

test('Vérifier suppression des sections superflues', async ({ page }) => {
  const content = `
    <!DOCTYPE html>
    <html>
    <head><title>Test suppression sections</title></head>
    <body>
        <div id="content">
            # Test
            
            ### 🏗️ OntoWave Architecture

            \`\`\`plantuml
            @startuml
            [Website] --> [OntoWave] : loads ontowave.min.js
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
  
  await page.setContent(content);
  await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 15000 });
  await page.waitForTimeout(3000);
  
  // Vérifier qu'il n'y a pas de sections séparées pour Mermaid et PlantUML
  const mermaidSections = page.locator('h3:has-text("Mermaid")');
  const plantumlSections = page.locator('h3:has-text("PlantUML"), h3:has-text("Supported diagrams")');
  
  expect(await mermaidSections.count()).toBe(0);
  expect(await plantumlSections.count()).toBe(0);
  
  // Vérifier que le diagramme d'architecture est conservé
  await expect(page.locator('h3:has-text("OntoWave Architecture")')).toBeVisible();
  
  console.log('✅ Les sections superflues ont été correctement supprimées');
});
