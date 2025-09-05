#!/usr/bin/env bash
set -euo pipefail

echo "[prepare_pr] Installation deps (npm ci)…"
npm ci

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

cat > PR_CHECKLIST.md <<'MD'
# PR Checklist
- [ ] build OK
- [ ] type-check OK
- [ ] README/docs mis à jour si nécessaire
- [ ] conventions de `copilotage/preferences.yml` respectées
MD

echo "✅ PR prête. Voir PR_CHECKLIST.md"
