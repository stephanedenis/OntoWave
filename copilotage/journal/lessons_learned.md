# 💡 Leçons Apprises — OntoWave

## Structure et conventions

- Le dossier `docs/` est à la fois le site public ET la galerie de démos — ne jamais séparer les deux
- Les pages de démo dans `docs/demos/` sont les **cas de test officiels** Playwright
- Un test Playwright sans page de démo correspondante dans `docs/` ne sera jamais stable

## Tests et qualité

- Les fichiers de spec debug/temporaires s'accumulent rapidement dans `tests/e2e/` — les archiver régulièrement dans `tests/e2e/archive/`
- Seuls les fichiers dans `tests/e2e/demos/` sont les specs canoniques à maintenir
- `npm run check` (lint + type-check + tests + spell + build) doit passer avant tout commit dans `main`

## Workflow IA

- Chaque mission doit être liée à un issue GitHub avant de démarrer
- Le journal de session (`copilotage/journal/`) doit être tenu à jour pendant la mission
- Ne jamais commiter directement dans `main` — toujours passer par une branche `feat/`, `fix/` ou `chore/`
