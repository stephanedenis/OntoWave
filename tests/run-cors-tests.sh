#!/bin/bash

# Script pour tester le support CORS d'OntoWave avec deux serveurs
# Port 8010: Serveur principal OntoWave
# Port 8011: Serveur externe CORS simulé

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Fonction pour nettoyer les processus en arrière-plan
cleanup() {
    log_info "Arrêt des serveurs..."
    
    if [ ! -z "$MAIN_SERVER_PID" ]; then
        kill $MAIN_SERVER_PID 2>/dev/null || true
        log_info "Serveur principal (8010) arrêté"
    fi
    
    if [ ! -z "$CORS_SERVER_PID" ]; then
        kill $CORS_SERVER_PID 2>/dev/null || true
        log_info "Serveur CORS (8011) arrêté"
    fi
    
    # Nettoyer les processus restants sur les ports
    lsof -ti:8010 | xargs kill -9 2>/dev/null || true
    lsof -ti:8011 | xargs kill -9 2>/dev/null || true
}

# Enregistrer la fonction de nettoyage pour être appelée à la sortie
trap cleanup EXIT INT TERM

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "Erreur: package.json introuvable. Exécutez ce script depuis la racine du projet."
    exit 1
fi

log_info "🌊 OntoWave - Test CORS avec sources externes"
echo ""

# Vérifier que Python est installé
if ! command -v python3 &> /dev/null; then
    log_error "Python 3 n'est pas installé"
    exit 1
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    log_warning "node_modules introuvable. Installation des dépendances..."
    npm install
fi

log_info "Vérification des ports 8010 et 8011..."

# Vérifier que les ports sont disponibles
if lsof -Pi :8010 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_error "Le port 8010 est déjà utilisé"
    log_info "Exécutez: lsof -ti:8010 | xargs kill -9"
    exit 1
fi

if lsof -Pi :8011 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_error "Le port 8011 est déjà utilisé"
    log_info "Exécutez: lsof -ti:8011 | xargs kill -9"
    exit 1
fi

log_success "Ports 8010 et 8011 disponibles"
echo ""

# Démarrer le serveur CORS (port 8011) en arrière-plan
log_info "Démarrage du serveur CORS externe sur le port 8011..."

# Ensure port is completely freed
sleep 1

python3 tests/cors-server.py > /tmp/cors-server-8011.log 2>&1 &
CORS_SERVER_PID=$!

# Attendre que le serveur CORS soit prêt
sleep 2

if ! ps -p $CORS_SERVER_PID > /dev/null; then
    log_error "Échec du démarrage du serveur CORS"
    cat /tmp/cors-server-8011.log
    exit 1
fi

# Vérifier que le serveur CORS répond
if curl -s -f http://localhost:8011/api-guide.md > /dev/null; then
    log_success "Serveur CORS (8011) démarré et répondant"
else
    log_error "Le serveur CORS ne répond pas"
    exit 1
fi

# Démarrer le serveur principal Vite (port 8010)
log_info "Démarrage du serveur principal OntoWave sur le port 8010..."
npx vite --port 8010 --host > /tmp/vite-server-8010.log 2>&1 &
MAIN_SERVER_PID=$!

# Attendre que Vite soit prêt
log_info "Attente du démarrage de Vite..."
sleep 5

if ! ps -p $MAIN_SERVER_PID > /dev/null; then
    log_error "Échec du démarrage du serveur Vite"
    cat /tmp/vite-server-8010.log
    exit 1
fi

# Vérifier que le serveur principal répond
MAX_RETRIES=10
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f http://localhost:8010/tests/test-cors.html > /dev/null 2>&1; then
        log_success "Serveur principal (8010) démarré et répondant"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        log_error "Le serveur principal ne répond pas après $MAX_RETRIES tentatives"
        cat /tmp/vite-server-8010.log
        exit 1
    fi
    sleep 2
done

echo ""
log_success "Les deux serveurs sont prêts!"
echo ""
echo "📍 Serveur principal: http://localhost:8010"
echo "📍 Serveur CORS:      http://localhost:8011"
echo "📍 Page de test:      http://localhost:8010/tests/test-cors.html"
echo ""

# Afficher les logs des serveurs
log_info "Logs du serveur CORS (8011):"
tail -n 5 /tmp/cors-server-8011.log
echo ""

# Mode de fonctionnement
if [ "$1" == "--interactive" ] || [ "$1" == "-i" ]; then
    log_info "Mode interactif: Les serveurs restent actifs"
    log_warning "Ouvrez http://localhost:8010/tests/test-cors.html dans votre navigateur"
    log_warning "Appuyez sur Ctrl+C pour arrêter les serveurs"
    echo ""
    
    # Attendre indéfiniment
    wait
else
    # Lancer les tests Playwright
    log_info "Lancement des tests Playwright..."
    echo ""
    
    if npx playwright test tests/e2e/test-cors-external-sources.spec.cjs --reporter=line; then
        log_success "Tous les tests CORS ont réussi! 🎉"
        EXIT_CODE=0
    else
        log_error "Certains tests CORS ont échoué"
        EXIT_CODE=1
    fi
    
    echo ""
    log_info "Logs disponibles:"
    echo "  - Serveur principal: /tmp/vite-server-8010.log"
    echo "  - Serveur CORS:      /tmp/cors-server-8011.log"
    
    exit $EXIT_CODE
fi
