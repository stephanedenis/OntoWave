#!/bin/bash
# Script de configuration anti-pager pour autonomie des agents
# Usage: ./configure-agent-autonomy.sh

set -e

echo "🚀 Configuration autonomie agents - Anti-pager/éditeur"

# Configuration Git globale
echo "📝 Configuration Git..."
git config --global core.pager ""
git config --global pager.log false
git config --global pager.diff false
git config --global pager.show false
git config --global pager.branch false
git config --global pager.tag false

# Variables d'environnement pour bash
echo "🔧 Configuration variables d'environnement..."
{
    echo ""
    echo "# Configuration autonomie agents - Anti-pager"
    echo "export PAGER=\"\""
    echo "export GH_PAGER=\"\""
    echo "export MANPAGER=\"cat\""
    echo "export EDITOR=\"\""
    echo "export VISUAL=\"\""
    echo "export SYSTEMD_PAGER=\"\""
    echo "export LESS=\"\""
    echo "export MORE=\"\""
} >> ~/.bashrc

# Configuration GitHub CLI
echo "⚙️ Configuration GitHub CLI..."
gh config set pager ""

# Configuration NPM pour éviter les interactions
echo "📦 Configuration NPM..."
npm config set fund false
npm config set audit false

# Alias utiles pour forcer le non-interactif
echo "🎯 Ajout d'alias sécurisés..."
{
    echo ""
    echo "# Alias anti-interaction pour agents"
    echo "alias git-log='git log --no-pager --oneline'"
    echo "alias git-diff='git diff --no-pager'"
    echo "alias git-show='git show --no-pager'"
    echo "alias gh-pr='gh pr view --no-pager'"
    echo "alias gh-secret='gh secret list --no-pager'"
    echo "alias rm='rm -f'"
    echo "alias cp='cp -f'"
    echo "alias mv='mv -f'"
} >> ~/.bashrc

echo "✅ Configuration terminée ! Redémarrez votre terminal ou exécutez:"
echo "   source ~/.bashrc"

# Test immédiat
echo "🧪 Test de configuration..."
export PAGER=""
export GH_PAGER=""

# Vérification
echo "📋 Vérification:"
echo "   PAGER: '$PAGER'"
echo "   GH_PAGER: '$GH_PAGER'"
echo "   Git pager: $(git config --global core.pager || echo 'vide')"

echo "🎯 Configuration autonomie agents terminée avec succès !"