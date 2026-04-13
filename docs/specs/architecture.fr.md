# Architecture modulaire OntoWave

> Spec version : 1.0 — 12 avril 2026  
> Statut : **approuvée** — implémentation déléguée aux agents

## §1 Principe fondateur

OntoWave est une bibliothèque de **navigation de contenu**, pas d'un moteur de rendu. Le rendu est une extension parmi d'autres.

Le noyau est responsable de :
- Créer le DOM initial (cf. [specs/interface.fr.md](interface.fr.md))
- Router les URLs (hash-based SPA)
- Récupérer le contenu (fetch + cache)
- Déléguer le rendu à l'extension appropriée selon le type de contenu

Tout le reste (Markdown, Mermaid, KaTeX, coloration syntaxique…) est une **extension**.

## §2 Problème actuel

### Bundle monolithique

Le build produit un seul fichier de ~4,7 MB :

```
dist/ontowave.js ← mermaid (~1.8MB) + highlight.js + katex + markdown-it×7 + yaml
```

Ce bundle est chargé intégralement même pour une page avec un seul titre `# Bonjour`.

### Cause

`src/adapters/browser/enhance.ts` importe statiquement tous les moteurs de rendu
au démarrage, même si le contenu n'en a pas besoin.

### Conséquence

Performance proportionnelle au **bundle** plutôt qu'aux **besoins de la page**.

## §3 Architecture cible

### Vue d'ensemble

```
ontowave.js (~100KB)            ← noyau distribué seul
  ├── bootstrapDom()            — shell visuel (HTML quasi-vide → DOM complet)
  ├── Hash router               — navigation SPA
  ├── Content fetcher           — fetch + cache HTTP
  ├── ContentRenderer registry  — registre avec chargement dynamique
  └── Extension loader          — import() à la demande

dist/extensions/
  ├── markdown.js   (~350KB)   — markdown-it + plugins
  ├── mermaid.js    (~1.8MB)   — mermaid (chargé si bloc ```mermaid détecté)
  ├── katex.js      (~300KB)   — KaTeX
  ├── highlight.js  (~200KB)   — coloration syntaxique
  └── plantuml.js   (~5KB)     — constructeur d'URL Kroki (pas de dépendance lourde)
```

### Invariant de distribution

`dist/ontowave.js` **ne doit jamais dépasser 200KB** (minifié + gzip). Toute
dépendance lourde vit dans `dist/extensions/`.

## §4 Interface ContentRenderer

Toute extension de rendu implémente cette interface.

```typescript
// src/core/types.ts

export interface ContentRenderer {
  /** Identifiant unique de l'extension */
  readonly name: string

  /** Extensions de fichier gérées, ex. ['.md', '.markdown'] */
  readonly handles: string[]

  /**
   * Déclarations de sous-extensions requises.
   * Si ['mermaid', 'katex'] est retourné, le registry les chargera
   * dès que ce renderer sera activé (preload opportuniste).
   */
  readonly requires?: string[]

  /** Retourne true si cette extension peut traiter l'URL donnée */
  canRender(url: string, contentType?: string): boolean

  /** Transforme le contenu source en HTML */
  render(source: string, url: string): Promise<string>
}
```

### Registre des extensions

```typescript
// src/core/types.ts

export interface ExtensionRegistry {
  /** Enregistre une extension déjà chargée */
  register(renderer: ContentRenderer): void

  /**
   * Charge dynamiquement une extension par son identifiant.
   * url = chemin relatif depuis dist/ (ex. 'extensions/markdown.js')
   * L'extension doit exporter un objet ContentRenderer comme export default.
   */
  load(name: string, url: string): Promise<ContentRenderer>

  /** Retourne l'extension capable de rendre l'URL donnée, ou null */
  resolve(url: string, contentType?: string): ContentRenderer | null
}
```

## §5 Configuration des extensions

La configuration JSON déclare les extensions requises par le site :

```json
{
  "roots": [{"base": "/", "root": "/content/"}],
  "i18n": {"default": "fr", "supported": ["fr", "en"]},
  "extensions": {
    "base": ["markdown"],
    "preload": [],
    "lazy": ["mermaid", "katex", "highlight"]
  }
}
```

### Sémantique des champs

| Champ | Comportement |
|---|---|
| `base` | Chargé avec le noyau, nécessaire dès la première page |
| `preload` | Chargé immédiatement après le rendu initial (hint navigateur) |
| `lazy` | Chargé à la demande si le contenu le requiert |

### Résolution automatique des extensions lazy

Quand le `ContentRenderer` Markdown détecte un bloc ` ```mermaid ` dans le
source, il appelle `registry.load('mermaid', ...)` avant de finaliser le rendu.
L'utilisateur ne voit jamais l'état intermédiaire sans Mermaid.

## §6 Mise à jour de AppConfig

```typescript
// src/core/types.ts — ajout au type AppConfig existant

type ExtensionConfig = {
  base?: string[]     // ex. ['markdown']
  preload?: string[]  // chargés juste après le premier rendu
  lazy?: string[]     // chargés à la demande
}

type AppConfig = {
  // ... champs existants inchangés ...
  extensions?: ExtensionConfig
}
```

## §7 Plan de migration — Option C (split de build Vite)

Cette option est choisie car elle livre une amélioration de performance **sans
casser l'API publique ni les tests existants**.

### Étape 1 — Interface ContentRenderer dans types.ts

Ajouter `ContentRenderer`, `ExtensionRegistry`, `ExtensionConfig` à
`src/core/types.ts`. Aucun changement comportemental.

### Étape 2 — Implémenter le registre dans adapters/

Créer `src/adapters/browser/extension-registry.ts` qui implémente `ExtensionRegistry`
avec `import()` dynamique. Le registre remplace progressivement le sous-système
d'enhance statique.

### Étape 3 — Déplacer les moteurs dans des fichiers séparés

Chaque moteur lourd (`mermaid`, `katex`, `highlight`) est extrait dans
un fichier `src/extensions/<name>.ts` qui exporte un `ContentRenderer`.

### Étape 4 — Modifier vite.config.dist.ts

Configurer Vite pour produire :
- `dist/ontowave.js` — noyau (<200KB)
- `dist/extensions/markdown.js` — moteur Markdown complet
- `dist/extensions/mermaid.js` — Mermaid
- `dist/extensions/katex.js` — KaTeX
- `dist/extensions/highlight.js` — Highlight.js

### Étape 5 — Mise à jour de docs/index.html (invariant)

`docs/index.html` reste quasi-vide. La config JSON déclare les extensions
nécessaires. Aucun `<script src="extensions/...">` manuel.

## §8 Règles de non-régression

Après chaque étape :

1. `npm test` passe (Vitest)
2. `npm run test:e2e` passe (Playwright)
3. `npm run build:package` produit `dist/ontowave.js` ≤ 200KB minifié
4. `docs/index.html` ne contient pas de `<script src="extensions/...">`
5. L'API publique (`import { createApp } from 'ontowave'`) reste inchangée

## §9 Ce que cette spec ne couvre pas

- **Types de contenu non-Markdown** (JSON, CSV, HTML) : à spécifier dans une future issue une fois l'architecture en place
- **Packages npm séparés** (`@ontowave/ext-markdown`) : hors scope, à envisager si le projet gagne des contributeurs externes
- **Config panel visuel** : couvert par [interface.fr.md §6](interface.fr.md)
