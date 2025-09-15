const { test, expect } = require('@playwright/test');

test.describe('Capture simple des problèmes', () => {
  test('Capture d\'écran rapide', async ({ page }) => {
    console.log('📸 CAPTURE RAPIDE - Problèmes Prism et PlantUML');
    
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Capture complète
    await page.screenshot({ 
      path: '/tmp/ontowave-problemes.png',
      fullPage: true 
    });
    console.log('📸 Capture complète : /tmp/ontowave-problemes.png');

    // Analyser rapidement
    const htmlBlocks = await page.locator('code.language-html').count();
    const plantUMLImages = await page.locator('img[src*="plantuml"]').count();
    
    console.log(`🎨 Blocs HTML : ${htmlBlocks}`);
    console.log(`🌱 Images PlantUML : ${plantUMLImages}`);
    
    if (htmlBlocks > 0) {
      const content = await page.locator('code.language-html').first().textContent();
      console.log(`📝 Contenu HTML : ${content?.substring(0, 150)}...`);
    }
    
    if (plantUMLImages > 0) {
      const src = await page.locator('img[src*="plantuml"]').first().getAttribute('src');
      console.log(`🔗 URL PlantUML : ${src?.substring(0, 100)}...`);
    }
  });
});
