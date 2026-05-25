#!/bin/bash
# Script de nettoyage des commentaires CSS dans les fichiers JavaScript
# Usage: ./clean-css-comments.sh

set -e

echo "🧹 Nettoyage des commentaires CSS dans les fichiers JavaScript"

# Liste des fichiers à nettoyer
FILES=(
    "ontowave.js"
    "dist/ontowave.js"
    "src/markdown-table-renderer.js"
)

# Fonction de nettoyage des commentaires CSS
clean_css_comments() {
    local file="$1"
    if [[ -f "$file" ]]; then
        echo "  📝 Nettoyage: $file"
        
        # Supprimer les commentaires CSS dans les template literals
        # Pattern: /* commentaire */
        sed -i 's|/\* [^*]*\*/||g' "$file"
        
        # Supprimer les commentaires CSS multi-lignes (plus complexes)
        sed -i '/\/\*/,/\*\//d' "$file" 2>/dev/null || true
        
        echo "  ✅ Nettoyé: $file"
    else
        echo "  ⚠️  Fichier non trouvé: $file"
    fi
}

# Nettoyage des fichiers
for file in "${FILES[@]}"; do
    clean_css_comments "$file"
done

# Vérification finale
echo ""
echo "🔍 Vérification finale..."
for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        count=$(grep -c "/\* .* \*/" "$file" 2>/dev/null || echo "0")
        if [[ "$count" == "0" ]]; then
            echo "  ✅ $file: Aucun commentaire CSS trouvé"
        else
            echo "  ⚠️  $file: $count commentaires CSS restants"
        fi
    fi
done

echo ""
echo "🎯 Nettoyage terminé !"
echo "📋 Note: Les commentaires CSS dans les template literals JavaScript"
echo "   peuvent causer des problèmes avec les linters GitHub"