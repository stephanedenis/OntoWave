#!/bin/bash
# Restaure les fichiers critiques pour GitHub Pages après le build Vite

set -e

echo "🔧 Restauration des fichiers GitHub Pages..."

# Créer .nojekyll (désactive Jekyll)
touch docs/.nojekyll
echo "✅ docs/.nojekyll créé"

# Créer CNAME (domaine personnalisé)
echo "ontowave.org" > docs/CNAME
echo "✅ docs/CNAME créé (ontowave.org)"

# Copier les fichiers Markdown de contenu
if [ -f "index.fr.md" ]; then
  cp index.fr.md docs/
  echo "✅ docs/index.fr.md copié"
fi

if [ -f "index.en.md" ]; then
  cp index.en.md docs/
  echo "✅ docs/index.en.md copié"
fi

echo "🎉 Fichiers GitHub Pages restaurés avec succès!"
