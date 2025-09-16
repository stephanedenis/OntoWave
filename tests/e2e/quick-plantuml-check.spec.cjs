const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('Capture PlantUML error OCR', async ({ page }) => {
  // Naviguer vers la page locale
  await page.goto('http://localhost:8080/');
  
  // Attendre que la page se charge
  await page.waitForTimeout(3000);
  
  // Chercher les éléments img avec src contenant plantuml
  const plantUMLImages = await page.locator('img[src*="plantuml"]').all();
  
  console.log(`Found ${plantUMLImages.length} PlantUML images`);
  
  if (plantUMLImages.length > 0) {
    // Prendre une capture de la première image PlantUML
    const firstImage = plantUMLImages[0];
    const screenshot = await firstImage.screenshot({ path: '/tmp/plantuml-error.png' });
    
    // Récupérer l'URL source
    const src = await firstImage.getAttribute('src');
    console.log('PlantUML URL:', src);
    
    // Tester si l'URL est accessible
    try {
      const response = await page.request.get(src);
      console.log('PlantUML Response Status:', response.status());
      console.log('PlantUML Response Headers:', await response.headers());
      
      if (response.status() !== 200) {
        console.log('PlantUML Response Body:', await response.text());
      }
    } catch (error) {
      console.log('PlantUML Request Error:', error.message);
    }
  } else {
    console.log('No PlantUML images found in page');
    
    // Prendre une capture de toute la page
    await page.screenshot({ path: '/tmp/full-page.png', fullPage: true });
  }
});
