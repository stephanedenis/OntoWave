const { test, expect } = require('@playwright/test');

test('🔧 Test instance OntoWave', async ({ page }) => {
  console.log('\n🔍 === TEST INSTANCE ONTOWAVE ===');
  
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  
  // Attendre que OntoWave soit complètement chargé
  await page.waitForTimeout(2000);
  
  // 1. Vérifier la structure OntoWave
  const structure = await page.evaluate(() => {
    return {
      ontoWaveExists: !!window.OntoWave,
      instanceExists: !!window.OntoWave?.instance,
      configExists: !!window.OntoWave?.instance?.config,
      renderMarkdownExists: !!window.OntoWave?.instance?.renderMarkdown,
      plantumlConfig: window.OntoWave?.instance?.config?.plantuml
    };
  });
  console.log('🏗️ Structure OntoWave:', JSON.stringify(structure, null, 2));
  
  // 2. Tester renderMarkdown avec PlantUML
  if (structure.renderMarkdownExists) {
    const renderTest = await page.evaluate(() => {
      const testMarkdown = `# Test PlantUML
\`\`\`plantuml
@startuml
A --> B : test
@enduml
\`\`\`
`;
      
      try {
        const html = window.OntoWave.instance.renderMarkdown(testMarkdown);
        const htmlStr = String(html);
        return {
          success: true,
          originalMarkdown: testMarkdown,
          renderedHTML: htmlStr,
          htmlType: typeof html,
          containsPlantUML: htmlStr.includes('ontowave-plantuml'),
          containsImage: htmlStr.includes('<img'),
          plantumlUrl: htmlStr.match(/src="([^"]*plantuml[^"]*)"/) ? htmlStr.match(/src="([^"]*plantuml[^"]*)"/)[1] : null
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
    });
    console.log('🧪 Test renderMarkdown:', JSON.stringify(renderTest, null, 2));
  }
  
  // 3. Vérifier les blocs sur la page actuelle
  const pageBlocks = await page.evaluate(() => {
    return {
      plantumlDivs: document.querySelectorAll('.ontowave-plantuml').length,
      plantumlImages: document.querySelectorAll('.ontowave-plantuml img').length,
      allImages: document.querySelectorAll('img').length,
      mermaidDivs: document.querySelectorAll('.ontowave-mermaid').length
    };
  });
  console.log('📄 Blocs sur la page:', JSON.stringify(pageBlocks, null, 2));
  
  // Tests d'assertion
  expect(structure.ontoWaveExists).toBe(true);
  expect(structure.instanceExists).toBe(true);
  expect(structure.configExists).toBe(true);
  expect(structure.renderMarkdownExists).toBe(true);
});
