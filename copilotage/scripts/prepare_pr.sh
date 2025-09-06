#!/usr/bin/env bash
set -euo pipefail

echo "[prepare_pr] Installation deps (npm ci)…"
npm ci

echo "[prepare_pr] Lint…"
if npm run -s lint; then
  echo "✅ Lint OK"
else
  echo "❌ Lint échoué. Corrigez avant PR."
  exit 1
fi

echo "[prepare_pr] Type-check…"
if ! npm run -s type-check; then
  echo "❌ Type-check échoué. Corrigez avant PR."
  exit 1
fi

echo "[prepare_pr] Build…"
if ! npm run -s build; then
  echo "❌ Build échoué. Corrigez avant PR."
  exit 1
fi

if npm run -s test >/dev/null 2>&1; then
  echo "[prepare_pr] Tests…"
  if ! npm run -s test; then
    echo "❌ Tests échoués. Corrigez avant PR."
    exit 1
  fi
fi

CHANGED=$(git diff --name-only | wc -l | tr -d ' ')
if [ "$CHANGED" -gt 25 ]; then
  echo "⚠️  Gros diff détecté ($CHANGED fichiers). Songez à découper la PR."
fi

cat > PR_CHECKLIST.md <<'MD'
# PR Checklist
- [ ] build OK
- [ ] type-check OK
- [ ] lint OK
- [ ] README/docs mis à jour si nécessaire
- [ ] breaking changes documentées
- [ ] tests ajoutés ou N/A
- [ ] conventions de `copilotage/preferences.yml` respectées
MD

echo "✅ PR prête. Voir PR_CHECKLIST.md"
