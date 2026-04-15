# Spécifications — Interface Bootstrap OntoWave

**Langue** : Français (référence) — [English version](interface.en.md)  
**Statut** : Document vivant — toute implémentation doit y être conforme

---

## 1. Principe fondateur

> **La page HTML est quasi-vide. La librairie crée tout le DOM.**

Une page OntoWave correcte contient uniquement :

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

La librairie détecte automatiquement la configuration, crée l'interface et charge le contenu. **L'utilisateur n'a rien à définir en HTML.**

---

## 2. Injection de la configuration

OntoWave **ne requête jamais de fichier de configuration externe**. La configuration doit être injectée par la page hôte avant le chargement de la librairie. Deux API sont disponibles.

### Option A — `window.ontoWaveConfig` (recommandée)

L'API la plus simple : déclarer l'objet de configuration directement dans la page.

```html
<body>
  <script>
    window.ontoWaveConfig = {
      roots: [
        { base: 'fr', root: 'content/fr/' },
        { base: 'en', root: 'content/en/' }
      ],
      i18n: { default: 'fr', supported: ['fr', 'en'] }
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
</body>
```

La librairie lit `window.ontoWaveConfig` et le convertit automatiquement en entrée de `window.__ONTOWAVE_BUNDLE__['/config.json']`.

### Option B — `window.__ONTOWAVE_BUNDLE__` (API bas niveau)

Pour les pages qui doivent injecter plusieurs fichiers en une seule opération (config, nav, sitemap, search-index) — utilisé notamment par les pages de démo.

```html
<script>
  window.__ONTOWAVE_BUNDLE__ = {
    '/config.json': JSON.stringify({ roots: [...], i18n: {...} }),
    '/nav.yml': '[]',
    '/sitemap.json': '{"items":[]}',
    '/search-index.json': '[]'
  };
</script>
```

### Comportement sans configuration

Si aucune API n'est définie, OntoWave démarre en **mode unilingue minimal** :

- Config par défaut : `{ roots: [{ base: '/', root: '/' }] }`
- Charge la page d'accueil : `#/index.md`
- Aucune requête réseau pour trouver une configuration

---

## 3. Bootstrap automatique

Au chargement, la librairie applique l'algorithme suivant :

```
1. Lire la configuration (window.ontoWaveConfig ou window.__ONTOWAVE_BUNDLE__)
2. Si document.getElementById('app') existe → STOP TOTAL (mode custom)
   → Aucun DOM créé, aucun style injecté, aucun menu flottant
3. Sinon → créer le DOM complet :
   a. Injecter <style id="ow-bootstrap-styles"> avec le CSS de base
   b. Créer <div id="ow-content"><div id="app"></div></div>
   c. Créer le menu flottant (§4)
   d. Initialiser le routeur et charger la page par défaut
```

**Le guard `#app` est exclusif** : toute page qui pré-définit `<div id="app">` prend le contrôle total du DOM. OntoWave ne crée rien.

---

## 4. Menu flottant — Spécification visuelle

### 4.1 Identité CSS

| Propriété | Valeur |
|-----------|--------|
| Position | `fixed; top: 20px; left: 20px` |
| Z-index | `1000` |
| Fond | `rgba(255, 255, 255, 0.95)` |
| Flou | `backdrop-filter: blur(10px)` |
| Bordure | `1px solid #e1e4e8` |
| Ombre | `0 4px 12px rgba(27, 31, 35, 0.15)` |
| Curseur | `move` (draggable) |
| Transition | `all 0.3s ease` |
| ID HTML | `#ontowave-floating-menu` |

### 4.2 État compact (défaut)

- **Icône** : `&#127754;` (🌊 emoji natif)
- **Taille de l'icône** : 30×30 px dans une zone de 44×44 px
- **Bounding box réelle** : ≈ 66×66 px (padding + overflow)
- **Border-radius** : 44px (cercle)
- **Contenu visible** : icône seule

```
┌──────────────┐
│     🌊       │  ← 66×66px
└──────────────┘
```

### 4.3 État étendu (après clic sur l'icône)

Le cercle s'allonge **horizontalement** vers la droite pour révéler le brand et les actions. Il ne tombe pas en dropdown.

- **Border-radius** : 22px (pilule)
- **Padding** : 10px 18px
- **Gap entre items** : 10px
- **Animation** : `width: 0 → auto; opacity: 0 → 1; transition: all 0.3s ease`

Contenu visible de gauche à droite :

```
┌─────────────────────────────────────────────────────────────┐
│ 🌊  OntoWave.org  [🏠 Accueil]  [FR]  [EN]  [⚙️ Config]   │
└─────────────────────────────────────────────────────────────┘
```

**Détail des éléments** :

| Élément | Classe CSS | Comportement |
|---------|------------|--------------|
| Icône 🌊 | `.ontowave-menu-icon` | Toggle expand/compact |
| Brand | `.ontowave-menu-brand` | Lien vers ontowave.org (nouvel onglet) |
| 🏠 Accueil | `.ontowave-menu-option` | Charge la page par défaut |
| [FR] [EN] (etc.) | `.ontowave-lang-btn` | Switch de langue instantané |
| ⚙️ Config | `.ontowave-menu-option` | Ouvre le panneau de configuration |

**La marque OntoWave.org est masquée** (display:none ou visibility:hidden) dans l'état compact.

### 4.4 Boutons de langue

- Un bouton par langue déclarée dans `i18n.supported`
- Classe `.active` sur la langue courante
- Langue active : fond vert `#28a745`, texte blanc
- Langue inactive : fond gris clair `#f8f9fa`, bordure `#d0d7de`
- Click → change la langue instantanément (< 100ms), recharge le contenu

### 4.5 Hover

- **Sur le menu compact** : `transform: scale(1.05)`, ombre renforcée `0 6px 20px rgba(27,31,35,0.25)`
- **Sur un `menu-option`** : `transform: translateY(-1px)`, fond légèrement plus sombre
- **Hover désactivé** quand le panneau de configuration est ouvert (classe `.has-config-panel`)

---

## 5. Drag & Drop

### 5.1 Comportement attendu

- **Déclencheur** : `mousedown` / `touchstart` sur le menu en état **compact uniquement**
- **Contrainte** : position limitée au viewport (marges incluses), le menu ne peut pas sortir de l'écran
- **Curseur** : `move` en état compact, `default` en état étendu (classe `.no-drag`)
- **Persistance** : position retenue pour la durée de la session, **non persistée** en localStorage après reload
- **Désactivé quand** : état étendu OU panneau de configuration ouvert

### 5.2 Position initiale

```
top: 20px; left: 20px
```

### 5.3 Support tactile

Le drag doit fonctionner avec un seul doigt sur mobile/tablette (`touchstart`, `touchmove`, `touchend`).

---

## 6. Panneau de configuration ⚙️

*(Spécification future — hors-scope v1)*

Le panneau sera accessible via le bouton ⚙️ dans le menu étendu. Il devra permettre :

- Visualisation et modification de la configuration active
- **Téléchargement HTML** : page autonome avec config inline et CDN
- **Téléchargement JS** : bundle `ontowave.min.js`
- Fermeture par clic en dehors ou touche Échap

Pendant que le panneau est ouvert :
- Le drag du menu est désactivé (classe `.has-config-panel`)
- L'effet hover scale est désactivé

---

## 7. Responsive

### Mobile (≤ 480px)

- Menu flottant : taille réduite (à définir, ≈ 40×40px)
- Position : `top: 10px; left: 10px`
- Zone de contenu : `padding: 1rem`

### Tablette (≤ 768px)

- Menu fonctionnel, taille normale
- Boutons de langue fixes (si `languageButtons: "fixed"`) : `top: 10px; right: 10px`

---

## 8. Ce que la librairie NE DOIT PAS faire

| ❌ Interdit | Raison |
|------------|--------|
| Requérir `<div id="app">` dans le HTML | Brise le principe minimal |
| Requérir `<div id="site-header">` | Idem |
| Requérir `<style>` ou CSS externe | Idem |
| Créer un `<header>` fixe en haut de page | Brise le concept "page = contenu seul" |
| Créer une `<nav>` ou `<aside>` persistante | Idem |
| Créer une sidebar ou TOC dans le layout | Idem — navigation via menu flottant uniquement |
| Rendre impossible l'usage sans JS | La balise `<noscript>` couvre les crawlers SEO |

---

## 9. Règle anti-dérive pour `docs/index.html`

`docs/index.html` est la **référence utilisateur** du projet. Elle doit satisfaire toutes les contraintes de cette spec. Elle ne doit contenir que :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OntoWave</title>
  <meta name="description" content="...">
</head>
<body>
  <noscript><!-- Contenu SEO bilingue (exception documentée) --></noscript>
  <script>
    window.ontoWaveConfig = { roots: [...], i18n: {...} };
  </script>
  <script src="/ontowave.min.js"></script>
</body>
</html>
```

**Exception noscript** : le bloc `<noscript>` contenant du contenu SEO bilingue est la seule exception autorisée au principe "HTML quasi-vide". Ce bloc est destiné aux moteurs de recherche et lecteurs sans JavaScript. Il ne constitue pas une dérive de conception.

**Invariants vérifiables (à tester en CI)** :

- `docs/index.html` ne contient pas `#site-header`
- `docs/index.html` ne contient pas `#sidebar`
- `docs/index.html` ne contient pas `#layout`
- `docs/index.html` ne contient pas de bloc `<style>` hors du `<noscript>`
- Le nombre de lignes hors `<noscript>` est ≤ 20

---

## 10. Multilinguisme

### Modes supportés

| Mode | Config | Exemple URL |
|------|--------|-------------|
| **Unilingue** (défaut) | Sans `i18n` ni `roots` avec bases | `#/index.md`, `#/guide/intro.md` |
| **Côte-à-côte** | Fichiers `.fr.md` et `.en.md` dans le même dossier | `#/fr/index` → charge `index.fr.md` |
| **Dossiers séparés** | Un dossier par langue sous une base | `#/fr/index` → root `/content/fr/` |

### Règle fondamentale

Le multilinguisme est **toujours explicite** — il doit être déclaré dans la config. Sans déclaration `i18n`, OntoWave est unilingue et charge les fichiers `.md` (sans suffixe de langue).

### Détection de la langue initiale

1. Paramètre hash si déjà présent (navigation directe vers `#/fr/...`)
2. `i18n.default` de la config
3. `navigator.language` si la langue détectée est dans `i18n.supported`
4. Première base déclarée dans `roots`

---

## 11. Pages de démo — Deux versions

Les pages de démo dans `docs/demos/` existent en deux versions :

| Version | URL / Fichier | But |
|---------|---------------|-----|
| **CDN** | `*.html` (référencé dans le site) | Démontre l'usage réel avec `@latest` |
| **Locale** | `*.local.html` (ou equivalent CI) | Tests E2E Playwright — charge `/ontowave.min.js` local |

Cette dualité garantit :
- Que le site public démontre toujours l'usage CDN standard
- Que la CI teste toujours le code en cours de développement (pas la version publiée)

---

## 12. Contrat de non-régression

Tout commit modifiant `src/main.ts` ou `src/adapters/` doit satisfaire :

1. Le menu flottant apparaît sur une page sans aucun HTML prédéfini
2. Le menu a l'identité visuelle décrite en §4 (fond blanc translucide, icône 🌊, bordure subtile)
3. Le clic sur l'icône déclenche l'expansion horizontale (pas un dropdown)
4. La langue peut être changée via les boutons du menu
5. La position `docs/index.html` respecte les invariants du §9

---

*Document maintenu par Stéphane Denis — [ontowave.org](https://ontowave.org)*
