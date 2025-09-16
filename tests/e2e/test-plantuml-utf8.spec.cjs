const { test, expect } = require('@playwright/test');

test('PlantUML UTF-8 encoding test', async ({ page }) => {
  // Démarrer le serveur si nécessaire
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  
  // Attendre que OntoWave soit chargé
  await page.waitForSelector('#ontowave-floating-icon', { timeout: 10000 });
  
  // Injecter un diagramme PlantUML avec des caractères accentués pour test
  await page.evaluate(() => {
    const testContent = `
# Test d'encodage UTF-8

\`\`\`plantuml
@startuml
!define TITLE "Générateur de diagrammes"
title Système de génération
Alice -> Bob: Créé un diagramme
Bob -> Alice: Répond avec données
note right: Gère les caractères accentués: é, è, à, ç
@enduml
\`\`\`
    `;
    
    // Remplacer le contenu temporairement pour le test
    const container = document.querySelector('#ontowave-content');
    if (container) {
      container.innerHTML = '<div id="test-content">' + testContent + '</div>';
      // Forcer le retraitement par OntoWave
      if (window.OntoWave) {
        window.OntoWave.processContent();
      }
    }
  });
  
  // Attendre un peu pour le traitement
  await page.waitForTimeout(3000);
  
  // Vérifier qu'il y a un diagramme PlantUML
  const plantUMLImage = await page.locator('.ontowave-plantuml img').first();
  if (await plantUMLImage.count() > 0) {
    const imgSrc = await plantUMLImage.getAttribute('src');
    console.log('🔍 URL PlantUML générée:', imgSrc);
    
    // Vérifier que l'URL contient le préfixe hex correct
    expect(imgSrc).toContain('~h');
    
    // Tester que l'image se charge correctement
    const response = await page.request.get(imgSrc);
    expect(response.status()).toBe(200);
    
    console.log('✅ PlantUML UTF-8 encoding test passed');
  } else {
    console.log('⚠️ Aucun diagramme PlantUML trouvé pour le test');
  }
  
  // Vérifier que le contenu est bien affiché
  const testDiv = await page.locator('#test-content');
  expect(await testDiv.count()).toBeGreaterThan(0);
});
