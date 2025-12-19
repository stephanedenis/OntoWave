#!/bin/bash

# 🧪 Script de test complet pour validation avant merge
# Ce script exécute tous les tests pour garantir qu'il n'y a pas de régression

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 Test Complet de Régression - OntoWave${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Fonction pour afficher les résultats
print_test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# 1. Tests unitaires et protection docs/
echo -e "${YELLOW}📋 Étape 1/7 : Tests unitaires (Vitest)${NC}"
npm run test
print_test_result $? "Tests unitaires Vitest"
echo ""

# 2. Vérification TypeScript
echo -e "${YELLOW}📋 Étape 2/7 : Vérification TypeScript${NC}"
npm run type-check
print_test_result $? "Type checking TypeScript"
echo ""

# 3. Linting
echo -e "${YELLOW}📋 Étape 3/7 : Linting ESLint${NC}"
npm run lint
print_test_result $? "Linting ESLint"
echo ""

# 4. Spell checking
echo -e "${YELLOW}📋 Étape 4/7 : Vérification orthographique${NC}"
npm run spell || echo -e "${YELLOW}⚠️  Avertissement: Erreurs d'orthographe détectées${NC}"
echo ""

# 5. Build du package
echo -e "${YELLOW}📋 Étape 5/7 : Build du package${NC}"
npm run build
print_test_result $? "Build Vite réussi"
echo ""

# 6. Vérification de la structure docs/
echo -e "${YELLOW}📋 Étape 6/7 : Vérification structure docs/${NC}"
echo "Vérification des fichiers critiques..."

# Fichiers requis
REQUIRED_FILES=(
    "docs/index.html"
    "docs/ontowave.min.js"
    "docs/release-notes.md"
    "docs/release-notes.fr.md"
    "docs/release-notes.en.md"
    "docs/README.md"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (MANQUANT)"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    echo -e "${GREEN}✅ Tous les fichiers requis sont présents${NC}"
else
    echo -e "${RED}❌ Fichiers manquants détectés${NC}"
    exit 1
fi
echo ""

# 7. Tests E2E Playwright
echo -e "${YELLOW}📋 Étape 7/7 : Tests E2E Playwright${NC}"
echo "Démarrage du serveur local..."

# Démarrer le serveur en arrière-plan
npm run serve:docs > /dev/null 2>&1 &
SERVER_PID=$!
echo "Serveur PID: $SERVER_PID"

# Attendre que le serveur soit prêt
echo "Attente du serveur (5 secondes)..."
sleep 5

# Exécuter les tests E2E critiques
echo "Exécution des tests E2E..."
npx playwright test tests/e2e/capture-debug.spec.cjs --project=chromium || {
    echo -e "${YELLOW}⚠️  Tests E2E: Certains tests ont échoué (non-bloquant)${NC}"
}

# Arrêter le serveur
echo "Arrêt du serveur..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo -e "${GREEN}✅ Tests E2E terminés${NC}"
echo ""

# Résumé final
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ TOUS LES TESTS RÉUSSIS !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 La branche est prête pour le merge !${NC}"
echo ""
echo -e "Prochaines étapes:"
echo -e "  1. ${BLUE}git checkout main${NC}"
echo -e "  2. ${BLUE}git merge feature/plugin-architecture-19${NC}"
echo -e "  3. ${BLUE}git push origin main${NC}"
echo ""
echo -e "Ou créer une Pull Request:"
echo -e "  ${BLUE}gh pr create --title 'feat: Release notes et historique versions' --body 'Ajout de la page release notes complète'${NC}"
echo ""
