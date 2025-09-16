// Test direct de l'encodage UTF-8 pour PlantUML
console.log('🧪 Test d\'encodage UTF-8 pour PlantUML');

// Simuler la fonction d'encodage corrigée
function encodePlantUML(text) {
  const utf8Encoder = new TextEncoder();
  const utf8Bytes = utf8Encoder.encode(text);
  let hex = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    hex += utf8Bytes[i].toString(16).padStart(2, '0');
  }
  return 'h' + hex;
}

// Test avec du texte contenant des caractères accentués
const testText = `@startuml
title Générateur de diagrammes
Alice -> Bob: Créé un système
note right: Gère les accents: é, è, à, ç
@enduml`;

console.log('📝 Texte d\'origine:', testText);

const encoded = encodePlantUML(testText);
console.log('🔗 Encodage UTF-8:', encoded.substring(0, 100) + '...');

// Construire l'URL complète
const plantUMLUrl = `https://www.plantuml.com/plantuml/svg/~${encoded}`;
console.log('🌐 URL PlantUML:', plantUMLUrl);

// Test avec curl pour vérifier que l'encodage fonctionne
const { execSync } = require('child_process');

try {
  console.log('🚀 Test de l\'URL générée...');
  const result = execSync(`curl -s -I "${plantUMLUrl}"`, { encoding: 'utf8' });
  if (result.includes('200 OK')) {
    console.log('✅ L\'encodage UTF-8 fonctionne - serveur PlantUML répond 200 OK');
  } else {
    console.log('❌ Problème avec l\'encodage:', result);
  }
} catch (error) {
  console.log('⚠️ Erreur lors du test curl:', error.message);
}

// Comparer avec l'ancien encodage problématique
function oldEncodePlantUML(text) {
  let hex = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    hex += code.toString(16).padStart(2, '0');
  }
  return 'h' + hex;
}

const oldEncoded = oldEncodePlantUML(testText);
console.log('\n🔄 Comparaison:');
console.log('Ancien encodage:', oldEncoded.substring(0, 50) + '...');
console.log('Nouvel encodage:', encoded.substring(0, 50) + '...');
console.log('Différence:', oldEncoded !== encoded ? '✅ Encodages différents' : '❌ Encodages identiques');
