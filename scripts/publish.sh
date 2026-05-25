#!/bin/bash

# Script de publication NPM avec gestion des versions

set -e

echo "🚀 Script de publication OntoWave sur NPM"
echo "=========================================="

# Vérifier qu'on est sur la branche main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Erreur: Vous devez être sur la branche 'main' pour publier"
    exit 1
fi

# Vérifier qu'il n'y a pas de changements non committés
if ! git diff-index --quiet HEAD --; then
    echo "❌ Erreur: Il y a des changements non committés"
    echo "Veuillez committer ou stasher vos changements avant de publier"
    exit 1
fi

# Construire la version minifiée
echo "📦 Construction de la version minifiée..."
npm run build:package

# Copier vers docs pour GitHub Pages
cp dist/ontowave.min.js docs/ontowave.min.js

# Demander le type de version
echo ""
echo "🏷️  Quel type de version voulez-vous publier ?"
echo "1) patch (1.0.0 → 1.0.1) - corrections de bugs"
echo "2) minor (1.0.0 → 1.1.0) - nouvelles fonctionnalités"
echo "3) major (1.0.0 → 2.0.0) - breaking changes"
echo "4) prerelease (1.0.0 → 1.0.1-0) - version de test"
echo ""
read -p "Votre choix (1-4): " choice

case $choice in
    1) VERSION_TYPE="patch" ;;
    2) VERSION_TYPE="minor" ;;
    3) VERSION_TYPE="major" ;;
    4) VERSION_TYPE="prerelease" ;;
    *) echo "❌ Choix invalide"; exit 1 ;;
esac

# Bump de version
echo "📈 Mise à jour de la version ($VERSION_TYPE)..."
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)

echo "🔍 Nouvelle version: $NEW_VERSION"

# Construire à nouveau avec la nouvelle version
npm run build:package
cp dist/ontowave.min.js docs/ontowave.min.js

# Committer les changements de version
git add package.json docs/ontowave.min.js
git commit -m "chore: bump version to $NEW_VERSION"

# Créer le tag
git tag "v$NEW_VERSION"

# Test de publication (dry-run)
echo "🧪 Test de publication..."
npm publish --dry-run

echo ""
echo "✅ Test de publication réussi !"
echo ""
echo "🤔 Voulez-vous procéder à la publication réelle ? (y/N)"
read -p "Continuer ? " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo "📤 Publication sur NPM..."
    npm publish --access public
    
    echo "🚀 Pousser vers GitHub..."
    git push origin main
    git push origin "v$NEW_VERSION"
    
    echo ""
    echo "🎉 Publication réussie !"
    echo "📦 Package: ontowave@$NEW_VERSION"
    echo "🌐 NPM: https://www.npmjs.com/package/ontowave"
    echo "📋 CDN JSDelivr: https://cdn.jsdelivr.net/npm/ontowave@$NEW_VERSION/dist/ontowave.min.js"
    echo "📋 CDN JSDelivr (latest): https://cdn.jsdelivr.net/npm/ontowave/dist/ontowave.min.js"
    echo "📋 CDN Unpkg: https://unpkg.com/ontowave@$NEW_VERSION/dist/ontowave.min.js"
    echo "📋 CDN Unpkg (latest): https://unpkg.com/ontowave/dist/ontowave.min.js"
else
    echo "❌ Publication annulée"
    echo "⚠️  La version a été bumpée mais pas publiée"
    echo "💡 Pour revenir en arrière: git reset HEAD~1 && git tag -d v$NEW_VERSION"
fi
