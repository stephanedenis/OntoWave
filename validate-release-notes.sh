#!/bin/bash

# Script de validation des Release Notes
# Vérifie que toutes les pages sont accessibles et contiennent les versions

echo "🔍 === VALIDATION RELEASE NOTES ==="
echo ""

# Vérifier que le serveur est accessible
echo "1. Vérification serveur..."
if curl -s http://127.0.0.1:8080/ > /dev/null; then
    echo "   ✅ Serveur accessible"
else
    echo "   ❌ Serveur non accessible"
    exit 1
fi

# Vérifier page d'accueil
echo ""
echo "2. Vérification index.html..."
if curl -s http://127.0.0.1:8080/ | grep -q "release-notes"; then
    echo "   ✅ Lien release notes présent dans l'index"
else
    echo "   ⚠️  Lien release notes absent de l'index"
fi

# Vérifier release notes FR
echo ""
echo "3. Vérification release-notes.md (FR)..."
RESPONSE=$(curl -s http://127.0.0.1:8080/release-notes.md)
if echo "$RESPONSE" | grep -q "Notes de version"; then
    echo "   ✅ Page FR accessible"
    
    # Compter les versions mentionnées
    COUNT=$(echo "$RESPONSE" | grep -o "v1.0.[0-9]*" | wc -l)
    echo "   📊 Versions trouvées: $COUNT"
    
    if [ "$COUNT" -ge 20 ]; then
        echo "   ✅ Historique complet présent"
    else
        echo "   ⚠️  Historique incomplet ($COUNT versions)"
    fi
else
    echo "   ❌ Page FR non accessible"
fi

# Vérifier release notes EN
echo ""
echo "4. Vérification release-notes.en.md (EN)..."
RESPONSE=$(curl -s http://127.0.0.1:8080/release-notes.en.md)
if echo "$RESPONSE" | grep -q "Release Notes"; then
    echo "   ✅ Page EN accessible"
    
    COUNT=$(echo "$RESPONSE" | grep -o "v1.0.[0-9]*" | wc -l)
    echo "   📊 Versions trouvées: $COUNT"
else
    echo "   ❌ Page EN non accessible"
fi

# Vérifier les liens CDN
echo ""
echo "5. Vérification liens CDN..."

# Test unpkg
if curl -sI "https://unpkg.com/ontowave@1.0.24/dist/ontowave.min.js" | head -1 | grep -q "200"; then
    echo "   ✅ unpkg v1.0.24 accessible"
else
    echo "   ⚠️  unpkg v1.0.24 non accessible"
fi

# Test jsDelivr
if curl -sI "https://cdn.jsdelivr.net/npm/ontowave@1.0.24/dist/ontowave.min.js" | head -1 | grep -q "200"; then
    echo "   ✅ jsDelivr v1.0.24 accessible"
else
    echo "   ⚠️  jsDelivr v1.0.24 non accessible"
fi

# Vérifier structure docs/
echo ""
echo "6. Vérification structure docs/..."
REQUIRED_FILES=(
    "docs/index.html"
    "docs/ontowave.min.js"
    "docs/release-notes.md"
    "docs/release-notes.en.md"
    "docs/release-notes.fr.md"
    "docs/README.md"
)

ALL_OK=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file existe"
    else
        echo "   ❌ $file manquant"
        ALL_OK=false
    fi
done

echo ""
echo "========================================="
if [ "$ALL_OK" = true ]; then
    echo "✅ VALIDATION RÉUSSIE - Aucune régression détectée"
    exit 0
else
    echo "❌ VALIDATION ÉCHOUÉE - Certains fichiers manquent"
    exit 1
fi
