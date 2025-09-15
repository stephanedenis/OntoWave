const { test, expect } = require('@playwright/test');

test('🔧 Test PlantUML avec cache refresh', async ({ page }) => {
  console.log('\n🔍 === TEST PLANTUML CACHE REFRESH ===');
  
  // Aller à la page avec cache refresh
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
  
  // Force refresh
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Analyser les images PlantUML
  const plantumlAnalysis = await page.evaluate(() => {
    const plantumlDivs = document.querySelectorAll('.ontowave-plantuml');
    const results = [];
    
    plantumlDivs.forEach((div, index) => {
      const img = div.querySelector('img');
      results.push({
        index,
        hasImage: !!img,
        imageSrc: img ? img.src : null,
        imageLoaded: img ? img.complete && img.naturalWidth > 0 : false,
        innerHTML: div.innerHTML.substring(0, 200) + '...'
      });
    });
    
    return results;
  });
  
  console.log('📊 Analyse PlantUML (après refresh):', JSON.stringify(plantumlAnalysis, null, 2));
  
  // Tester une URL ~h manuellement
  const urlTest = await page.evaluate(async () => {
    const testDiagram = '@startuml\nA --> B\n@enduml';
    const encoded = encodeURIComponent(testDiagram);
    const testUrl = `https://www.plantuml.com/plantuml/svg/~h${encoded}`;
    
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      return {
        success: true,
        status: response.status,
        url: testUrl,
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: testUrl
      };
    }
  });
  
  console.log('📡 Test URL ~h:', JSON.stringify(urlTest, null, 2));
  
  expect(plantumlAnalysis.length).toBeGreaterThan(0);
});
