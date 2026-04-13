# Roadmap OntoWave

> Version : 1.0 — 12 avril 2026  
> Statut : **approuvée**

## Vision

**OntoWave** est un noyau de navigation indépendant (~100KB, zéro dépendance) pour sites statiques et applications web. Des extensions légères sont chargées à la demande selon le contenu : Markdown, diagrammes, formules mathématiques, et au-delà.

OntoWave s'intègre naturellement dans l'écosystème Panini (PaniniFS, PublicationEngine, Pensine-web) mais n'en dépend pas et ne le suppose pas. Il est utilisable seul par n'importe quel projet.

## Positionnement

| Ce qu'est OntoWave | Ce qu'il n'est pas |
|---|---|
| Noyau de navigation (SPA, routing, fetch) | Générateur de site statique |
| Couche de présentation embarquable | Framework applicatif |
| Registre d'extensions lazy-load | CMS |
| Bibliothèque zéro dépendance (noyau) | Bundle monolithique |

## Palier v1.1 — Interface de référence

**Objectif** : stabiliser ce que l'utilisateur voit et touche. Fondation visuelle immuable.

**Critère de clôture** : `npm run check` passe + `docs/index.html` respecte les invariants de [specs/interface.fr.md](interface.fr.md).

| Issue | Titre | Notes |
|---|---|---|
| #76 | Menu flottant — verre givré, pill, drag & drop | Spec complète dans [interface.fr.md §4-5](interface.fr.md) |
| #17 | Interface responsive et mobile-first | |

## Palier v2.0 — Navigateur de contenu universel

**Objectif** : architecture modulaire + API d'intégration. Le noyau passe sous 200KB. Les extensions sont chargées à la demande. OntoWave peut être embarqué dans un projet hôte sans prendre possession de toute la page.

**Critère de clôture** : `dist/ontowave.js` ≤ 200KB minifié + `createApp({ container })` fonctionne.

| Issue | Titre | Dépend de | Notes |
|---|---|---|---|
| #72 | Types ContentRenderer et ExtensionRegistry | — | Spec dans [architecture.fr.md §4-6](architecture.fr.md) |
| #73 | ExtensionRegistry dynamique dans adapters/ | #72 | |
| #74 | Moteurs lourds extraits en ContentRenderer | #73 | Markdown, Mermaid, KaTeX, Highlight, PlantUML |
| #75 | Split build Vite (noyau + dist/extensions/) | #74 | |
| #77 | Mode composant : `createApp({ container })` | #73 | Voir §2 ci-dessous |
| — | ContentRenderer JSON (premier type non-Markdown) | #74 | Issue à créer au moment de l'implémentation |

### §1 Invariant de taille

`dist/ontowave.js` **ne doit jamais dépasser 200KB** (minifié, avant gzip).

Toute dépendance lourde vit dans `dist/extensions/`. Les extensions ne sont pas des dépendances du noyau.

### §2 Mode composant

En v2.0, `createApp()` accepte un paramètre `container` :

```javascript
// Mode page complète (comportement actuel)
window.ontoWaveConfig = { roots: [...] }
// → OntoWave prend possession du <body>

// Mode composant (nouveau)
const app = createApp({ container: '#notes-viewer', roots: [...] })
app.start()
```

Sans `container`, le comportement actuel est conservé (`bootstrapDom()` crée le shell complet).  
Avec `container`, OntoWave s'insère dans l'élément existant sans toucher au DOM environnant.

Cas d'usage Panini : Pensine-web et PublicationEngine peuvent embarquer OntoWave dans leur propre interface sans conflit DOM.

## Ce qui n'est pas dans cette roadmap

- **Packages npm séparés** (`@ontowave/ext-markdown`) : hors scope, à considérer si le projet gagne des contributeurs externes
- **Config panel visuel** (interface.fr.md §6) : issue à créer en v2.1 une fois v2.0 en place
- **SSR / pré-rendu** : hors scope
- **Types de contenu spécifiques à Panini** (formats propres PaniniFS) : issues à créer dans les repos concernés une fois l'architecture v2.0 disponible
