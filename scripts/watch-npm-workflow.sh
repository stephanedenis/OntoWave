#!/bin/bash
# Script de surveillance du workflow NPM publish
# Usage: ./watch-npm-workflow.sh

set -e

# Configuration anti-pager
export PAGER=""
export GH_PAGER=""

echo "🔍 Surveillance du workflow NPM Publish"
echo "========================================"
echo ""

# Fonction pour afficher l'état du workflow
check_workflow_status() {
    echo "📊 Vérification des workflows en cours..."
    
    # Récupérer les 5 derniers workflows
    gh run list --limit 5 --json status,conclusion,name,createdAt,workflowName,databaseId 2>/dev/null | \
        jq -r '.[] | "\(.databaseId) | \(.workflowName) | \(.status) | \(.conclusion // "N/A")"' | \
        while IFS='|' read -r id name status conclusion; do
            echo "  ID: $id"
            echo "  Workflow: $name"
            echo "  Status: $status"
            echo "  Conclusion: $conclusion"
            echo "  ---"
        done
}

# Fonction pour surveiller un workflow spécifique
watch_workflow() {
    local workflow_name="${1:-npm-publish}"
    echo ""
    echo "👀 Surveillance du workflow: $workflow_name"
    echo ""
    
    # Boucle de surveillance (5 minutes max)
    for i in {1..30}; do
        echo "🔄 Check #$i ($(date +%H:%M:%S))"
        
        # Vérifier le dernier run du workflow
        latest=$(gh run list --workflow="$workflow_name" --limit 1 --json status,conclusion,databaseId 2>/dev/null | \
                 jq -r '.[0] | "\(.databaseId)|\(.status)|\(.conclusion // "N/A")"')
        
        if [[ -n "$latest" ]]; then
            IFS='|' read -r id status conclusion <<< "$latest"
            
            echo "  📌 Run ID: $id"
            echo "  📊 Status: $status"
            echo "  ✅ Conclusion: $conclusion"
            
            # Si le workflow est terminé
            if [[ "$status" == "completed" ]]; then
                echo ""
                if [[ "$conclusion" == "success" ]]; then
                    echo "🎉 Workflow terminé avec succès !"
                    echo "📦 Le package devrait être publié sur NPM"
                    echo ""
                    echo "Vérifiez sur: https://www.npmjs.com/package/ontowave"
                    return 0
                else
                    echo "❌ Workflow échoué : $conclusion"
                    echo ""
                    echo "Voir les logs: gh run view $id"
                    return 1
                fi
            fi
        else
            echo "  ⏳ Aucun workflow trouvé ou pas encore démarré"
        fi
        
        # Attendre 10 secondes avant la prochaine vérification
        if [[ $i -lt 30 ]]; then
            sleep 10
        fi
    done
    
    echo ""
    echo "⏰ Timeout : le workflow prend plus de 5 minutes"
    echo "   Vérifiez manuellement: gh run list"
}

# Vérifier l'état initial
check_workflow_status

echo ""
read -p "Voulez-vous surveiller le workflow NPM publish? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    watch_workflow "npm-publish.yml"
else
    echo "✅ Vérification manuelle: gh run list --workflow=npm-publish.yml"
fi

echo ""
echo "🎯 Surveillance terminée"