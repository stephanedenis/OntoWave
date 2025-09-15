const { test, expect } = require('@playwright/test');

test('🔧 Test simple PlantUML', async ({ page }) => {
  console.log('\n🔍 === TEST SIMPLE PLANTUML ===');
  
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  
  // 1. Vérifier si OntoWave est chargé
  const ontoWaveStatus = await page.evaluate(() => {
    return {
      ontoWaveExists: !!window.OntoWave,
      configExists: !!window.OntoWave?.config,
      plantumlConfig: window.OntoWave?.config?.plantuml
    };
  });
  console.log('🌊 OntoWave Status:', JSON.stringify(ontoWaveStatus, null, 2));
  
  // 2. Forcer un test de rendu avec PlantUML
  if (ontoWaveStatus.ontoWaveExists) {
    const renderTest = await page.evaluate(() => {
      const testMarkdown = `# Test
\`\`\`plantuml
@startuml
A --> B
@enduml
\`\`\`
`;
      
      if (window.OntoWave.renderMarkdown) {
        const html = window.OntoWave.renderMarkdown(testMarkdown);
        return {
          originalMarkdown: testMarkdown,
          renderedHTML: html,
          containsPlantUML: html.includes('ontowave-plantuml'),
          config: window.OntoWave.config?.plantuml
        };
      }
      return { error: 'renderMarkdown not found' };
    });
    console.log('🧪 Render Test:', JSON.stringify(renderTest, null, 2));
  }
  
  // 3. Vérifier les blocs PlantUML sur la page
  const pageBlocks = await page.evaluate(() => {
    const plantumlDivs = document.querySelectorAll('.ontowave-plantuml');
    const plantumlImages = document.querySelectorAll('.ontowave-plantuml img');
    const codeBlocks = document.querySelectorAll('pre code');
    
    return {
      plantumlDivs: plantumlDivs.length,
      plantumlImages: plantumlImages.length,
      totalCodeBlocks: codeBlocks.length,
      plantumlUrls: Array.from(plantumlImages).map(img => img.src.substring(0, 100) + '...')
    };
  });
  console.log('📄 Page Blocks:', JSON.stringify(pageBlocks, null, 2));
  
  // Test de base
  expect(ontoWaveStatus.ontoWaveExists).toBe(true);
});
