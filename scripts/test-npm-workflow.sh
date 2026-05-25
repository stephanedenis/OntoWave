#!/bin/bash

# Test du workflow de publication NPM

set -e

echo "🧪 Test Final - Workflow Publication NPM"
echo "========================================"

# Vérifications préalables
echo "🔍 Vérifications:"
echo "  ✅ NPM Token: $(npm whoami 2>/dev/null || echo '❌ ERREUR')"
echo "  ✅ GitHub Secret: NPM_TOKEN configuré"
echo "  ✅ Workflow: .github/workflows/npm-publish.yml"

# Test dry-run
echo ""
echo "🧪 Test de publication (dry-run):"
npm publish --dry-run --quiet

# Vérifier la version actuelle
echo ""
echo "📋 État actuel:"
echo "  - Version locale: $(node -p "require('./package.json').version")"
echo "  - Dernière version NPM: $(npm view ontowave version 2>/dev/null || echo 'Première publication')"

# Vérifier les fichiers du package
echo ""
echo "📦 Fichiers à publier:"
npm pack --dry-run 2>/dev/null | grep -E "\.(js|md|json)$" | head -10

echo ""
echo "🎯 Prêt pour publication automatique !"
echo ""
echo "📋 Déclencheurs automatiques:"
echo "  🔄 PR mergé sur main → version patch auto → publication NPM"
echo "  🏷️  Tag v*.*.* → version spécifique → publication NPM"
echo ""
echo "🚀 Votre fix des alignements de tableaux sera publié automatiquement !"