const { test, expect } = require('@playwright/test');

test('Analyse directe erreur PlantUML', async ({ page }) => {
  await page.goto('http://localhost:8080/#index.fr.md');
  await page.waitForTimeout(2000);
  
  // Récupérer le HTML après traitement OntoWave
  const content = await page.content();
  
  // Extraire les URLs PlantUML
  const plantUMLMatches = content.match(/src="[^"]*plantuml[^"]*"/g);
  
  if (plantUMLMatches) {
    console.log(`🔍 ${plantUMLMatches.length} URLs PlantUML trouvées:`);
    
    for (let i = 0; i < plantUMLMatches.length; i++) {
      const match = plantUMLMatches[i];
      const url = match.match(/src="([^"]*)"/)[1];
      
      console.log(`\n📊 URL ${i + 1}:`);
      console.log(url);
      
      // Tester l'URL
      try {
        const response = await page.request.get(url);
        const text = await response.text();
        
        console.log(`Status: ${response.status()}`);
        console.log(`Content-Type: ${response.headers()['content-type']}`);
        
        if (text.includes('HUFFMAN') || text.includes('bad URL')) {
          console.log(`🚨 ERREUR HUFFMAN DÉTECTÉE !`);
          console.log(`Contenu d'erreur: ${text.substring(0, 300)}`);
        } else if (text.length < 100) {
          console.log(`⚠️  Réponse courte: ${text}`);
        } else {
          console.log(`✅ SVG généré (${text.length} caractères)`);
        }
      } catch (error) {
        console.log(`❌ Erreur: ${error.message}`);
      }
    }
  } else {
    console.log('❌ Aucune URL PlantUML trouvée dans le HTML');
    
    // Chercher des indices dans le code
    const plantUMLBlocks = content.match(/```plantuml[\s\S]*?```/g);
    if (plantUMLBlocks) {
      console.log(`📝 ${plantUMLBlocks.length} blocs PlantUML trouvés dans le markdown`);
    }
  }
});
