const { test, expect } = require('@playwright/test');

test('🧪 Diagnostic complet de la régression PlantUML', async ({ page }) => {
  console.log('\n🔍 === DIAGNOSTIC RÉGRESSION PLANTUML ===');
  
  // Démarrer le serveur
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  
  // 1. Vérifier le chargement de la configuration
  console.log('\n📋 1. VÉRIFICATION CONFIGURATION');
  const configPlantUML = await page.evaluate(() => {
    return {
      enablePlantUML: window.OntoWave?.config?.enablePlantUML,
      plantumlConfig: window.OntoWave?.config?.plantuml,
      configLoaded: !!window.OntoWave?.config
    };
  });
  console.log('📊 Configuration PlantUML:', JSON.stringify(configPlantUML, null, 2));
  
  // 2. Vérifier la présence des blocs PlantUML dans le markdown
  console.log('\n📝 2. VÉRIFICATION CONTENU MARKDOWN');
  const markdownContent = await page.evaluate(() => {
    const contentDiv = document.querySelector('#ontowave-content');
    const allText = contentDiv?.textContent || '';
    const plantumlBlocks = allText.match(/@startuml[\s\S]*?@enduml/g) || [];
    return {
      hasContent: !!contentDiv,
      contentLength: allText.length,
      plantumlBlocks: plantumlBlocks.length,
      firstBlock: plantumlBlocks[0] || null
    };
  });
  console.log('📄 Contenu:', JSON.stringify(markdownContent, null, 2));
  
  // 3. Vérifier le traitement des blocs de code
  console.log('\n🏗️ 3. VÉRIFICATION TRAITEMENT BLOCS');
  const codeBlocks = await page.evaluate(() => {
    const blocks = {
      plantumlDivs: document.querySelectorAll('.ontowave-plantuml').length,
      plantumlImages: document.querySelectorAll('.ontowave-plantuml img').length,
      mermaidDivs: document.querySelectorAll('.ontowave-mermaid').length,
      codeBlocks: document.querySelectorAll('pre code[class*="language-plantuml"]').length,
      allPreTags: document.querySelectorAll('pre').length
    };
    
    // Récupérer les URLs des images PlantUML
    const plantumlUrls = Array.from(document.querySelectorAll('.ontowave-plantuml img')).map(img => img.src);
    
    return { ...blocks, plantumlUrls };
  });
  console.log('🔧 Blocs de code:', JSON.stringify(codeBlocks, null, 2));
  
  // 4. Vérifier les logs de console
  console.log('\n📋 4. CAPTURE DES LOGS');
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('PlantUML') || msg.text().includes('plantuml') || msg.text().includes('🏭')) {
      logs.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  
  // Recharger pour capturer les logs
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📢 Logs PlantUML:', logs);
  
  // 5. Test du renderMarkdown directement
  console.log('\n🧪 5. TEST DIRECT RENDERMARKDOWN');
  const renderTest = await page.evaluate(() => {
    const testMarkdown = `# Test PlantUML

\`\`\`plantuml
@startuml
A --> B : test
@enduml
\`\`\`

Fin du test.`;
    
    if (window.OntoWave && window.OntoWave.renderMarkdown) {
      try {
        const html = window.OntoWave.renderMarkdown(testMarkdown);
        return {
          success: true,
          html: html,
          containsPlantUML: html.includes('ontowave-plantuml'),
          containsImage: html.includes('<img'),
          config: window.OntoWave.config?.plantuml
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          config: window.OntoWave.config?.plantuml
        };
      }
    } else {
      return {
        success: false,
        error: 'OntoWave.renderMarkdown not available'
      };
    }
  });
  console.log('🧩 Test renderMarkdown:', JSON.stringify(renderTest, null, 2));
  
  // Résumé final
  console.log('\n📊 === RÉSUMÉ DU DIAGNOSTIC ===');
  console.log(`✅ Configuration chargée: ${configPlantUML.configLoaded}`);
  console.log(`✅ PlantUML activé: ${configPlantUML.enablePlantUML}`);
  console.log(`✅ Config PlantUML: ${!!configPlantUML.plantumlConfig}`);
  console.log(`✅ Blocs @startuml trouvés: ${markdownContent.plantumlBlocks}`);
  console.log(`✅ Divs PlantUML créées: ${codeBlocks.plantumlDivs}`);
  console.log(`✅ Images PlantUML: ${codeBlocks.plantumlImages}`);
  console.log(`✅ URLs générées: ${codeBlocks.plantumlUrls.length > 0}`);
  
  // Vérification finale
  expect(configPlantUML.configLoaded).toBe(true);
  expect(markdownContent.plantumlBlocks).toBeGreaterThan(0);
});
