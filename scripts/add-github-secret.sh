#!/bin/bash

# Script pour ajouter le secret GitHub en mode non-interactif

set -e

NPM_TOKEN="${1:-}"
if [ -z "$NPM_TOKEN" ]; then
    echo "❌ Usage: $0 <NPM_TOKEN>"
    echo "📝 Exemple: $0 npm_XXXXXXXXXXXXXXXXXXXXXXXX"
    exit 1
fi

echo "🔒 Ajout du secret GitHub NPM_TOKEN..."

# Désactiver tous les pagers
export PAGER=""
export GH_PAGER=""
export MANPAGER=""
unset PAGER
unset GH_PAGER

# Forcer mode non-interactif
export GH_EDITOR=""
export EDITOR=""
export VISUAL=""

# Ajouter le secret en mode batch
echo "$NPM_TOKEN" | gh secret set NPM_TOKEN --body="$NPM_TOKEN" --repo="stephanedenis/OntoWave" 2>/dev/null && {
    echo "✅ Secret NPM_TOKEN ajouté avec succès !"
} || {
    echo "⚠️  Tentative alternative..."
    gh secret set NPM_TOKEN --body="$NPM_TOKEN" --no-pager 2>/dev/null && {
        echo "✅ Secret NPM_TOKEN ajouté (méthode alternative) !"
    } || {
        echo "❌ Impossible d'ajouter automatiquement"
        echo "📝 Ajoutez manuellement:"
        echo "   1. Allez sur: https://github.com/stephanedenis/OntoWave/settings/secrets/actions"
        echo "   2. Cliquez 'New repository secret'"
        echo "   3. Name: NPM_TOKEN"
        echo "   4. Value: $NPM_TOKEN"
        echo "   5. Cliquez 'Add secret'"
    }
}

# Vérifier les secrets existants (sans pager)
echo ""
echo "📋 Secrets configurés:"
gh secret list --no-pager 2>/dev/null || echo "   (Impossible de lister les secrets)"