#!/bin/bash

# Script d'exécution complète des tests OntoWave
# Usage: ./run-all-tests.sh

echo "🚀 LANCEMENT SUITE COMPLÈTE TESTS ONTOWAVE"
echo "=========================================="

# Vérifier que le serveur est actif
echo "🔍 Vérification serveur HTTP..."
if curl -s http://localhost:8080/ > /dev/null; then
    echo "✅ Serveur actif sur http://localhost:8080/"
else
    echo "❌ Serveur non accessible!"
    echo "💡 Démarrez le serveur avec: python3 -m http.server 8080 --directory docs"
    exit 1
fi

# Créer le répertoire de résultats
mkdir -p test-results

echo ""
echo "📋 TESTS DISPONIBLES:"
echo "1. 🏠 Navigation principale"
echo "2. 🎮 Démos complètes" 
echo "3. 🌐 Système multilingue"
echo "4. ⚙️ Fonctionnalités OntoWave"
echo "5. 🔗 Validation liens"
echo "6. 🎯 Suite maître (tous les tests)"

echo ""
read -p "Choisissez un test (1-6) ou 'all' pour tous: " choice

case $choice in
    1)
        echo "🏠 Exécution tests navigation..."
        npx playwright test tests/e2e/test-navigation-complete.spec.cjs --reporter=line
        ;;
    2)
        echo "🎮 Exécution tests démos..."
        npx playwright test tests/e2e/test-demos-exhaustif.spec.cjs --reporter=line
        ;;
    3)
        echo "🌐 Exécution tests multilingue..."
        npx playwright test tests/e2e/test-multilingue-exhaustif.spec.cjs --reporter=line
        ;;
    4)
        echo "⚙️ Exécution tests fonctionnalités..."
        npx playwright test tests/e2e/test-fonctionnalites-exhaustif.spec.cjs --reporter=line
        ;;
    5)
        echo "🔗 Exécution tests liens..."
        npx playwright test tests/e2e/test-validation-liens.spec.cjs --reporter=line
        ;;
    6)
        echo "🎯 Exécution suite maître..."
        npx playwright test tests/e2e/suite-tests-maitre.spec.cjs --reporter=line
        ;;
    all|ALL)
        echo "🔥 EXÉCUTION COMPLÈTE DE TOUS LES TESTS"
        echo "====================================="
        
        echo ""
        echo "1/6 🏠 Tests Navigation..."
        npx playwright test tests/e2e/test-navigation-complete.spec.cjs --reporter=line
        
        echo ""
        echo "2/6 🎮 Tests Démos..."
        npx playwright test tests/e2e/test-demos-exhaustif.spec.cjs --reporter=line
        
        echo ""
        echo "3/6 🌐 Tests Multilingue..."
        npx playwright test tests/e2e/test-multilingue-exhaustif.spec.cjs --reporter=line
        
        echo ""
        echo "4/6 ⚙️ Tests Fonctionnalités..."
        npx playwright test tests/e2e/test-fonctionnalites-exhaustif.spec.cjs --reporter=line
        
        echo ""
        echo "5/6 🔗 Tests Validation Liens..."
        npx playwright test tests/e2e/test-validation-liens.spec.cjs --reporter=line
        
        echo ""
        echo "6/6 🎯 Suite Maître (Rapport Final)..."
        npx playwright test tests/e2e/suite-tests-maitre.spec.cjs --reporter=line
        
        echo ""
        echo "🎉 TOUS LES TESTS TERMINÉS!"
        echo "=========================="
        ;;
    *)
        echo "❌ Choix invalide. Utilisez 1-6 ou 'all'"
        exit 1
        ;;
esac

echo ""
echo "✅ Exécution terminée!"
echo "📄 Consultez les résultats détaillés ci-dessus"
echo "🌐 Site de test: http://localhost:8080/"
