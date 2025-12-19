#!/bin/bash
# Test du déploiement production OntoWave
# Sans webServer Playwright (utilise le serveur existant)

cd "$(dirname "$0")/../.."

echo "🧪 Test du déploiement production OntoWave (Dogfooding)"
echo "========================================================"

# Vérifier que le serveur tourne sur port 8020
if ! curl -s http://localhost:8020/index.html > /dev/null 2>&1; then
  echo "❌ Erreur: Serveur HTTP non disponible sur port 8020"
  echo "   Lancez: python3 -m http.server 8020 --directory docs"
  exit 1
fi

echo "✅ Serveur HTTP détecté sur port 8020"
echo ""

# Lancer les tests sans webServer
npx playwright test tests/e2e/production-deployment.spec.cjs \
  --project=chromium \
  --config=playwright.config.js

exit $?
