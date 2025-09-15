const { test, expect } = require('@playwright/test');

test('🧪 Test URL PlantUML manuelle', async ({ page }) => {
  console.log('\n🔍 === TEST URL PLANTUML MANUELLE ===');
  
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // 1. Construire une URL de test manuelle
  const testResult = await page.evaluate(() => {
    const testDiagram = `@startuml
A --> B : test
@enduml`;
    
    const config = window.OntoWave.instance.config.plantuml;
    const encoded = encodeURIComponent(testDiagram);
    const url = `${config.server}/${config.format}/~1${encoded}`;
    
    return {
      server: config.server,
      format: config.format,
      content: testDiagram,
      encoded: encoded,
      fullUrl: url,
      urlLength: url.length
    };
  });
  
  console.log('🔧 Construction URL:', JSON.stringify(testResult, null, 2));
  
  // 2. Tester l'URL directement avec fetch browser
  const urlTest = await page.evaluate(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }, testResult.fullUrl);
  
  console.log('📡 Test URL directe:', JSON.stringify(urlTest, null, 2));
  
  // 3. Tester avec une URL simple de référence PlantUML
  const simpleTest = await page.evaluate(async () => {
    const simpleUrl = 'https://www.plantuml.com/plantuml/svg/~1SyfFKj2rKt3CoKnELR1Io4ZDoSa70000';
    try {
      const response = await fetch(simpleUrl, { method: 'HEAD' });
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        url: simpleUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: simpleUrl
      };
    }
  });
  
  console.log('📊 Test URL PlantUML simple:', JSON.stringify(simpleTest, null, 2));
  
  expect(testResult.server).toBe('https://www.plantuml.com/plantuml');
});
