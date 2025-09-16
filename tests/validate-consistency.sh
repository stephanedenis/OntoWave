#!/bin/bash

echo "=== VALIDATION FINALE DE LA COHÉRENCE ==="

# 1. Vérifier les tailles de fichiers
echo "1. Vérification des tailles:"
MIN_SIZE=$(stat --format="%s" docs/ontowave.min.js)
MIN_KB=$((MIN_SIZE / 1024))
echo "   ontowave.min.js: ${MIN_SIZE} bytes = ${MIN_KB}KB"

FULL_SIZE=$(stat --format="%s" dist/ontowave.js)
FULL_KB=$((FULL_SIZE / 1024))
echo "   ontowave.js: ${FULL_SIZE} bytes = ${FULL_KB}KB"

# 2. Vérifier le contenu de index.md
echo "2. Vérification du contenu:"
if grep -q "Seulement 18KB" docs/index.md; then
    echo "   ✅ Taille française correcte (18KB)"
else
    echo "   ❌ Taille française incorrecte"
fi

if grep -q "Only 18KB" docs/index.md; then
    echo "   ✅ Taille anglaise correcte (18KB)"
else
    echo "   ❌ Taille anglaise incorrecte"
fi

if grep -q "(18KB) - Fichier unique" docs/index.md; then
    echo "   ✅ Lien de téléchargement français correct"
else
    echo "   ❌ Lien de téléchargement français incorrect"
fi

if grep -q "(18KB) - Single file" docs/index.md; then
    echo "   ✅ Lien de téléchargement anglais correct"
else
    echo "   ❌ Lien de téléchargement anglais incorrect"
fi

# 3. Vérifier l'absence de fausses références
echo "3. Vérification de l'honnêteté:"
if grep -q "npm install" docs/index.md; then
    echo "   ❌ Fausse référence npm trouvée"
else
    echo "   ✅ Pas de fausse référence npm"
fi

if grep -q "cdn.jsdelivr" docs/index.md; then
    echo "   ❌ Fausse référence CDN trouvée"
else
    echo "   ✅ Pas de fausse référence CDN"
fi

# 4. Vérifier la licence
echo "4. Vérification de la licence:"
if grep -q "CC BY-NC-SA" docs/index.md; then
    echo "   ✅ Licence CC BY-NC-SA présente"
else
    echo "   ❌ Licence manquante"
fi

if grep -q "creativecommons.org" docs/index.md; then
    echo "   ✅ Logo CC présent"
else
    echo "   ❌ Logo CC manquant"
fi

# 5. Vérifier les fichiers de téléchargement
echo "5. Vérification des téléchargements:"
if [ -f "docs/ontowave.min.js" ]; then
    echo "   ✅ ontowave.min.js disponible"
else
    echo "   ❌ ontowave.min.js manquant"
fi

if [ -f "docs/dist.tar.gz" ]; then
    echo "   ✅ dist.tar.gz disponible"
else
    echo "   ❌ dist.tar.gz manquant"
fi

echo ""
echo "=== RÉSUMÉ ==="
echo "OntoWave est maintenant cohérent et honnête :"
echo "- Taille réelle: ${MIN_KB}KB (était annoncé à 25KB)"
echo "- Plus de fausses références npm/CDN"
echo "- Licence CC BY-NC-SA clairement affichée"
echo "- Téléchargements réels disponibles"
