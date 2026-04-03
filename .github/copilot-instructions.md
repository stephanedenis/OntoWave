# Instructions GitHub Copilot — OntoWave

## Présentation du projet

**OntoWave** est une bibliothèque JavaScript legère (zéro dépendance, un seul fichier distribué) qui transforme des fichiers Markdown en documentation interactive dans le navigateur. Elle supporte le multilingue, les tableaux alignés, KaTeX, Mermaid, PlantUML et les diagrammes SVG inline.

- Package npm : `ontowave`
- Sites : https://ontowave.org et https://ontowave.com (identiques)
- **Langue principale de rédaction : français** — toute la documentation est rédigée en français
- Les sites sont traduits automatiquement en anglais (fichiers `.en.md` générés ou maintenus en parallèle)
- Licence : CC-BY-NC-SA-4.0
- Auteur : Stéphane Denis

## Stack technique

- **TypeScript** (source dans `src/`) compilé via **Vite**
- **Vitest** pour les tests unitaires (`tests/*.test.ts`)
- **Playwright** pour les tests E2E (`tests/e2e/`) et les tests de démos
- **ESLint + Prettier** pour la qualité du code
- **cSpell** en français pour le correcteur orthographique
- Distribution : `dist/ontowave.js` (module ESM) et `dist/ontowave.min.js` (minifié)

## Structure importante

```
src/
  core/         # Logique pure sans dépendances navigateur (logic.ts, types.ts)
  adapters/     # Implémentations navigateur des interfaces de core
  app.ts        # Point d'entrée de l'application
  index.ts      # Exports publics de la bibliothèque
  markdown.ts   # Moteur de rendu Markdown
  router.ts     # Routage basé sur le hash URL
docs/           # Site public GitHub Pages (ontowave.org/com) ET galerie de démos/tests
tools/          # Scripts de build utilitaires (build-sitemap, build-pages-txt, etc.)
tests/          # Tests Vitest (unitaires) et Playwright (E2E sur les pages de docs/)
```

## Conventions de code

- **TypeScript strict** : toujours typer explicitement les paramètres de fonctions et retours publics
- **Interfaces dans `src/core/types.ts`** : toute nouvelle interface ou type partagé va ici
- **Séparation des préoccupations** : `src/core/` ne doit jamais importer de `src/adapters/` ni d'API navigateur
- **Nommage** : camelCase pour variables/fonctions, PascalCase pour types/interfaces/classes
- **Pas d'effets de bord dans les fonctions pures** de `core/logic.ts`
- Les modules utilisent `export` nommé, pas `export default` (sauf pour `vite.config.*`)

## Galerie de démos (`docs/`)

- Le dossier `docs/` est à la fois le **site public** et la **galerie de référence** des fonctionnalités
- Chaque feature doit avoir une page de démo dans `docs/` qui illustre son comportement et ses limites
- Ces pages servent de cas de test E2E Playwright : elles doivent toujours être à jour et fonctionnelles
- Une feature sans page de démo dans `docs/` n'est pas considérée comme livrée
- Les pages de démo sont rédigées en français (`*.fr.md`) avec leur traduction anglaise (`*.en.md`)

## Tests

- Lancer tous les tests unitaires : `npm test` (Vitest)
- Lancer les tests E2E : `npm run test:e2e` (Playwright)
- Le serveur de docs doit tourner (`npm run dev:docs`) pour les tests E2E
- Chaque nouvelle fonctionnalité doit avoir un test dans `tests/` ET une page de démo dans `docs/`
- Les tests Playwright vérifient : absence d'erreurs console, rendu du contenu, régression visuelle (screenshots)

## Workflow Git & Livraison

### Règles de branchement (non négociables)

- **Aucun commit direct dans `main`** — tout travail passe par une branche de travail
- Chaque branche est associée à un **issue GitHub** : nommage `feat/<numéro>-<slug>`, `fix/<numéro>-<slug>` ou `chore/<numéro>-<slug>`
- La branche est créée depuis `main` à jour et mergée via **Pull Request**
- Les issues et les PR peuvent être **assignés aux agents GitHub Copilot** pour traitement automatique — c'est le mode de travail préféré pour les tâches bien définies

### Critères de merge dans `main`

Avant tout merge, les conditions suivantes doivent être satisfaites :

1. La fonctionnalité est illustrée par une page de démo dans `docs/` (voir section Galerie)
2. Les tests Vitest passent : `npm test`
3. Les tests de régression Playwright passent sur le serveur local : `npm run test:e2e`
4. `npm run check` passe sans erreur (lint + type-check + tests + spell + build)

### Pipeline de déploiement (déclenché par merge dans `main`)

```
merge main → CI build → npm publish (nouveau tag semver) → GitHub Pages update
```

- Un merge dans `main` déclenche automatiquement le build et la publication npm
- Le site public (`docs/`) doit **toujours référencer `ontowave` via la version `latest`** du package npm, exactement comme un utilisateur ordinaire le ferait via CDN (`unpkg.com/ontowave/dist/ontowave.min.js` sans version fixée)

### Smoke-test post-déploiement

Après que le tag `latest` npm est mis à jour, un smoke-test Playwright doit être exécuté sur le **site public réel** (https://ontowave.org) pour valider :

- Chargement sans erreur console
- Rendu correct du contenu Markdown
- Fonctionnement du routing multilingue

## Build & Distribution

- Build complet : `npm run check` (lint + type-check + tests + spell + build)
- Build de la lib : `npm run build`
- Build standalone : `npm run build:standalone`
- Après modification de `vite.config.dist.ts` ou `vite.config.lib.ts`, toujours vérifier que `dist/ontowave.js` reste compatible CDN (pas d'import dynamique, pas de code-splitting)

## Multilingue

- **Langue source : français** (`*.fr.md`) — c'est la version de référence à rédiger en premier
- **Traduction anglaise obligatoire** (`*.en.md`) — chaque page française doit avoir son équivalent anglais pour les sites ontowave.org/com
- Les fichiers de contenu utilisent le suffixe de langue : `index.fr.md`, `index.en.md`
- La configuration de `roots` dans le config JSON permet de mapper des `base` URL vers des `root` de fichiers
- `normalizePath()` dans `src/core/logic.ts` est la référence pour la normalisation des chemins
- Quand on crée ou modifie un fichier `.fr.md`, toujours créer ou mettre à jour le `.en.md` correspondant

## À éviter

- N'ajoute pas de dépendances npm dans `dependencies` — la lib doit rester zéro-dépendance
- N'utilise pas d'API navigateur dans `src/core/` (DOM, fetch, localStorage…)
- N'introduis pas de code-splitting ou de chunks dynamiques dans le build de distribution
- N'écris pas de tests `it.only` ou `test.only` sans retirer le `.only` avant commit
