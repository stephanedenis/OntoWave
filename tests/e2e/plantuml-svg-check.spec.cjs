const { test, expect } = require('@playwright/test');

test('Test PlantUML SVG content', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(3000);
  
  const plantUMLImages = await page.locator('img[src*="plantuml"]').all();
  
  if (plantUMLImages.length > 0) {
    const firstImage = plantUMLImages[0];
    const src = await firstImage.getAttribute('src');
    
    console.log('PlantUML URL (first 100 chars):', src.substring(0, 100));
    
    // Récupérer le contenu SVG
    const response = await page.request.get(src);
    const svgContent = await response.text();
    
    console.log('SVG content (first 500 chars):');
    console.log(svgContent.substring(0, 500));
    
    // Chercher des mots-clés d'erreur
    const errorKeywords = ['error', 'Error', 'ERROR', 'syntax', 'invalid', 'not found'];
    const hasError = errorKeywords.some(keyword => svgContent.includes(keyword));
    
    if (hasError) {
      console.log('⚠️  ERROR DETECTED in SVG content!');
    } else {
      console.log('✅ No error detected in SVG content');
    }
    
    // Vérifier si c'est un vrai diagramme (contient des éléments SVG)
    const hasRealDiagram = svgContent.includes('<g') && svgContent.includes('<path');
    console.log('Has real diagram elements:', hasRealDiagram);
    
    // Compter les caractères pour voir si c'est un vrai contenu
    console.log('SVG content length:', svgContent.length);
  }
});
