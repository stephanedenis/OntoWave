#!/bin/bash

echo "🧪 Test OntoWave avec captures d'écran..."

# Fonction pour prendre une capture avec curl et logs
test_page() {
    local url="$1"
    local name="$2"
    
    echo "📍 Test de $url"
    
    # Test HTTP
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "   Status HTTP: $http_status"
    
    # Contenu HTML
    echo "   Contenu HTML:"
    curl -s "$url" | head -10 | sed 's/^/     /'
    
    echo ""
}

# Vérifier que le serveur tourne
if ! curl -s http://localhost:8080 >/dev/null; then
    echo "❌ Serveur non accessible sur port 8080"
    exit 1
fi

echo "✅ Serveur accessible"

# Tester les pages
test_page "http://localhost:8080/test-simple.html" "Page test simple"
test_page "http://localhost:8080/index.md" "Fichier markdown" 
test_page "http://localhost:8080/" "Page racine"

echo "🎯 Test terminé !"