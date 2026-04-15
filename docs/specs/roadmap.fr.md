# Roadmap OntoWave

> Statut : **approuvée** — version gérée par git

## Vision

**OntoWave** est une bibliothèque de navigation pour sites statiques et applications web. Elle transforme des fichiers Markdown en documentation interactive dans le navigateur, avec routing SPA basé sur le hash URL.

**État actuel (v1.x)** : bundle monolithique (~4.7MB non-gzippé), tout est bundlé.  
**Objectif v2.0** : noyau ≤ 200KB (zéro dépendance) + extensions chargées à la demande.

OntoWave s'intègre naturellement dans l'écosystème Panini (PaniniFS, PublicationEngine, Pensine-web) mais n'en dépend pas et ne le suppose pas. Il est utilisable seul par n'importe quel projet.

## Positionnement

| Ce qu'est OntoWave | Ce qu'il n'est pas |
|---|---|
| Bibliothèque de navigation (SPA, routing, fetch) | Générateur de site statique |
| Couche de présentation embarquable | Framework applicatif |
| Bibliothèque zéro dépendance (objectif noyau v2.0) | CMS |

## Palier v1.1 — Interface et API de configuration

**Objectif** : stabiliser ce que l'utilisateur voit et touche + API de configuration recommandée. Fondation immuable pour v2.0.

**Critère de clôture** : `npm run check` passe + `docs/index.html` respecte les invariants de [specs/interface.fr.md](interface.fr.md).

| Issue | Titre | Notes |
|---|---|---|
| #76 | Menu flottant — verre givré, pill, drag & drop | Spec complète dans [interface.fr.md §4-5](interface.fr.md) |
| #17 | Interface responsive et mobile-first | |
| à créer | Implémenter `window.ontoWaveConfig` comme sucre syntaxique | Ref : [interface.fr.md §2](interface.fr.md) — convertit l'objet en `__ONTOWAVE_BUNDLE__['/config.json']` |
| à créer | Pages de démo en deux versions (CDN @latest + local CI) | Ref : [interface.fr.md §11](interface.fr.md) |

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
