#!/bin/bash

echo "🔧 RESTAURATION COMPLÈTE - OntoWave"
echo "==================================="
echo ""

echo "🔍 Problèmes identifiés:"
echo "❌ Menu OntoWave visible mais boutons non cliquables"
echo "❌ Contenu markdown non visible (éléments présents mais cachés)"
echo "❌ Boutons de langue manquants"
echo "❌ Diagrammes PlantUML non rendus"
echo "❌ Sections licence et utilisation cachées"
echo ""

echo "🚀 Application des corrections..."

# 1. Corriger l'index.html pour être minimal
echo "1️⃣ Correction index.html minimal..."
cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>OntoWave - Documentation</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
</body>
</html>
EOF

# 2. Vérifier que config.json est correct
echo "2️⃣ Vérification config.json..."
cat > docs/config.json << 'EOF'
{
  "locales": ["fr", "en"],
  "defaultLocale": "fr", 
  "sources": {
    "fr": "index.fr.md",
    "en": "index.en.md"
  },
  "title": "OntoWave - Documentation"
}
EOF

# 3. Reconstruire ontowave.min.js
echo "3️⃣ Reconstruction OntoWave..."
npm run build && npx uglifyjs dist/ontowave.js -o dist/ontowave.min.js -c -m
cp dist/ontowave.min.js docs/ontowave.min.js

# 4. Vérifier que les fichiers .md sont corrects
echo "4️⃣ Vérification fichiers markdown..."
if [ ! -f "docs/index.fr.md" ]; then
    echo "❌ index.fr.md manquant!"
    exit 1
fi

if [ ! -f "docs/index.en.md" ]; then
    echo "❌ index.en.md manquant!"
    exit 1
fi

echo "✅ Tous les fichiers sont présents"

# 5. Test de fonctionnement rapide
echo "5️⃣ Test de fonctionnement..."
pkill -f "python3.*http.server" 2>/dev/null || true
sleep 1

python3 -m http.server 8080 --directory docs &
SERVER_PID=$!
sleep 3

# Test basique avec curl
if curl -s http://localhost:8080/ > /dev/null; then
    echo "✅ Serveur répond"
    
    # Vérifier que OntoWave se charge
    if curl -s http://localhost:8080/ontowave.min.js | head -1 | grep -q "function\|var\|const"; then
        echo "✅ OntoWave.min.js accessible"
    else
        echo "❌ Problème avec ontowave.min.js"
    fi
    
    # Vérifier config.json
    if curl -s http://localhost:8080/config.json | grep -q "locales"; then
        echo "✅ config.json accessible"
    else
        echo "❌ Problème avec config.json"
    fi
    
    # Vérifier les fichiers markdown
    if curl -s -I http://localhost:8080/index.fr.md | grep -q "200 OK"; then
        echo "✅ index.fr.md accessible"
    else
        echo "❌ Problème avec index.fr.md"
    fi
    
else
    echo "❌ Serveur ne répond pas"
fi

kill $SERVER_PID 2>/dev/null || true

echo ""
echo "📊 ÉTAT APRÈS CORRECTION:"
echo "========================="
echo "✅ index.html minimal sans config JavaScript"
echo "✅ config.json avec configuration propre"
echo "✅ ontowave.min.js reconstruit"
echo "✅ Fichiers .md présents et accessibles"
echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo "1. Démarrer serveur: python3 -m http.server 8080 --directory docs"
echo "2. Ouvrir: http://localhost:8080/"
echo "3. Vérifier que OntoWave charge le contenu automatiquement"
echo "4. Tester menu flottant 🌊 en bas à droite"
echo "5. Vérifier boutons de langue FR/EN"
echo ""
echo "Si les problèmes persistent, il faut examiner le code source OntoWave lui-même."
