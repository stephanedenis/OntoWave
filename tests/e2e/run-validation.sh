#!/bin/bash

echo "🧪 Tests de validation OntoWave - Prism et PlantUML"
echo "=================================================="
echo "ℹ️  Les tests utilisent du contenu en mémoire (pas besoin de serveur)"
echo ""

echo "🎯 Lancement des tests Playwright..."
echo ""

# Lancer les tests avec rapport détaillé
npx playwright test tests/e2e/validate-prism-plantuml.spec.js --reporter=line
PRISM_EXIT_CODE=$?

echo ""
echo "🎯 Test de l'implémentation de référence..."
echo ""

npx playwright test tests/e2e/validate-reference-implementation.spec.js --reporter=line
REF_EXIT_CODE=$?

echo ""
echo "🎯 Tests simples supplémentaires..."
echo ""

npx playwright test tests/e2e/test-simple.spec.js --reporter=line
SIMPLE_EXIT_CODE=$?

echo ""
echo "📊 Résultats des tests:"
echo "======================"

if [ $PRISM_EXIT_CODE -eq 0 ]; then
    echo "✅ Tests Prism/PlantUML: RÉUSSIS"
else
    echo "❌ Tests Prism/PlantUML: ÉCHEC"
fi

if [ $REF_EXIT_CODE -eq 0 ]; then
    echo "✅ Tests implémentation référence: RÉUSSIS"
else
    echo "❌ Tests implémentation référence: ÉCHEC"
fi

if [ $SIMPLE_EXIT_CODE -eq 0 ]; then
    echo "✅ Tests simples: RÉUSSIS"
else
    echo "❌ Tests simples: ÉCHEC"
fi

echo ""

# Code de sortie global
if [ $PRISM_EXIT_CODE -eq 0 ] && [ $REF_EXIT_CODE -eq 0 ] && [ $SIMPLE_EXIT_CODE -eq 0 ]; then
    echo "🎉 Tous les tests ont réussi!"
    echo ""
    echo "📋 Fonctionnalités validées:"
    echo "   ✅ Chargement OntoWave depuis CDN"
    echo "   ✅ Rendu des diagrammes PlantUML"
    echo "   ✅ Rendu des diagrammes Mermaid" 
    echo "   ✅ Coloration syntaxique Prism"
    echo "   ✅ Interface utilisateur (menu flottant)"
    echo "   ✅ Console sans erreurs critiques"
    echo "   ✅ Validation de contenu (pas de doublons)"
    echo ""
    exit 0
else
    echo "⚠️  Certains tests ont échoué"
    exit 1
fi
