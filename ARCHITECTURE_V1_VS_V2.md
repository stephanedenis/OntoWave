# 🏗️ Architecture OntoWave : v1 vs v2

## 📖 Contexte Historique

OntoWave a évolué et possède maintenant **deux architectures distinctes** qui coexistent dans le même codebase.

## 🔷 Moteur v1 (Legacy - Original)

### Localisation du Code
- **Fichiers principaux** : `src/router.ts`, `src/markdown.ts`, `src/plantuml.ts`
- **Activation** : Code dans le `else` de `src/main.ts` (ligne 237+)
- **DOM** : Utilise `<div id="app">` (modifié depuis `ontowave-container`)

### Architecture
```
┌─────────────────────────────────────┐
│       src/main.ts (Legacy)          │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Import dynamique :            │  │
│  │ - ./router.ts                 │  │
│  │ - ./markdown.ts               │  │
│  │ - ./plantuml.ts  ← AJOUTÉ    │  │
│  └──────────────────────────────┘  │
│                                     │
│  Logique directement dans main.ts  │
│  - renderRoute()                    │
│  - Gestion hashchange               │
│  - Navigation manuelle              │
└─────────────────────────────────────┘
```

### Caractéristiques
- ✅ **Simple** : Tout le code dans des fichiers plats
- ✅ **Direct** : Logique dans `main.ts`, pas d'abstraction
- ✅ **Support .puml** : Ajouté récemment avec `plantuml.ts`
- ⚠️ **Imports dynamiques** : Code chargé seulement si `engine: "v1"` dans config
- ❌ **Non modulaire** : Difficile à tester, à étendre
- ❌ **Tree-shaking** : Vite exclut le code v1 du bundle par défaut

### Quand v1 est Utilisé ?
```json
// config.json
{
  "engine": "v1",  // ← Active le legacy path
  "sources": { "fr": "index.md" }
}
```

**OU** si `engine` n'est pas spécifié dans de vieux projets (fallback était v1 avant).

## 🔶 Moteur v2 (Moderne - Architecture Propre)

### Localisation du Code
- **Core** : `src/core/` (types, logic)
- **Adapters** : `src/adapters/browser/` (implémentation)
- **App** : `src/app.ts` (orchestration)
- **Activation** : Code dans le `if (engine === 'v2')` de `src/main.ts` (ligne 45+)
- **DOM** : Utilise `<div id="app">`

### Architecture
```
┌─────────────────────────────────────────────────────┐
│              src/main.ts (v2)                       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Import statique :                             │  │
│  │ import { createApp } from './app'             │  │
│  │ import { browserConfig } from 'adapters/..'   │  │
│  │ import { browserContent } from 'adapters/..'  │  │
│  │ import { browserRouter } from 'adapters/..'   │  │
│  │ import { browserView } from 'adapters/..'     │  │
│  │ import { createMd } from 'adapters/..'        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  const app = createApp({                            │
│    config, content, router, view, md, enhance      │
│  })                                                 │
│  app.start()                                        │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│              src/app.ts                             │
│                                                     │
│  export function createApp(deps) {                  │
│    - Dependency Injection                           │
│    - Séparation des responsabilités                 │
│    - Testable                                       │
│  }                                                  │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│         src/core/ (Logique métier)                  │
│                                                     │
│  - types.ts : Interfaces TypeScript                 │
│  - logic.ts : Fonctions pures                       │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│     src/adapters/browser/ (Implémentation)          │
│                                                     │
│  - config.ts : Gestion configuration                │
│  - content.ts : Chargement contenu                  │
│  - router.ts : Navigation                           │
│  - view.ts : Rendu DOM                              │
│  - md.ts : Rendu Markdown                           │
│  - enhance.ts : Post-traitement                     │
│  - navigation.ts : Sidebar, prev/next               │
│  - search.ts : Recherche                            │
│  - configPage.ts : Page configuration               │
│  - bundle.ts : JSON embarqué                        │
└─────────────────────────────────────────────────────┘
```

### Caractéristiques
- ✅ **Architecture Propre** : Séparation Core / Adapters
- ✅ **Testable** : Dependency Injection
- ✅ **Extensible** : Ajouter des adapters (Node, Deno, etc.)
- ✅ **Modulaire** : Chaque responsabilité isolée
- ✅ **Inclus dans le bundle** : Imports statiques → dans le build
- ❌ **Pas de support .puml** : Pas encore implémenté
- ⚠️ **Plus complexe** : Plus de fichiers, plus d'abstraction

### Quand v2 est Utilisé ?
```json
// config.json
{
  "engine": "v2",  // ← Active le moteur moderne (DÉFAUT)
  "sources": { "fr": "index.md" }
}
```

**OU** par défaut si `engine` n'est pas spécifié (depuis la refonte).

## ⚖️ Comparaison Technique

| Aspect | v1 (Legacy) | v2 (Moderne) |
|--------|-------------|--------------|
| **Fichiers** | `router.ts`, `markdown.ts`, `plantuml.ts` | `app.ts`, `core/`, `adapters/` |
| **Imports** | Dynamiques (`import()`) | Statiques (`import`) |
| **Container DOM** | `#app` | `#app` |
| **Architecture** | Procédurale | Modulaire (DI) |
| **Support .puml** | ✅ Oui | ❌ Non |
| **Support .md** | ✅ Oui | ✅ Oui |
| **Support Mermaid** | ✅ Oui | ✅ Oui |
| **Support KaTeX** | ✅ Oui | ✅ Oui |
| **Navigation** | Manuel | Automatique (sidebar, prev/next) |
| **Recherche** | ❌ Non | ✅ Oui |
| **Page Config** | ❌ Non | ✅ Oui |
| **Bundle Build** | ⚠️ Exclu (tree-shaking) | ✅ Inclus |
| **Tests** | Difficile | Facile |
| **Maintenance** | ⚠️ Legacy | ✅ Actif |

## 🚨 Problème Actuel : Support .puml

### Situation
```
┌─────────────────────────────────────────────────────┐
│  Dev (npm run dev) → Vite charge src/main.ts       │
│                                                     │
│  config.json : { "engine": "v1" }                   │
│  ├─→ Charge le else (legacy)                        │
│  ├─→ import('./plantuml')                           │
│  └─→ ✅ .puml fonctionne                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Build (npm run build) → Vite compile vers docs/   │
│                                                     │
│  Par défaut : engine = "v2"                         │
│  ├─→ Charge le if (v2)                              │
│  ├─→ N'inclut PAS plantuml.ts                       │
│  └─→ ❌ .puml ne fonctionne pas                     │
│                                                     │
│  Même avec config.json { "engine": "v1" }:          │
│  ├─→ Code v1 dans le else avec import dynamique    │
│  ├─→ Tree-shaking Vite exclut le code non utilisé  │
│  └─→ ❌ plantuml.ts absent du bundle                │
└─────────────────────────────────────────────────────┘
```

### Vérification
```bash
# Code .puml absent du bundle
grep -o "loadPlantUML\|renderPlantUMLSVG" docs/assets/*.js
# Résultat : (vide)

grep -o "loadPlantUML\|renderPlantUMLSVG" dist/ontowave.min.js
# Résultat : (vide)
```

## 🎯 Solutions Possibles

### Solution 1 : Porter .puml vers v2 ⭐ RECOMMANDÉ

**Pourquoi ?**
- Le v2 est l'architecture **officielle et maintenue**
- Le v1 est **legacy**, destiné à disparaître à terme
- Le v2 a une meilleure **séparation des responsabilités**
- Le code v2 est **toujours dans le bundle** (imports statiques)

**Comment ?**
1. Créer `src/adapters/browser/plantuml-content.ts`
2. Modifier `src/app.ts` pour détecter les routes `.puml`
3. Utiliser les fonctions de `plantuml.ts` (encoder, render SVG)
4. Le build incluera automatiquement le code

**Effort** : ~2h de développement

**Bénéfices** :
- ✅ .puml fonctionne en dev ET en production
- ✅ Pas besoin de spécifier `engine: "v1"`
- ✅ Architecture cohérente
- ✅ Code testable et maintenable

### Solution 2 : Forcer Inclusion v1 dans Bundle

**Comment ?**
Modifier `vite.config.ts` :
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        plantuml: ['./src/plantuml'],  // ← Force inclusion
      },
    },
  },
},
```

**OU** Importer plantuml en statique dans `main.ts` :
```typescript
import { loadPlantUML, renderPlantUMLSVG } from './plantuml'

// Plus d'import dynamique, toujours dans le bundle
```

**Effort** : ~30min

**Problèmes** :
- ⚠️ Augmente la taille du bundle même pour ceux qui n'utilisent pas .puml
- ⚠️ Ne résout pas l'architecture legacy
- ⚠️ Code v1 restera obsolète à terme

### Solution 3 : Deux Builds Séparés

Créer deux configurations :
- `vite.config.v1.ts` → Build v1 avec `<div id="ontowave-container">`
- `vite.config.v2.ts` → Build v2 avec `<div id="app">`

**Problèmes** :
- ❌ Double maintenance
- ❌ Double documentation
- ❌ Confusion pour les utilisateurs

## 📊 Implications à Long Terme

### Scénario 1 : On Garde les Deux Moteurs

**Court terme** :
- ✅ Rétrocompatibilité totale
- ✅ Pas de breaking change

**Long terme** :
- ❌ Double maintenance du code
- ❌ Bugs difficiles à traquer (quel moteur ?)
- ❌ Documentation confuse
- ❌ Bundle plus gros
- ❌ Tests à dupliquer

### Scénario 2 : On Migre tout vers v2 ⭐ RECOMMANDÉ

**Court terme** :
- ⚠️ Effort de migration pour .puml
- ⚠️ Tests à adapter

**Long terme** :
- ✅ Un seul code à maintenir
- ✅ Architecture propre et extensible
- ✅ Facile à tester
- ✅ Documentation claire
- ✅ Bundle optimisé
- ✅ Nouvelles features plus faciles
- ✅ Peut supporter d'autres environnements (Node, Deno)

### Scénario 3 : On Supprime v1 Complètement

**Après migration de .puml vers v2** :

1. Retirer le code v1 de `main.ts` (lignes 237-368)
2. Supprimer `src/router.ts`, `src/markdown.ts` (legacy, dupliqués)
3. Garder `src/plantuml.ts` (réutilisé par v2)
4. Mettre `engine: "v2"` par défaut (déjà le cas)
5. Documenter la migration pour les anciens projets

**Bénéfices** :
- ✅ Codebase plus petit et plus clair
- ✅ Moins de confusion
- ✅ Focus sur une seule architecture

## 🔮 Recommandation Stratégique

### Phase 1 : Porter .puml vers v2 (MAINTENANT)
- Créer l'adapter PlantUML pour v2
- Tests et validation
- Documentation

### Phase 2 : Déprécier v1 (v1.1.0)
- Ajouter warning dans la console si `engine: "v1"`
- Documenter la migration v1→v2
- Marquer v1 comme "deprecated"

### Phase 3 : Retirer v1 (v2.0.0 - Breaking)
- Supprimer complètement le code legacy
- `engine: "v2"` devient l'unique option (paramètre ignoré)
- Codebase simplifié

## 📝 En Résumé

**v1 (Legacy)** :
- 🕰️ Code original, procédural
- 📦 Imports dynamiques → exclu du bundle
- ✅ Support .puml (ajouté récemment)
- ⚠️ À terme : sera supprimé

**v2 (Moderne)** :
- 🏗️ Architecture propre (Core + Adapters)
- 📦 Imports statiques → toujours dans le bundle
- ❌ Pas de support .puml (encore)
- ✅ Avenir du projet

**Action Recommandée** :
👉 **Porter le support .puml vers v2** pour bénéficier de la meilleure architecture et garantir que ça fonctionne en production.

**Temps estimé** : 2 heures de développement + tests.

Voulez-vous que je procède à cette migration ? 🚀
