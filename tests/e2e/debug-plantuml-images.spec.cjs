const { test, expect } = require('@playwright/test');

test('🔍 Diagnostic PlantUML Images', async ({ page }) => {
  console.log('\n🔍 === DIAGNOSTIC IMAGES PLANTUML ===');
  
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // 1. Analyser le HTML des divs PlantUML
  const plantumlAnalysis = await page.evaluate(() => {
    const plantumlDivs = document.querySelectorAll('.ontowave-plantuml');
    const results = [];
    
    plantumlDivs.forEach((div, index) => {
      const img = div.querySelector('img');
      results.push({
        index,
        innerHTML: div.innerHTML,
        hasImage: !!img,
        imageSrc: img ? img.src : null,
        imageLoaded: img ? img.complete && img.naturalWidth > 0 : false,
        imageError: img ? img.src.includes('error') : false
      });
    });
    
    return results;
  });
  console.log('📊 Analyse PlantUML:', JSON.stringify(plantumlAnalysis, null, 2));
  
  // 2. Vérifier si les URLs PlantUML sont correctes
  if (plantumlAnalysis.length > 0) {
    const firstUrl = plantumlAnalysis[0].imageSrc;
    if (firstUrl) {
      console.log('🔗 Test URL PlantUML:', firstUrl.substring(0, 150) + '...');
      
      // Test de l'URL directement
      try {
        const response = await page.request.get(firstUrl);
        console.log('📡 Réponse serveur PlantUML:', response.status(), response.statusText());
      } catch (error) {
        console.log('❌ Erreur requête PlantUML:', error.message);
      }
    }
  }
  
  // 3. Vérifier les erreurs d'images
  const imageErrors = [];
  page.on('response', response => {
    if (response.url().includes('plantuml') && !response.ok()) {
      imageErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  // 4. Logs de console pour les erreurs d'images
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('plantuml') || msg.text().includes('PlantUML')) {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  
  // Recharger pour capturer les logs
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📢 Logs PlantUML:', consoleLogs);
  console.log('❌ Erreurs images:', imageErrors);
  
  expect(plantumlAnalysis.length).toBeGreaterThan(0);
});
