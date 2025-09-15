const { test, expect } = require('@playwright/test');

test('🎉 Validation finale PlantUML + Prism HTML', async ({ page }) => {
  console.log('\n🎯 === VALIDATION FINALE COMPLÈTE ===');
  
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // 1. PlantUML
  const plantuml = await page.evaluate(() => {
    const divs = document.querySelectorAll('.ontowave-plantuml');
    const images = document.querySelectorAll('.ontowave-plantuml img');
    let loadedImages = 0;
    
    images.forEach(img => {
      if (img.complete && img.naturalWidth > 0) loadedImages++;
    });
    
    return {
      divs: divs.length,
      images: images.length,
      loaded: loadedImages
    };
  });
  
  // 2. Prism HTML
  const prism = await page.evaluate(() => {
    const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
    const htmlBlocks = document.querySelectorAll('pre code[class*="language-html"]');
    
    return {
      totalBlocks: codeBlocks.length,
      htmlBlocks: htmlBlocks.length,
      prismLoaded: !!window.Prism
    };
  });
  
  // 3. Mermaid
  const mermaid = await page.evaluate(() => {
    const mermaidDivs = document.querySelectorAll('.ontowave-mermaid');
    const svgElements = document.querySelectorAll('.ontowave-mermaid svg');
    
    return {
      divs: mermaidDivs.length,
      svgs: svgElements.length
    };
  });
  
  console.log('🏭 PlantUML:', JSON.stringify(plantuml, null, 2));
  console.log('🎨 Prism:', JSON.stringify(prism, null, 2));
  console.log('🧜‍♀️ Mermaid:', JSON.stringify(mermaid, null, 2));
  
  console.log('\n✅ RÉSULTATS FINAUX:');
  console.log(`PlantUML: ${plantuml.loaded}/${plantuml.divs} images chargées`);
  console.log(`Prism HTML: ${prism.htmlBlocks} blocs HTML colorés`);
  console.log(`Mermaid: ${mermaid.svgs}/${mermaid.divs} diagrammes SVG`);
  
  // Assertions
  expect(plantuml.divs).toBeGreaterThan(0);
  expect(plantuml.loaded).toBe(plantuml.divs);
  expect(prism.prismLoaded).toBe(true);
  expect(mermaid.svgs).toBeGreaterThan(0);
  
  console.log('\n🎉 VALIDATION RÉUSSIE - Tous les systèmes fonctionnent !');
});
