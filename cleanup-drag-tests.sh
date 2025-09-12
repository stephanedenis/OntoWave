#!/bin/bash

# Script de nettoyage des fichiers de test pour la fonctionnalité drag disable

echo "🧹 Nettoyage des fichiers de test drag disable..."

# Fichiers de test créés
TEST_FILES=(
    "test-drag-disable.html"
    "test-drag-simple.html" 
    "validation-drag.html"
    "demo-drag-disable.html"
    "tests/e2e/test_drag_disable.spec.js"
)

# Option pour garder la démo
if [ "$1" = "--keep-demo" ]; then
    echo "📋 Mode: Garder les fichiers de démo"
    TEST_FILES=(
        "test-drag-disable.html"
        "test-drag-simple.html" 
        "validation-drag.html"
        "tests/e2e/test_drag_disable.spec.js"
    )
fi

# Suppression des fichiers
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🗑️  Suppression de $file"
        rm "$file"
    else
        echo "⚠️  $file n'existe pas"
    fi
done

echo "✅ Nettoyage terminé !"

if [ "$1" != "--keep-demo" ]; then
    echo "💡 Utilise --keep-demo pour garder demo-drag-disable.html"
fi
