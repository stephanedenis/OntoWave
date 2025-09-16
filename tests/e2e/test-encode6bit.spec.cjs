const { test, expect } = require('@playwright/test');

test('Test encode6bit avec nouveau contenu', async ({ page }) => {
  console.log('🧪 Test de la fonction encode6bit...');
  
  // Tester manuellement l'encodage
  const testResult = await page.evaluate(() => {
    // Reproduire la fonction encode6bit
    function encode6bit(bytes) {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
      let result = '';
      for (let i = 0; i < bytes.length; i += 3) {
        const b1 = bytes[i] || 0;
        const b2 = bytes[i + 1] || 0;
        const b3 = bytes[i + 2] || 0;
        
        result += chars[b1 >> 2];
        result += chars[((b1 & 0x3) << 4) | (b2 >> 4)];
        result += chars[((b2 & 0xF) << 2) | (b3 >> 6)];
        result += chars[b3 & 0x3F];
      }
      return result;
    }
    
    // Test avec un contenu simple
    const testText = `@startuml
Alice -> Bob: Hello
@enduml`;
    
    const utf8Bytes = new TextEncoder().encode(testText);
    const encoded = encode6bit(Array.from(utf8Bytes));
    
    return {
      original: testText,
      originalLength: testText.length,
      encoded: encoded,
      encodedLength: encoded.length
    };
  });
  
  console.log('📝 Texte original:', testResult.original);
  console.log('📏 Longueur originale:', testResult.originalLength);
  console.log('🔤 Encodé:', testResult.encoded.substring(0, 50) + '...');
  console.log('📏 Longueur encodée:', testResult.encodedLength);
  
  // Tester cette URL avec PlantUML
  const testUrl = `https://www.plantuml.com/plantuml/svg/~1${testResult.encoded}`;
  console.log('🌐 URL de test:', testUrl.substring(0, 100) + '...');
  
  try {
    const response = await page.request.get(testUrl);
    const content = await response.text();
    
    console.log('📊 Status:', response.status());
    
    if (content.includes('HUFFMAN') || content.includes('bad URL')) {
      console.log('❌ Notre encodage 6-bit ne fonctionne pas non plus');
      console.log('Erreur:', content.substring(0, 100));
    } else if (content.includes('<svg') && content.length > 500) {
      console.log('✅ Notre encodage 6-bit fonctionne !');
      console.log(`SVG généré: ${content.length} caractères`);
    } else {
      console.log('⚠️ Réponse inattendue');
      console.log(content.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Erreur de requête:', error.message);
  }
});
