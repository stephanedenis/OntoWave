#!/bin/bash

# Script de serveur de test OntoWave
# Simule la structure de production où /docs est la racine
# Usage: ./scripts/start-test-server.sh [port]

set -e

PORT=${1:-8080}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/docs"

# Couleurs pour logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}🚀 OntoWave Test Server${NC}                              ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que le dossier docs existe
if [ ! -d "$DOCS_DIR" ]; then
    echo -e "${YELLOW}❌ Erreur: Dossier docs/ introuvable${NC}"
    exit 1
fi

# Tuer les anciens serveurs sur ce port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port $PORT déjà utilisé, arrêt du serveur existant...${NC}"
    pkill -f "python3 -m http.server $PORT" 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}📁 Racine serveur:${NC} $DOCS_DIR"
echo -e "${GREEN}🌐 URL locale:${NC}     http://localhost:$PORT"
echo -e "${GREEN}🎯 Production:${NC}     https://ontowave.org (même structure)"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 Pages de test disponibles:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Démos générales:"
echo "    • http://localhost:$PORT/demos/index.html"
echo ""
echo "  PlantUML:"
echo "    • http://localhost:$PORT/demos/01-plantuml-minimal.html"
echo "    • http://localhost:$PORT/demos/05-plantuml-links.html"
echo "    • http://localhost:$PORT/demos/07-plantuml-file.html"
echo ""
echo "  Mermaid:"
echo "    • http://localhost:$PORT/demos/09-mermaid-flowcharts.html"
echo "    • http://localhost:$PORT/demos/10-mermaid-sequence.html"
echo ""
echo "  Tests spéciaux:"
echo "    • http://localhost:$PORT/demos/06-markdown-tables.html"
echo "    • http://localhost:$PORT/demos/11-prism-highlight.html"
echo "    • http://localhost:$PORT/demos/12-js-ts-highlight.html"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}💡 Note:${NC} baseUrl='/demos/' (comme production ontowave.org)"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Serveur démarré !${NC}"
echo -e "${YELLOW}   Ctrl+C pour arrêter${NC}"
echo ""

# Démarrer le serveur depuis le dossier docs
cd "$DOCS_DIR"
python3 -m http.server $PORT 2>&1 | while IFS= read -r line; do
    echo -e "${GREEN}[http.server]${NC} $line"
done
