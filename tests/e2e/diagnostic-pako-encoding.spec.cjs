const { test, expect } = require('@playwright/test');

test('Diagnostic Pako et encodage PlantUML', async ({ page }) => {
  await page.goto('http://localhost:8080/#index.fr.md');
  
  // Écouter les logs de la console
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  await page.waitForTimeout(5000);
  
  console.log('📋 Logs de la console:');
  consoleLogs.forEach(log => console.log(log));
  
  // Vérifier si Pako est disponible
  const pakoAvailable = await page.evaluate(() => {
    return typeof window.pako !== 'undefined';
  });
  
  console.log(`🔧 Pako disponible: ${pakoAvailable}`);
  
  if (!pakoAvailable) {
    console.log('🚨 PROBLÈME IDENTIFIÉ: Pako non chargé !');
    console.log('➡️  OntoWave utilise le fallback sans compression');
    console.log('➡️  Cela génère des URLs PlantUML invalides');
    console.log('➡️  Le serveur PlantUML rejette avec erreur HUFFMAN');
  } else {
    console.log('✅ Pako chargé correctement');
  }
  
  // Tester l'encodage manuellement
  const testEncode = await page.evaluate(() => {
    const text = `@startuml
!theme plain
skinparam backgroundColor transparent

[Site Web] --> [OntoWave] : charge ontowave.min.js
[OntoWave] --> [Interface] : crée menu flottant
@enduml`;

    // Simuler l'encodage sans compression (problème)
    const utf8Bytes = new TextEncoder().encode(text);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64 = btoa(binary);
    const uncompressed = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    return {
      original: text.length,
      encoded: uncompressed.length,
      encodedStart: uncompressed.substring(0, 50)
    };
  });
  
  console.log('🧪 Test d\'encodage:');
  console.log(`Original: ${testEncode.original} chars`);
  console.log(`Encodé: ${testEncode.encoded} chars`);
  console.log(`Début: ${testEncode.encodedStart}...`);
});
