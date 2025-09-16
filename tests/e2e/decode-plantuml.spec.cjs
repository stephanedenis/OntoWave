const { test, expect } = require('@playwright/test');

test('Decode PlantUML URL', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(3000);
  
  const plantUMLImages = await page.locator('img[src*="plantuml"]').all();
  
  if (plantUMLImages.length > 0) {
    const firstImage = plantUMLImages[0];
    const src = await firstImage.getAttribute('src');
    
    console.log('Full PlantUML URL:');
    console.log(src);
    
    // Extraire la partie encodée
    const match = src.match(/\/plantuml\/svg\/~1(.+)$/);
    if (match) {
      const encoded = match[1];
      console.log('\nEncoded part:');
      console.log(encoded);
      
      // Essayer de décoder base64
      try {
        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
        console.log('\nDecoded PlantUML source:');
        console.log(decoded);
      } catch (error) {
        console.log('Failed to decode as base64:', error.message);
      }
    }
    
    // Vérifier si l'image se charge réellement
    const response = await page.request.get(src);
    const content = await response.text();
    
    // Chercher des indices sur le problème
    if (content.includes('syntax')) {
      console.log('\n⚠️  Syntax error detected!');
    }
    if (content.includes('not found')) {
      console.log('\n⚠️  Element not found!');
    }
    if (content.length < 1000) {
      console.log('\n⚠️  SVG seems too small - possible error');
    }
  }
});
