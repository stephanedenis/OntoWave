#!/bin/bash
# Script de surveillance du workflow NPM avec anti-pager strict
# Usage: ./watch-workflow-safe.sh [run_id]

set -e

# ⚠️ RÈGLES AUTONOMIE : Configuration anti-pager OBLIGATOIRE
export PAGER=""
export GH_PAGER=""
export MANPAGER="cat"
export EDITOR=""
export VISUAL=""

echo "🔍 Surveillance Workflow NPM - Mode Autonome"
echo "=============================================="
echo ""

# Récupérer le dernier run ou utiliser l'ID fourni
RUN_ID="${1:-}"

if [[ -z "$RUN_ID" ]]; then
    echo "📋 Récupération du dernier workflow NPM Publish..."
    RUN_ID=$(gh run list --workflow="npm-publish.yml" --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || echo "")
    
    if [[ -z "$RUN_ID" ]]; then
        echo "❌ Aucun workflow trouvé"
        exit 1
    fi
    echo "   Run ID: $RUN_ID"
fi

echo ""
echo "🎯 Surveillance du workflow: $RUN_ID"
echo ""

# Fonction de vérification sans pager
check_status() {
    local run_id="$1"
    
    # Récupérer le status en JSON (pas de pager possible)
    local result=$(gh run view "$run_id" --json status,conclusion,name,startedAt 2>/dev/null | cat)
    
    if [[ -z "$result" ]]; then
        echo "❌ Impossible de récupérer le status"
        return 1
    fi
    
    # Parser le JSON
    local status=$(echo "$result" | jq -r '.status' 2>/dev/null)
    local conclusion=$(echo "$result" | jq -r '.conclusion // "N/A"' 2>/dev/null)
    local name=$(echo "$result" | jq -r '.name' 2>/dev/null)
    
    echo "  📊 Status: $status"
    echo "  ✅ Conclusion: $conclusion"
    echo "  📝 Workflow: $name"
    
    # Retourner le status
    echo "$status|$conclusion"
}

# Boucle de surveillance (max 5 minutes)
echo "⏱️  Surveillance en cours (max 5 minutes)..."
echo ""

for i in {1..30}; do
    echo "🔄 Check #$i ($(date +%H:%M:%S))"
    
    result=$(check_status "$RUN_ID")
    IFS='|' read -r status conclusion <<< "$result"
    
    if [[ "$status" == "completed" ]]; then
        echo ""
        if [[ "$conclusion" == "success" ]]; then
            echo "🎉 ✅ SUCCÈS ! Le workflow est terminé avec succès !"
            echo ""
            echo "📦 Le package devrait être publié sur NPM"
            echo "🔗 Vérifiez: https://www.npmjs.com/package/ontowave"
            echo ""
            echo "📊 Commandes de vérification:"
            echo "   npm view ontowave version"
            echo "   npm view ontowave time"
            exit 0
        elif [[ "$conclusion" == "failure" ]]; then
            echo "❌ ÉCHEC ! Le workflow a échoué"
            echo ""
            echo "📋 Voir les logs d'erreur (sans pager):"
            echo "   export GH_PAGER='' && gh run view $RUN_ID --log-failed | tail -100"
            echo ""
            echo "🔍 Analyse rapide des erreurs:"
            gh run view "$RUN_ID" --log-failed 2>/dev/null | grep -i "error" | tail -10 || echo "   Pas d'erreurs trouvées dans les logs"
            exit 1
        else
            echo "⚠️  Workflow terminé avec conclusion: $conclusion"
            exit 1
        fi
    fi
    
    # Attendre 10 secondes avant le prochain check
    if [[ $i -lt 30 ]]; then
        sleep 10
    fi
done

echo ""
echo "⏰ Timeout : Le workflow prend plus de 5 minutes"
echo "   Vérifiez manuellement: export GH_PAGER='' && gh run view $RUN_ID"
exit 2