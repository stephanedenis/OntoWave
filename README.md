# OntoWave

[![npm version](https://img.shields.io/npm/v/ontowave.svg)](https://www.npmjs.com/package/ontowave)
[![License: CC-BY-NC-SA-4.0](https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**Noyau de navigation (~100KB, zéro dépendance) pour sites statiques et applications web.**

OntoWave transforme des fichiers Markdown en documentation interactive dans le navigateur. Routing SPA basé sur le hash URL, multilingue natif, extensions chargées à la demande (Mermaid, KaTeX, PlantUML, SVG inline).

## Installation

```bash
npm install ontowave
```

Ou via CDN (recommandé pour les sites statiques) :

```html
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

## Utilisation

La page HTML est quasi-vide. OntoWave crée tout le DOM.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mon site</title>
</head>
<body>
  <script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
</body>
</html>
```

Configuration optionnelle (avant le `<script>`) :

```html
<script>
  window.ontoWaveConfig = {
    roots: [
      { base: 'fr', root: 'content/fr/' },
      { base: 'en', root: 'content/en/' }
    ],
    i18n: { default: 'fr', supported: ['fr', 'en'] }
  };
</script>
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

## Fonctionnalités

- Routing SPA basé sur le hash URL (`#/chemin/vers/page`)
- Multilingue natif (`*.fr.md`, `*.en.md`)
- Rendu Markdown complet avec tableaux alignés
- KaTeX pour les formules mathématiques
- Mermaid pour les diagrammes
- PlantUML via Kroki
- SVG inline
- Menu de navigation flottant

## Architecture

Le noyau (`dist/ontowave.js`, ≤ 200KB) est sans dépendances. Les moteurs lourds sont des extensions chargées à la demande selon le contenu de la page :

```
dist/ontowave.js        ← noyau (zéro dépendance)
dist/extensions/
  ├── markdown.js       ← chargé par défaut
  ├── mermaid.js        ← chargé si bloc ```mermaid détecté
  ├── katex.js
  └── ...
```

> Note : l'architecture modulaire est en cours de développement (v2.0). La version actuelle distribue un bundle unique.

## Développement

```bash
npm install
npm test              # tests unitaires (Vitest)
npm run test:e2e      # tests E2E (Playwright, nécessite npm run dev:docs)
npm run check         # lint + type-check + tests + build
npm run build:package # build la librairie
```

Structure du projet :

```
src/
  core/       # logique pure sans dépendances navigateur
  adapters/   # implémentations navigateur
  main.ts     # bootstrapDom(), point d'entrée
  router.ts   # routing hash-based
docs/         # site public (ontowave.org) + galerie de démos
tests/        # vitest (unit) + playwright (E2E)
```

## Contribuer

Les contributions passent par des issues GitHub. Voir [`.github/copilot-instructions.md`](.github/copilot-instructions.md) pour les conventions de travail et le workflow.

Spécifications :
- [docs/specs/architecture.fr.md](docs/specs/architecture.fr.md) — architecture modulaire
- [docs/specs/interface.fr.md](docs/specs/interface.fr.md) — spécification visuelle
- [docs/specs/roadmap.fr.md](docs/specs/roadmap.fr.md) — roadmap v1.1 / v2.0

## Licence

CC-BY-NC-SA-4.0 — Copyright (c) 2025 Stéphane Denis

Voir [LICENSE](LICENSE) pour les détails.


