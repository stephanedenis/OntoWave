# Changelog - OntoWave

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.2] - 2025-10-20

### 🎨 Refactor Majeur - SVG Inline

#### Ajouté
- **Cache SVG intelligent** : Cache in-memory avec TTL 5 minutes pour éviter les re-fetchs
  - Méthodes publiques : `getCachedSVG()`, `cacheSVG()`, `clearSVGCache()`
  - Configuration optionnelle : `svgCache: true/false` (activé par défaut)
  - Performance : 0 requête réseau sur revisites < 5min
  
- **PlantUML SVG inline** : Rendu direct en SVG (comme Mermaid)
  - Fichiers `.puml` : SVG inline direct
  - Blocs Markdown ` ```plantuml ` : SVG inline direct
  - Liens hypertexte natifs : `[[page.md Label]]` cliquables
  
- **Tests complets SVG inline** : Suite de 8 tests Playwright
  - `tests/e2e/svg-inline-validation.spec.js`
  - Validation : SVG inline, liens, cache, performance, régression

#### Modifié
- **Architecture PlantUML unifiée** : Cohérence 100% avec Mermaid (SVG inline)
- **Performance réseau** : -50% requêtes (élimination double-fetch)
- **Bundle size** : 
  - `ontowave.js` : 111 KB → 120 KB (+9 KB)
  - `ontowave.min.js` : 70 KB → 81 KB (+11 KB)

#### Supprimé
- Fonction obsolète `attachPlantUMLLinks()` (remplacée par `processPlantUML()`)
- Handlers `onload` visibles dans les diagrammes
- Bordures CSS indésirables autour des diagrammes PlantUML

#### Corrigé
- Code `onload` apparaissant littéralement après les diagrammes
- Liens PlantUML non cliquables dans les fichiers `.puml`
- Double-fetch des SVG PlantUML (fetch initial + re-fetch pour liens)
- Configuration `baseUrl` incorrecte dans démos (07, 05)

### 📚 Documentation
- Ajout `REFACTOR_SVG_INLINE.md` : Documentation technique complète du refactor

### 🎯 Compatibilité
- **Breaking changes** : AUCUN
- Rétrocompatibilité 100% : même API, mêmes fichiers .puml, même syntaxe Markdown

---

## [1.0.1] - 2025-10-19

### Ajouté
- **Tableaux Markdown** : Support complet avec alignements (`:---`, `:---:`, `---:`)
  - Parser regex pour délimiteurs `|`
  - Injection CSS inline pour `text-align`
  - Styles responsive + hover effects
  - Test : `docs/test-tables.md`

- **Support fichiers .puml** : Chargement direct de fichiers PlantUML
  - Détection extension `.puml` dans `loadPage()`
  - Encodage UTF-8 → hex pour serveur PlantUML
  - Rendu via https://www.plantuml.com/plantuml/svg/
  - Test : `docs/test-navigation.puml`

- **Liens cliquables PlantUML** : Liens SVG dans diagrammes
  - Syntaxe : `[[page.md Label]]`
  - Fetch SVG + parsing liens `<a href>`
  - Event listeners pour navigation OntoWave
  - Navigation sans rechargement page

- **Détection automatique langue navigateur**
  - Lecture `navigator.language` au démarrage
  - Redirection auto vers page langue (ex: `index.en.md`)
  - Fallback langue configurée si non supportée

### Modifié
- Bundle non-minifié : 103 KB → 111 KB (+8 KB)
- Bundle minifié : 70 KB (inchangé)

### Corrigé
- Menu flottant préservé (pas de régression)

### Tests
- Tests Playwright : 10/21 PASS
- Fichiers test créés : `test-tables.md`, `test-navigation.puml`

---

## [1.0.0] - 2025-10-15

### 🎉 Version Initiale

#### Fonctionnalités Principales
- **Framework Documentation JavaScript** : Package complet pour sites de documentation
- **Routing Hash-Based** : Navigation SPA sans rechargement
- **Support Markdown** : Rendu complet avec Marked.js
- **Diagrammes Mermaid** : Intégration native avec mermaid.js
- **Diagrammes PlantUML** : Support basique via serveur externe
- **Internationalisation (i18n)** : Multi-langue avec détection auto
- **Menu Flottant** : Navigation draggable avec persistance localStorage
- **Thèmes** : Support dark/light mode
- **Coloration Syntaxe** : Prism.js pour blocs de code
- **Responsive** : Design adaptatif mobile/tablette/desktop

#### API
- Configuration JSON : `window.ontoWaveConfig`
- Support URL : CDN jsdelivr.net
- Format : UMD (Browser + Node.js)

#### Bundle
- `ontowave.js` : 103 KB (non-minifié)
- `ontowave.min.js` : 70 KB (minifié)
- Dépendances incluses : Marked, Mermaid, Prism

---

## Légende

- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements dans fonctionnalités existantes
- **Supprimé** : Fonctionnalités retirées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Corrections de vulnérabilités
- **Déprécié** : Fonctionnalités bientôt retirées

---

## Liens

- [Repository GitHub](https://github.com/stephanedenis/OntoWave)
- [npm Package](https://www.npmjs.com/package/ontowave)
- [Documentation](https://ontowave.org)
- [Issues](https://github.com/stephanedenis/OntoWave/issues)
