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

# Préserver robots.txt (SEO)
if [ ! -f "docs/robots.txt" ]; then
  cat > docs/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://ontowave.org/sitemap.xml
EOF
  echo "✅ docs/robots.txt créé"
else
  echo "✅ docs/robots.txt déjà présent"
fi

# =============================================================================
# CRITIQUE : restaurer docs/index.html depuis git
# Le build Vite (npm run build) écrase docs/index.html avec la SPA.
# La version commitée est l'entrée CDN avec le chrome complet.
# Sans cette restauration, le site ontowave.org devient une page blanche !
# =============================================================================
if git checkout HEAD -- docs/index.html 2>/dev/null; then
  echo "✅ docs/index.html restauré depuis git (protection anti-SPA)"
else
  echo "⚠️  Impossible de restaurer docs/index.html via git checkout"
  echo "   Assurez-vous que le fichier CDN (avec page chrome) est committé."
fi

echo "🎉 Fichiers GitHub Pages restaurés avec succès!"
