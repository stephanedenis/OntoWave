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

### Décision de périmètre (v2 en cours)

Le noyau v2 se limite, pour l'instant, à :

- routage + chargement de contenu
- multilinguisme **fr/en** (langue navigateur + config hôte)
- rendu minimal natif des fichiers **`.md`** et **`.txt`**

Hors noyau v2 (pour l'instant) :

- navigation structurée (`nav.yml`)
- recherche (`search-index.json`)

Tout le reste doit être traité via des extensions (lazy-load), y compris les moteurs de rendu avancés et les modules optionnels UI/outillage.

| Issue | Titre | Dépend de | Notes |
|---|---|---|---|
| #72 | Types ContentRenderer et ExtensionRegistry | — | Spec dans [architecture.fr.md §4-6](architecture.fr.md) |
| #73 | ExtensionRegistry dynamique dans adapters/ | #72 | |
| #74 | Moteurs lourds extraits en ContentRenderer | #73 | Markdown, Mermaid, KaTeX, Highlight, PlantUML |
| #75 | Split build Vite (noyau + dist/extensions/) | #74 | |
| #77 | Mode composant : `createApp({ container })` | #73 | Voir §2 ci-dessous |
| — | ContentRenderer JSON (premier type non-Markdown) | #74 | Issue à créer au moment de l'implémentation |

### §1 Invariant de taille

`dist/ontowave.min.js` doit rester **strictement inférieur au seuil annoncé** pour l'itération en cours (minifié, avant gzip).

**Seuil actif : 200 KB** (cible finale v2.0 — alignée sur le premier split build)

> Première itération v2 (issue #75) : noyau séparé des extensions lourdes.
> Taille mesurée après split : **~149 KB** minifié.
> Le seuil est aligné directement sur la cible finale car l'objectif est déjà atteint.

Le seuil est vérifié automatiquement par `node tools/check-dist-size.mjs` (script CI bloquant).

- la valeur active doit être documentée dans cette roadmap
- le contrôle CI doit utiliser cette valeur comme gate bloquante
- le seuil doit converger vers la cible finale (noyau le plus petit possible)

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

### §3 Plan de réalisation (ordre recommandé)

1. Lot A — contrats de types et garde-fous

- Finaliser `ContentRenderer`, `ExtensionRegistry`, `ExtensionConfig` dans `src/core/types.ts`.
- Verrouiller l'API minimale noyau (`.md` et `.txt`) sans dépendance externe.
- Ajouter un test unitaire de contrat de type et de résolution d'extension.

2. Lot B — registre dynamique côté navigateur

- Implémenter `src/adapters/browser/extension-registry.ts` avec `register/load/resolve`.
- Brancher le registre dans le flux de rendu sans modifier l'API publique existante.
- Vérifier que l'absence d'extension n'empêche pas le rendu minimal noyau.

3. Lot C — extraction du rendu Markdown en extension de base

- Déplacer le rendu Markdown avancé vers `src/extensions/markdown.ts`.
- Conserver un fallback noyau `.md` minimal si extension indisponible.
- Implémenter un rendu en deux temps : rendu minimal puis second rendu après chargement extension.
- Ajouter des tests de non-régression de rendu Markdown de base.

4. Lot D — extraction moteurs lourds en lazy extensions

- Extraire Mermaid, KaTeX, Highlight, PlantUML en modules séparés.
- Déclencher le chargement lazy selon détection de besoin dans le contenu.
- Tester l'ordre de chargement et l'absence de chargement inutile.

5. Lot E — split build + mode composant

- Mettre à jour `vite.config.dist.ts` pour produire noyau + `dist/extensions/*`.
- Implémenter `createApp({ container })` sans rupture du mode page complète.
- Mesurer la taille finale du noyau et valider l'invariant ≤ 200KB.

### §3 bis Stratégie de refonte

La refonte v2 peut repartir d'une base nettoyée (suppression/reconstruction de code legacy) si les invariants suivants sont tenus :

- compatibilité fonctionnelle des parcours documentaires existants
- équivalence visuelle du menu flottant (signature actuelle conservée)
- maintien des règles de configuration explicite et des signaux d'erreur `⚠️`

### §4 Plan de tests v2 (obligatoire)

1. Tests unitaires (Vitest)

- Résolution d'extensions par URL et content-type.
- Fallback noyau `.md` et `.txt` quand aucune extension n'est disponible.
- Sélection de langue initiale fr/en (hash, config, navigateur).
- Réécriture des liens avec extensions explicites et ancres.

2. Tests d'intégration navigateur

- Chargement lazy effectif : extension non chargée avant usage, puis chargée à la demande.
- Vérification du rendu en deux temps (avant/après chargement extension).
- Navigation hash sans régression sur liens explicites `.md`.
- Mode composant : aucun effet de bord hors conteneur cible.

3. Tests E2E Playwright

- Parcours profond des liens docs/demos (FR + EN), sans erreur console.
- Validation du comportement en cas d'extension manquante (dégradation propre).
- Vérification du badge `⚠️` en état compact + détail en état menu ouvert.
- Vérification de la présence du menu flottant par défaut (sauf `ui.menu === false`).

4.1 Tests configuration i18n

- Mode unilingue par défaut sans `i18n`.
- Erreur explicite si `i18n` est défini sans `i18n.mode`.
- Validation des deux modes `suffix` et `folder`.

4. Tests build et distribution

- `npm run build:package` produit `dist/ontowave.js` et `dist/extensions/*.js`.
- Contrôle automatique de taille : noyau minifié ≤ 200KB.
- Vérification que `dist/ontowave.js` ne contient pas de moteurs lourds inline.

5. Gate de validation avant merge

- `npm test`
- `npm run test:e2e`
- `npm run check`
- Vérification manuelle rapide sur `https://ontowave.org` après publication (`latest`).

## Ce qui n'est pas dans cette roadmap

- **Packages npm séparés** (`@ontowave/ext-markdown`) : hors scope, à considérer si le projet gagne des contributeurs externes
- **Config panel visuel** (interface.fr.md §6) : issue à créer en v2.1 une fois v2.0 en place
- **SSR / pré-rendu** : hors scope
- **Types de contenu spécifiques à Panini** (formats propres PaniniFS) : issues à créer dans les repos concernés une fois l'architecture v2.0 disponible
