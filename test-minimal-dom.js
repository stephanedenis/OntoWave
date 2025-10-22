// Script de test console pour vérifier l'intégration minimaliste
// À exécuter dans la console du navigateur après chargement de test-md-with-plantuml.md

console.log('🧪 Test Intégration Minimaliste\n');

// 1. Vérifier présence SVG
const svgs = document.querySelectorAll('svg');
console.log(`✅ Nombre de SVG trouvés: ${svgs.length}`);

// 2. Vérifier ABSENCE de wrappers
const wrappers = {
  'plantuml-diagram-wrapper': document.querySelectorAll('.plantuml-diagram-wrapper').length,
  'diagram': document.querySelectorAll('.diagram').length,
  'mermaid': document.querySelectorAll('.mermaid').length
};

console.log('\n🔍 Vérification wrappers (devrait être 0):');
Object.entries(wrappers).forEach(([name, count]) => {
  const icon = count === 0 ? '✅' : '❌';
  console.log(`${icon} .${name}: ${count}`);
});

// 3. Vérifier liens dans SVG
const svgLinks = document.querySelectorAll('svg a');
console.log(`\n🔗 Liens dans les SVG: ${svgLinks.length}`);
svgLinks.forEach((link, i) => {
  console.log(`  ${i + 1}. ${link.getAttribute('href')} → "${link.textContent.trim().substring(0, 30)}..."`);
});

// 4. Vérifier structure DOM
console.log('\n📊 Structure DOM de #app:');
const app = document.getElementById('app');
const firstChild = app.firstElementChild;
console.log(`  Premier enfant: <${firstChild.tagName.toLowerCase()}${firstChild.className ? ' class="' + firstChild.className + '"' : ''}>`);

// 5. Afficher début du HTML
console.log('\n📄 Début du contenu #app (200 premiers caractères):');
console.log(app.innerHTML.substring(0, 200));

// 6. Résumé
const allWrappersRemoved = Object.values(wrappers).every(count => count === 0);
const hasSVG = svgs.length > 0;
const hasLinks = svgLinks.length > 0;

console.log('\n' + '='.repeat(50));
console.log('📋 RÉSULTAT FINAL:');
console.log('='.repeat(50));
console.log(`✅ SVG présents: ${hasSVG ? 'OUI' : '❌ NON'}`);
console.log(`✅ Wrappers supprimés: ${allWrappersRemoved ? 'OUI' : '❌ NON'}`);
console.log(`✅ Liens dans SVG: ${hasLinks ? `OUI (${svgLinks.length})` : '❌ NON'}`);

if (hasSVG && allWrappersRemoved && hasLinks) {
  console.log('\n🎉 SUCCÈS! Intégration minimaliste validée!');
} else {
  console.log('\n⚠️ Problèmes détectés. Vérifier les détails ci-dessus.');
}
