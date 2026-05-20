#!/bin/bash

# Script autonome de configuration NPM + GitHub secrets
# Pas d'éditeur, pas de pager, pas d'interaction

set -e

echo "🔧 Configuration autonome NPM + GitHub Actions"
echo "=============================================="

# Token NPM fourni par l'utilisateur
NPM_TOKEN="${1:-}"
if [ -z "$NPM_TOKEN" ]; then
    echo "❌ Usage: $0 <NPM_TOKEN>"
    echo "📝 Exemple: $0 npm_XXXXXXXXXXXXXXXXXXXXXXXX"
    exit 1
fi

# 1. Configuration NPM locale
echo "📦 Configuration NPM locale..."
npm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"
echo "✅ Token NPM configuré localement"

# 2. Vérification authentification
echo "🔐 Vérification authentification NPM..."
NPM_USER=$(npm whoami 2>/dev/null || echo "ERREUR")
if [ "$NPM_USER" != "ERREUR" ]; then
    echo "✅ Authentifié NPM comme: $NPM_USER"
else
    echo "❌ Erreur d'authentification NPM"
    exit 1
fi

# 3. Configuration GitHub secret (sans interaction)
echo "🔒 Configuration GitHub secret..."
if command -v gh &> /dev/null; then
    # Utiliser --no-pager pour éviter le pager
    export PAGER=""
    export GH_PAGER=""
    
    # Ajouter le secret sans interaction
    echo "$NPM_TOKEN" | gh secret set NPM_TOKEN --no-pager 2>/dev/null || {
        echo "⚠️  Impossible d'ajouter le secret automatiquement"
        echo "📝 Ajoutez manuellement le secret NPM_TOKEN dans GitHub:"
        echo "   - Allez sur https://github.com/stephanedenis/OntoWave/settings/secrets/actions"
        echo "   - Créez un nouveau secret 'NPM_TOKEN' avec la valeur: $NPM_TOKEN"
    }
    
    echo "✅ Configuration GitHub terminée"
else
    echo "⚠️  GitHub CLI non disponible"
    echo "📝 Ajoutez manuellement le secret NPM_TOKEN dans GitHub:"
    echo "   - Allez sur https://github.com/stephanedenis/OntoWave/settings/secrets/actions"
    echo "   - Créez un nouveau secret 'NPM_TOKEN' avec la valeur: $NPM_TOKEN"
fi

# 4. Sauvegarde locale du token
echo "💾 Sauvegarde token dans le trousseau local..."
mkdir -p ~/.config/ontowave
echo "NPM_TOKEN=$NPM_TOKEN" > ~/.config/ontowave/npm-config
chmod 600 ~/.config/ontowave/npm-config
echo "✅ Token sauvegardé dans ~/.config/ontowave/npm-config"

# 5. Test de publication en dry-run
echo "🧪 Test de publication (dry-run)..."
npm publish --dry-run || {
    echo "⚠️  Test de publication échoué - vérifiez le package.json"
}

echo ""
echo "🎉 Configuration terminée !"
echo "📋 Résumé:"
echo "   - NPM Token configuré: ✅"
echo "   - Utilisateur NPM: $NPM_USER"
echo "   - GitHub Secret: ✅ (ou instructions données)"
echo "   - Trousseau local: ~/.config/ontowave/npm-config"
echo ""
echo "🚀 Prêt pour publication automatique NPM via GitHub Actions !"