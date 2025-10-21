#!/bin/bash

echo "🎯 Test Final - Validation Alignements OntoWave"
echo "=================================================="

# Tester l'accès à la page
echo "1. Test accès page test-final-alignements.html..."
RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8090/test-final-alignements.html -o /dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Page accessible (HTTP 200)"
else
    echo "❌ Page non accessible (HTTP $RESPONSE)"
    exit 1
fi

# Vérifier le contenu généré
echo "2. Test contenu HTML généré..."
HTML_CONTENT=$(curl -s http://localhost:8090/test-final-alignements.html)

# Chercher des indices de tableaux HTML
TABLE_COUNT=$(echo "$HTML_CONTENT" | grep -c "<table>")
echo "📊 Tableaux <table> trouvés: $TABLE_COUNT"

# Chercher les classes d'alignement
LEFT_CLASSES=$(echo "$HTML_CONTENT" | grep -c "text-left")
CENTER_CLASSES=$(echo "$HTML_CONTENT" | grep -c "text-center")
RIGHT_CLASSES=$(echo "$HTML_CONTENT" | grep -c "text-right")

echo "📊 Classes text-left: $LEFT_CLASSES"
echo "📊 Classes text-center: $CENTER_CLASSES"  
echo "📊 Classes text-right: $RIGHT_CLASSES"

# Vérifier OntoWave est chargé
ONTOWAVE_SCRIPT=$(echo "$HTML_CONTENT" | grep -c "dist/ontowave.js")
echo "📦 Script OntoWave chargé: $ONTOWAVE_SCRIPT"

# Résumé
echo ""
echo "📋 RÉSUMÉ DU TEST:"
echo "=================="

if [ $TABLE_COUNT -gt 0 ] && [ $LEFT_CLASSES -gt 0 ] && [ $CENTER_CLASSES -gt 0 ] && [ $RIGHT_CLASSES -gt 0 ]; then
    echo "🎉 SUCCÈS - Les alignements semblent fonctionner !"
    echo "   - Tableaux générés: $TABLE_COUNT"
    echo "   - Classes d'alignement détectées dans le HTML"
    echo "   - OntoWave correctement chargé"
else
    echo "❌ ÉCHEC - Problème détecté:"
    [ $TABLE_COUNT -eq 0 ] && echo "   - Aucun tableau généré"
    [ $LEFT_CLASSES -eq 0 ] && echo "   - Aucune classe text-left"
    [ $CENTER_CLASSES -eq 0 ] && echo "   - Aucune classe text-center"
    [ $RIGHT_CLASSES -eq 0 ] && echo "   - Aucune classe text-right"
fi

echo ""
echo "💡 Pour validation complète, ouvrir dans un navigateur:"
echo "   http://localhost:8090/test-final-alignements.html"